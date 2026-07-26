import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { getConfirmationEmailHtml } from "@/lib/emails/confirmation";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Create user using Admin API (starts unconfirmed, doesn't trigger Supabase default email)
    const { data: userData, error: createErr } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName?.trim() || "" },
    });

    if (createErr) {
      if (createErr.message.toLowerCase().includes("already registered") || createErr.message.toLowerCase().includes("already exists")) {
        return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 400 });
      }
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // 2. Generate Supabase confirmation link dynamically
    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const dynamicUrl = host && !host.includes("localhost") ? `${protocol}://${host}` : null;
    const baseUrl = dynamicUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://compxorbit.com";

    const { data: linkData } = await admin.auth.admin.generateLink({
      type: "signup",
      email: email.trim(),
      password,
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      },
    });

    let confirmationLink = `${baseUrl}/auth/callback?next=/dashboard`;
    if (linkData?.properties?.action_link) {
      confirmationLink = linkData.properties.action_link;
    } else if (linkData?.properties?.hashed_token) {
      confirmationLink = `${baseUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=signup&next=/dashboard`;
    }

    // 3. Send single branded confirmation email via Resend
    const html = getConfirmationEmailHtml({
      firstName: fullName?.trim() || email.split("@")[0],
      confirmationLink,
    });

    const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>";

    await resend.emails.send({
      from: fromEmail,
      to: email.trim(),
      subject: "Confirm your CompX Orbit account",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}