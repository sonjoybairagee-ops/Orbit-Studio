// ============================================================
// POST /admin-force-reset
// Auth: admin only
// Body: { licenseId, reason, requestId?, deviceHash?, action? }
//   action: 'force_reset' (default) | 'approve' | 'reject'
//            | 'revoke' | 'suspend' | 'reactivate'
// Breaks the 24h cooldown. Reason is mandatory and audited.
// ============================================================
import { admin, json, preflight, logEvent, callerAdmin } from "../_shared/lib.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const actor = await callerAdmin(req);
  if (!actor) return json({ error: "Admin access required." }, 403);

  const db = admin();
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const action = String(body.action ?? "force_reset");
  const reason = String(body.reason ?? "").trim();
  if (reason.length < 3) {
    return json({ error: "A reason is required for every admin action." }, 400);
  }

  // ---------- reject a pending request ----------
  if (action === "reject") {
    if (!body.requestId) return json({ error: "requestId is required." }, 400);
    await db.from("device_reset_requests").update({
      status: "rejected",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", body.requestId).eq("status", "pending");

    await logEvent(db, req, "reset_reject", {
      actorId: actor.id, meta: { requestId: body.requestId, reason },
    });
    return json({ ok: true, message: "Request rejected." });
  }

  // ---------- resolve the target license ----------
  let licenseId = body.licenseId ? String(body.licenseId) : null;
  if (!licenseId && body.requestId) {
    const { data: rr } = await db
      .from("device_reset_requests")
      .select("license_id")
      .eq("id", body.requestId)
      .maybeSingle();
    licenseId = rr?.license_id ?? null;
  }
  if (!licenseId) return json({ error: "licenseId or requestId is required." }, 400);

  const { data: lic } = await db
    .from("licenses")
    .select("id, user_id, key, status, reset_count")
    .eq("id", licenseId)
    .maybeSingle();
  if (!lic) return json({ error: "License not found." }, 404);

  // ---------- status changes ----------
  if (action === "revoke" || action === "suspend") {
    const nextStatus = action === "revoke" ? "revoked" : "suspended";
    await db.from("licenses").update({
      status: nextStatus,
      revoked_at: action === "revoke" ? new Date().toISOString() : null,
      revoked_reason: reason,
    }).eq("id", lic.id);

    // kill every seat so the next heartbeat locks the panel
    await db.from("activations").update({
      status: "blocked", released_at: new Date().toISOString(),
    }).eq("license_id", lic.id).eq("status", "active");

    await logEvent(db, req, action, {
      licenseId: lic.id, userId: lic.user_id, actorId: actor.id, meta: { reason },
    });
    return json({ ok: true, message: `License ${nextStatus}.` });
  }

  if (action === "reactivate") {
    await db.from("licenses").update({
      status: "active", revoked_at: null, revoked_reason: null,
    }).eq("id", lic.id);

    await logEvent(db, req, "reactivate", {
      licenseId: lic.id, userId: lic.user_id, actorId: actor.id, meta: { reason },
    });
    return json({ ok: true, message: "License reactivated." });
  }

  // ---------- force reset / approve ----------
  // Releases seats and IGNORES the 24h cooldown by clearing last_reset_at.
  const seatQuery = db
    .from("activations")
    .update({ status: "released", released_at: new Date().toISOString() })
    .eq("license_id", lic.id)
    .eq("status", "active");

  if (body.deviceHash) seatQuery.eq("device_hash", String(body.deviceHash));
  await seatQuery;

  const forced = action === "force_reset";
  await db.from("licenses").update({
    // forced reset clears the cooldown entirely so the customer can
    // activate immediately; a normal approval starts a fresh 24h window.
    last_reset_at: forced ? null : new Date().toISOString(),
    reset_count: (lic.reset_count ?? 0) + 1,
  }).eq("id", lic.id);

  if (body.requestId) {
    await db.from("device_reset_requests").update({
      status: "approved",
      forced,
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", body.requestId);
  }

  await logEvent(db, req, forced ? "force_reset" : "reset_approve", {
    licenseId: lic.id, userId: lic.user_id, actorId: actor.id,
    deviceHash: body.deviceHash ?? null,
    meta: { reason, requestId: body.requestId ?? null, cooldownBroken: forced },
  });

  return json({
    ok: true,
    message: forced
      ? "Devices released and cooldown cleared. The customer can activate immediately."
      : "Reset approved. A fresh 24 hour cooldown has started.",
  });
});
