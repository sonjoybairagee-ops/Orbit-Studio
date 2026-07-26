import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Send to support inbox
    await resend.emails.send({
      from: "CompX Orbit <noreply@compxorbit.com>",
      to: ["support@compxorbit.com"],
      replyTo: email,
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#080a0f;color:#f7f8fb;padding:32px;border-radius:16px;border:1px solid rgba(69,198,109,.2)">
          <div style="margin-bottom:24px">
            <h2 style="margin:0;color:#45c66d;font-size:20px">New Contact Form Submission</h2>
            <p style="margin:4px 0 0;color:#9198a8;font-size:13px">CompX Orbit — support@compxorbit.com</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;color:#9198a8;font-size:13px;width:100px">Name</td><td style="padding:8px 0;font-size:14px"><strong>${name}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#9198a8;font-size:13px">Email</td><td style="padding:8px 0;font-size:14px"><a href="mailto:${email}" style="color:#45c66d">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#9198a8;font-size:13px">Subject</td><td style="padding:8px 0;font-size:14px">${subject}</td></tr>
          </table>
          <div style="background:#0f1219;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;line-height:1.75;white-space:pre-wrap">${message}</p>
          </div>
          <p style="margin:0;color:#9198a8;font-size:12px">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "CompX Orbit Support <support@compxorbit.com>",
      to: [email],
      subject: "We received your message — CompX Orbit",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#080a0f;color:#f7f8fb;padding:32px;border-radius:16px;border:1px solid rgba(69,198,109,.2)">
          <h2 style="margin:0 0 8px;color:#45c66d">Message received ✅</h2>
          <p style="color:#9198a8;margin:0 0 24px;font-size:14px">Hi ${name}, we got your message and will reply within 24 hours.</p>
          <div style="background:#0f1219;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 6px;color:#9198a8;font-size:11px;text-transform:uppercase;letter-spacing:.08em">Your message</p>
            <p style="margin:0;font-size:14px;line-height:1.75;white-space:pre-wrap">${message}</p>
          </div>
          <p style="margin:0;color:#9198a8;font-size:13px">If urgent, reply directly to this email.<br/>— CompX Orbit Team</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
