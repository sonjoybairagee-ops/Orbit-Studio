import { NextRequest, NextResponse } from "next/server";
import { saveGiveawayClaim, GIVEAWAY_CONFIG } from "@/lib/giveaway";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, socialShareUrl, preferredApp } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!socialShareUrl || typeof socialShareUrl !== "string") {
      return NextResponse.json(
        { error: "Please provide the link to your social media share post." },
        { status: 400 }
      );
    }

    // Validate URL syntax
    let trimmedUrl = socialShareUrl.trim();
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      trimmedUrl = "https://" + trimmedUrl;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      return NextResponse.json(
        { error: "Please provide a valid web link (e.g. https://facebook.com/...)" },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const result = await saveGiveawayClaim({
      fullName: fullName.trim(),
      email: email.trim(),
      socialShareUrl: trimmedUrl,
      preferredApp: preferredApp || "BOTH",
      ipAddress,
      userAgent,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to record giveaway entry. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <noreply@compxorbit.com>";

        await resend.emails.send({
          from: fromEmail,
          to: [email.trim()],
          subject: "🎉 You're Entered! CompX Orbit 50 Free Licenses Giveaway",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #060a08; color: #e7eee9; padding: 36px 28px; border-radius: 16px; border: 1px solid rgba(60, 255, 95, 0.25);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background: #102a16; border: 1px solid #2a5234; color: #3cff5f; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">
                  🎉 Official Entry Confirmed
                </span>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 16px 0 8px;">
                  You're in the 50 Free Licenses Lucky Draw!
                </h1>
                <p style="color: #8da194; font-size: 14px; margin: 0;">
                  Hi ${fullName.trim()}, we have successfully recorded your submission.
                </p>
              </div>

              <div style="background: #0d1510; border: 1px solid #1e2e23; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #3cff5f; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">
                  Your Submission Details
                </h3>
                <p style="margin: 6px 0; font-size: 13px; color: #afbeb4;">
                  <strong>Registered Email:</strong> <span style="color: #ffffff;">${email.trim()}</span>
                </p>
                <p style="margin: 6px 0; font-size: 13px; color: #afbeb4;">
                  <strong>Verified Social Post:</strong> <a href="${trimmedUrl}" target="_blank" style="color: #3cff5f; text-decoration: underline; word-break: break-all;">${trimmedUrl}</a>
                </p>
                <p style="margin: 6px 0; font-size: 13px; color: #afbeb4;">
                  <strong>Prize:</strong> <span style="color: #ffffff;">CompX Orbit Studio Lifetime Activation License</span>
                </p>
              </div>

              <div style="border-left: 3px solid #3cff5f; padding-left: 14px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #8da194; line-height: 1.6;">
                  ⏳ <strong>Winner Announcement in 30 Days:</strong> 50 winners will be randomly drawn at the end of the campaign. Lucky winners will receive their activation key and setup guide right here in their inbox!
                </p>
              </div>

              <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #1a271f; font-size: 12px; color: #62756a;">
                CompX Orbit Studio — 7 Docked Creative Workspaces for Adobe After Effects & Premiere Pro<br/>
                <a href="${GIVEAWAY_CONFIG.SITE_URL}" style="color: #3cff5f; text-decoration: none;">compxorbit.com</a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        // Non-blocking email failure
        console.warn("[GIVEAWAY_CLAIM] Could not send confirmation email:", emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "🎉 Your entry has been recorded! 50 winners will be announced in 30 days.",
    });
  } catch (err: any) {
    console.error("[GIVEAWAY_CLAIM] Error:", err);
    return NextResponse.json(
      { error: "Server error processing giveaway entry." },
      { status: 500 }
    );
  }
}
