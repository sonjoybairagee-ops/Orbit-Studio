import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getConfirmationEmailHtml } from "@/lib/emails/confirmation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const dynamicUrl = host && !host.includes("localhost") ? `${protocol}://${host}` : null;
    const baseUrl = dynamicUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://compxorbit.com";

    // Generate official Supabase email confirmation link with token_hash using Admin Client
    const admin = createAdminClient();
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "signup",
      email: email.trim(),
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

    const html = getConfirmationEmailHtml({
      firstName: firstName || email.split("@")[0],
      confirmationLink,
    });

    const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Confirm your CompX Orbit account",
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message || error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
