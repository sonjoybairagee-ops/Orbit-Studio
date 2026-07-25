import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resetCooldownRemainingMs } from "@/lib/license";

// Customer releases one of their own device seats from the dashboard.
// Mirrors the license-deactivate Edge Function used by the extension:
// same 24 hour cooldown, same audit trail.
const schema = z.object({
  licenseId: z.string().uuid(),
  activationId: z.string().uuid(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Ownership check runs through the user's own session, so RLS applies.
  const { data: license } = await supabase
    .from("licenses")
    .select("id, status, last_reset_at, reset_count")
    .eq("id", parsed.data.licenseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!license)
    return NextResponse.json({ error: "License not found." }, { status: 404 });

  if (license.status !== "active")
    return NextResponse.json(
      { error: "Only active licenses can be changed." },
      { status: 403 },
    );

  const remaining = resetCooldownRemainingMs(license.last_reset_at);
  if (remaining > 0) {
    const hours = Math.ceil(remaining / 3_600_000);
    return NextResponse.json(
      {
        error: `Device changes are limited to once every 24 hours. Try again in about ${hours} hour(s), or contact support for a forced reset.`,
        code: "COOLDOWN",
        retryAfterSeconds: Math.ceil(remaining / 1000),
      },
      { status: 429 },
    );
  }

  const svc = createAdminClient();

  const { data: seat } = await svc
    .from("activations")
    .select("id, device_hash, device_label")
    .eq("id", parsed.data.activationId)
    .eq("license_id", license.id)
    .eq("status", "active")
    .maybeSingle();

  if (!seat)
    return NextResponse.json(
      { error: "That device is not currently active." },
      { status: 404 },
    );

  await svc
    .from("activations")
    .update({ status: "released", released_at: new Date().toISOString() })
    .eq("id", seat.id);

  await svc
    .from("licenses")
    .update({
      last_reset_at: new Date().toISOString(),
      reset_count: (license.reset_count ?? 0) + 1,
    })
    .eq("id", license.id);

  await svc.from("license_events").insert({
    license_id: license.id,
    user_id: user.id,
    event: "deactivate",
    device_hash: seat.device_hash,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { source: "dashboard", device_label: seat.device_label },
  });

  return NextResponse.json({
    ok: true,
    message:
      "Device released. You can activate on a new computer right away; the next change unlocks in 24 hours.",
  });
}
