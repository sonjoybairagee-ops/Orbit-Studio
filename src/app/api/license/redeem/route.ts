import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ key: z.string().min(6).max(64) });

// The RPC raises bare codes; turn them into something a customer can act on.
const MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Please sign in first.",
  KEY_NOT_FOUND: "We could not find that key. Check it for typos.",
  ALREADY_CLAIMED:
    "That key is already attached to another account. Contact support if this is yours.",
  KEY_NOT_ACTIVE: "That key is no longer active. Please contact support.",
  EMAIL_MISMATCH:
    "That key was sent to a different email address. Sign in with that address instead.",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a licence key." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: MESSAGES.AUTH_REQUIRED }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("claim_license", {
    p_key: parsed.data.key,
  });

  if (error) {
    const code = Object.keys(MESSAGES).find((c) => error.message.includes(c));
    return NextResponse.json(
      { error: code ? MESSAGES[code] : "Could not redeem that key." },
      { status: code === "ALREADY_CLAIMED" ? 409 : 400 },
    );
  }

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ ok: true, key: row?.key ?? null });
}
