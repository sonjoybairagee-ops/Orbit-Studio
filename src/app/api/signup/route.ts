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

    // 1. Create the user directly via the Admin API.
    //    email_confirm: false => user starts unconfirmed (they must click the link).
    //    Crucially, this does NOT trigger Supabase's own built-in confirmation
    //    email the way client-side auth.signUp() does — only our custom Resend
    //    email below will be sent, so there is exactly one email per signup.
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName?.trim() || "" },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Generate a real, valid confirmation token/link for this user.
    const host = req.headers.get("host") || "";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const dynamicUrl = host && !host.includes("localhost") ? `${protocol}://${host}` : null;
    const baseUrl =
      dynamicUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://compxorbit.com";

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email: email.trim(),
      password,
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
      },
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    let confirmationLink = "";
    if (linkData?.properties?.action_link) {
      confirmationLink = linkData.properties.action_link;
    } else if (linkData?.properties?.hashed_token) {
      confirmationLink = `${baseUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=email&next=/dashboard`;
    }

    // 3. Send the branded confirmation email directly via Resend
    //    (no internal fetch to another route — avoids 404s and duplicate calls).
    const html = getConfirmationEmailHtml({
      firstName: fullName?.trim() || email.split("@")[0],
      confirmationLink,
    });

    const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>";

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: email.trim(),
      subject: "Confirm your CompX Orbit account",
      html,
    });

    if (sendError) {
      // User is already created in Supabase; report the email failure but
      // don't block on it — they can still use "resend confirmation" later.
      console.error("Resend send error:", sendError);
    }

    return NextResponse.json({ success: true, userId: userData?.user?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}