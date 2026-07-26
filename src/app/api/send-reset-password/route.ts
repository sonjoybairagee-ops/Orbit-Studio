import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getResetPasswordEmailHtml } from "@/lib/emails/resetPassword";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const dynamicUrl = host && !host.includes("localhost") ? `${protocol}://${host}` : null;
    const baseUrl = dynamicUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://compxorbit.com";

    const redirectTo = `${baseUrl}/auth/callback?next=/reset-password`;

    const admin = createAdminClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
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
