import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resetCooldownRemainingMs } from "@/lib/license";

// Raised when the customer no longer has access to the old computer and
// therefore cannot release the seat themselves. An admin reviews it.
const schema = z.object({
  licenseId: z.string().uuid(),
  reason: z.string().max(500).optional(),
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

  const { data: license } = await supabase
    .from("licenses")
    .select("id, status, last_reset_at, max_devices")
    .eq("id", parsed.data.licenseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!license)
    return NextResponse.json({ error: "License not found." }, { status: 404 });

  if (license.status !== "active")
    return NextResponse.json(
      { error: "Only active licenses can be reset." },
      { status: 403 },
    );

  const maxDevices = license.max_devices ?? 1;
  // Apply 24h cooldown check only for single-device licenses
  if (maxDevices === 1) {
    const remaining = resetCooldownRemainingMs(license.last_reset_at);
    if (remaining > 0) {
      const hours = Math.ceil(remaining / 3_600_000);
      return NextResponse.json(
        {
          error: `You already changed devices recently. The next reset unlocks in about ${hours} hour(s).`,
          code: "COOLDOWN",
          retryAfterSeconds: Math.ceil(remaining / 1000),
        },
        { status: 429 },
      );
    }
  }

  const { data: existing } = await supabase
    .from("device_reset_requests")
    .select("id")
    .eq("license_id", license.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing)
    return NextResponse.json(
      { error: "A reset request is already awaiting review.", code: "PENDING" },
      { status: 409 },
    );

  const svc = createAdminClient();
  const { error } = await svc.from("device_reset_requests").insert({
    license_id: license.id,
    user_id: user.id,
    reason: parsed.data.reason ?? null,
    status: "pending",
  });

  if (error)
    return NextResponse.json(
      { error: "Could not submit the request. Please try again." },
      { status: 500 },
    );

  await svc.from("license_events").insert({
    license_id: license.id,
    user_id: user.id,
    event: "reset_request",
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { reason: parsed.data.reason ?? null, source: "dashboard" },
  });

  return NextResponse.json({
    ok: true,
    message: "Request submitted. We will email you once it has been reviewed.",
  });
}
