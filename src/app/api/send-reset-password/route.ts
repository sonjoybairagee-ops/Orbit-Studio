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
    
    // Generate password reset link from Supabase Auth Admin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.trim(),
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
      },
    });

    if (linkError) {
      // For security, don't expose error to public if user not found
      return NextResponse.json({ success: true });
    }

    const resetLink = linkData?.properties?.action_link || `${baseUrl}/reset-password`;

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
