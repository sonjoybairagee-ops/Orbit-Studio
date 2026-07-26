import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles every redirect that comes back from Supabase Auth:
//   - Google (and any future OAuth provider)
//   - email confirmation links
//   - password recovery links
//
// Supabase sends a one-time `code` which we exchange for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as any;
  const token = searchParams.get("token");
  const next = searchParams.get("next") ?? "/dashboard";

  // Supabase reports failures as query params rather than HTTP errors.
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (authError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(authError)}`,
    );
  }

  const supabase = await createClient();

  // 1. Handle standard Supabase email confirmation with token_hash & type
  if (tokenHash) {
    const otpTypes = [type, "signup", "email", "magiclink"].filter(Boolean);
    for (const otpType of otpTypes) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType as any,
      });
      if (!error) {
        const safeNext = next.startsWith("/") ? next : "/dashboard";
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  // 2. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // 3. Fallback: Check if user is already signed in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const safeNext = next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Sign-in link expired or invalid.")}`,
  );
}
