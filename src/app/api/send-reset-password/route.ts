import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getResetPasswordEmailHtml } from "@/lib/emails/resetPassword";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get request headers or env to determine site URL
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
    const baseUrl = envUrl && !envUrl.includes("localhost") ? envUrl : (origin ? new URL(origin).origin : "http://localhost:3000");

    const redirectTo = `${baseUrl}/auth/callback?next=/reset-password`;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.trim(),
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      return NextResponse.json({ success: true });
    }

    let resetLink = linkData?.properties?.action_link || "";
    
    // Ensure the generated link redirects back to our callback route correctly
    if (resetLink) {
      const parsedUrl = new URL(resetLink);
      parsedUrl.searchParams.set("redirect_to", redirectTo);
      resetLink = parsedUrl.toString();
    } else {
      resetLink = `${baseUrl}/forgot-password`;
    }

    const html = getResetPasswordEmailHtml({
      firstName: email.split("@")[0],
      resetLink,
    });

    const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Reset your CompX Orbit password",
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message || error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send reset email" }, { status: 500 });
  }
}
