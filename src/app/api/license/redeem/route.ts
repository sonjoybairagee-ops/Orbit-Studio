import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ key: z.string().min(4) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid licence key." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const rawKey = parsed.data.key.trim();
  const cleanKeyAlpha = rawKey.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const admin = createAdminClient();

  // 1. First attempt exact match
  let { data: license } = await admin
    .from("licenses")
    .select("id, key, user_id, status")
    .ilike("key", rawKey)
    .maybeSingle();

  // 2. If not found, fetch active licenses without user_id and match cleaned key
  if (!license) {
    const { data: allLicenses } = await admin
      .from("licenses")
      .select("id, key, user_id, status")
      .is("user_id", null);

    if (allLicenses) {
      license = allLicenses.find((l) => {
        const lClean = l.key.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        return lClean === cleanKeyAlpha;
      }) ?? null;
    }
  }

  if (!license) {
    return NextResponse.json({ error: "We could not find that key. Check it for typos." }, { status: 400 });
  }

  if (license.user_id && license.user_id !== user.id) {
    return NextResponse.json({ error: "That key is already attached to another account." }, { status: 409 });
  }

  if (license.status !== "active") {
    return NextResponse.json({ error: "That key is no longer active." }, { status: 400 });
  }

  // Bind license to user
  const { error: updateErr } = await admin
    .from("licenses")
    .update({
      user_id: user.id,
      legacy_email: user.email?.trim().toLowerCase(),
    })
    .eq("id", license.id);

  if (updateErr) {
    return NextResponse.json({ error: "Could not redeem that key. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, key: license.key });
}
