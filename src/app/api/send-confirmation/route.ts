import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { getConfirmationEmailHtml } from "@/lib/emails/confirmation";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, token } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmationLink = `${baseUrl}/auth/callback?token=${token}`;

    const html = getConfirmationEmailHtml({
      firstName: firstName || email.split("@")[0],
      confirmationLink,
    });

    const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <onboarding@resend.dev>";

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
