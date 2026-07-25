// ============================================================
// POST /license-heartbeat
// Body: { key, fingerprint, hostApp?, appVersion? }
// Called once per 24h (and on panel start when online).
// Renews the entitlement token and applies revocations fast.
// ============================================================
import {
  admin, json, preflight, logEvent, normalizeKey,
  signEntitlement, loadLicense, licenseProblem, entitlementSlugs,
} from "../_shared/lib.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const key = normalizeKey(body.key);
  const fingerprint = String(body.fingerprint ?? "").trim();
  if (!key || !fingerprint) return json({ error: "Missing key or fingerprint" }, 400);

  const lic = await loadLicense(db, key);
  const problem = licenseProblem(lic);
  if (problem) {
    await logEvent(db, req, "heartbeat", {
      licenseId: lic?.id ?? null, deviceHash: fingerprint,
      meta: { result: "invalid", reason: problem },
    });
    // valid:false tells the panel to drop its cached token immediately.
    return json({ valid: false, error: problem }, 403);
  }

  // The seat must still be active — an admin reset kills it here.
  const { data: seat } = await db
    .from("activations")
    .select("id, status, host_apps")
    .eq("license_id", lic.id)
    .eq("device_hash", fingerprint)
    .eq("status", "active")
    .maybeSingle();

  if (!seat) {
    await logEvent(db, req, "heartbeat", {
      licenseId: lic.id, deviceHash: fingerprint,
      meta: { result: "seat_gone" },
    });
    return json({
      valid: false,
      code: "SEAT_RELEASED",
      error: "This device was unlinked from the license. Please activate again.",
    }, 403);
  }

  const hostApp = String(body.hostApp ?? "").toUpperCase();
  const apps: string[] = Array.from(new Set([...(seat.host_apps ?? []), hostApp].filter(Boolean)));
  await db.from("activations").update({
    last_seen: new Date().toISOString(),
    host_apps: apps,
    app_version: body.appVersion ?? null,
  }).eq("id", seat.id);

  const slugs = entitlementSlugs(lic);
  const token = await signEntitlement({
    licenseId: lic.id,
    deviceHash: fingerprint,
    extensions: slugs,
    licenseType: lic.license_type,
    maxDevices: lic.max_devices,
    graceDays: lic.grace_days,
    email: lic.profiles?.email ?? null,
  });

  await logEvent(db, req, "heartbeat", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: fingerprint,
    meta: { result: "ok", hostApp },
  });

  return json({ valid: true, token, entitlements: slugs });
});
