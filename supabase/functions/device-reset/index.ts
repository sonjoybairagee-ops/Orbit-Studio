// ============================================================
// POST /device-reset
// Auth: signed-in customer (Authorization: Bearer <supabase jwt>)
// Body: { licenseId, reason? }
// Raises a reset request from the web dashboard when the user no
// longer has access to the old machine.
// ============================================================
import { admin, json, preflight, logEvent, callerUser } from "../_shared/lib.ts";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const user = await callerUser(req);
  if (!user) return json({ error: "Please sign in first." }, 401);

  const db = admin();
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const licenseId = String(body.licenseId ?? "");
  const reason = body.reason ? String(body.reason).slice(0, 500) : null;

  const { data: lic } = await db
    .from("licenses")
    .select("id, user_id, status, last_reset_at, reset_count, max_devices")
    .eq("id", licenseId)
    .eq("user_id", user.id)      // ownership check
    .maybeSingle();

  if (!lic) return json({ error: "License not found." }, 404);
  if (lic.status !== "active") {
    return json({ error: "Only active licenses can be reset." }, 403);
  }

  // ---- 24h cooldown ----
  const last = lic.last_reset_at ? new Date(lic.last_reset_at).getTime() : 0;
  const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - last));
  if (remaining > 0) {
    const hours = Math.ceil(remaining / 3_600_000);
    return json({
      error: `You already reset this license recently. Next reset is available in about ${hours} hour(s).`,
      code: "COOLDOWN",
      retryAfterSeconds: Math.ceil(remaining / 1000),
    }, 429);
  }

  // ---- one pending request at a time ----
  const { data: pending } = await db
    .from("device_reset_requests")
    .select("id, created_at")
    .eq("license_id", lic.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pending) {
    return json({
      error: "A reset request is already awaiting review.",
      code: "PENDING",
      requestId: pending.id,
    }, 409);
  }

  const { data: request, error } = await db
    .from("device_reset_requests")
    .insert({ license_id: lic.id, user_id: user.id, reason, status: "pending" })
    .select("id")
    .single();

  if (error) return json({ error: "Could not create the request. Please try again." }, 500);

  await logEvent(db, req, "reset_request", {
    licenseId: lic.id, userId: user.id, meta: { reason },
  });

  return json({
    ok: true,
    requestId: request.id,
    message: "Reset request submitted. You will get an email once it is reviewed.",
  });
});
