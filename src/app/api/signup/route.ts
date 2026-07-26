import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Create user using Admin API to bypass duplicate email blocks & handle clean signup
    const { data, error } = await admin.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName?.trim() || "" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Trigger custom Resend email
    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const dynamicUrl = host && !host.includes("localhost") ? `${protocol}://${host}` : null;
    const baseUrl = dynamicUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://compxorbit.com";

    try {
      await fetch(`${baseUrl}/api/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: fullName?.trim() || email.split("@")[0],
        }),
      });
    } catch (e) {
      console.error("Resend notification error:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}