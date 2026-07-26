import crypto from "crypto";

// Ensure you have a SECRET_KEY in your .env
const SECRET = process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback_secret_for_dev";

export function generateUnsubscribeToken(email: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(email);
  return hmac.digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = generateUnsubscribeToken(email);
  return expected === token;
}
