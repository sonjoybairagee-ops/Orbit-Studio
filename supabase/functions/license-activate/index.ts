// ============================================================
// POST /license-activate
// Body: { key, fingerprint, canonicalFingerprint?, deviceLabel?, os?, hostApp?, appVersion? }
// Returns: { ok, token, entitlements, license }
// ============================================================
import {
  admin, json, preflight, logEvent, isRateLimited, normalizeKey,
  signEntitlement, loadLicense, licenseProblem, entitlementSlugs,
} from "../_shared/lib.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();

  // ---- brute-force protection -------------------------------
  // 12 failed activations from one IP in 15 minutes = blocked.
  if (await isRateLimited(db, req, "activate_fail", 12, 15)) {
    return json(
      { error: "Too many failed attempts. Please try again in 15 minutes." },
      429,
    );
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const key = normalizeKey(body.key);
  const fingerprint = String(body.fingerprint ?? "").trim();
  const requestedCanonical = String(body.canonicalFingerprint ?? "" ).trim().toLowerCase();
  const canonicalFingerprint = /^[0-9a-f]{64}$/.test(requestedCanonical)
    ? requestedCanonical
    : fingerprint;
  const hostApp = String(body.hostApp ?? "").toUpperCase(); // AEFT | PPRO

  if (key.length < 8) return json({ error: "Please enter a valid license key." }, 400);
  if (fingerprint.length < 16) return json({ error: "Device identification failed." }, 400);

  // ---- load + validate --------------------------------------
  const lic = await loadLicense(db, key);
  const problem = licenseProblem(lic);
  if (problem) {
    await logEvent(db, req, "activate_fail", {
      licenseId: lic?.id ?? null,
      deviceHash: fingerprint,
      meta: { key_tail: key.slice(-4), reason: problem },
    });
    return json({ error: problem }, lic ? 403 : 404);
  }

  // ---- does this plan cover the panel that is asking? -------
  const slugs = entitlementSlugs(lic);
  if (body.extensionSlug && !slugs.includes(String(body.extensionSlug))) {
    await logEvent(db, req, "activate_fail", {
      licenseId: lic.id, deviceHash: fingerprint,
      meta: { reason: "not_entitled", requested: body.extensionSlug },
    });
    return json({
      error: "This license does not include this extension.",
      code: "NOT_ENTITLED",
      entitlements: slugs,
    }, 403);
  }

  // ---- atomic seat management -------------------------------
  // The database function locks the license row before checking/inserting,
  // preventing concurrent devices from exceeding max_devices.
  const { data: activationData, error: activationError } = await db.rpc("activate_license_device_v2", {
    p_license_id: lic.id,
    p_device_hash: fingerprint,
    p_canonical_hash: canonicalFingerprint,
    p_device_label: body.deviceLabel ?? null,
    p_os: body.os ?? null,
    p_host_app: hostApp || null,
    p_app_version: body.appVersion ?? null,
  });
  if (activationError) {
    const limit = String(activationError.message).match(/DEVICE_LIMIT:(\d+):(\d+)/);
    if (limit) {
      const maxDevices = Number(limit[1]);
      const activeSeats = Number(limit[2]);
      await logEvent(db, req, "activate_fail", {
        licenseId: lic.id, deviceHash: fingerprint,
        meta: { reason: "device_limit", seats: activeSeats, max: maxDevices },
      });
      return json({
        error: maxDevices === 1
          ? "This license is already active on another device. Request a device reset from your dashboard."
          : `All ${maxDevices} device slots are in use. Release one or request a reset.`,
        code: "DEVICE_LIMIT",
        maxDevices,
        activeSeats,
      }, 409);
    }
    return json({ error: "Activation failed. Please try again." }, 409);
  }

  const activation = Array.isArray(activationData) ? activationData[0] : activationData;
  const effectiveFingerprint = String(activation?.device_hash ?? canonicalFingerprint);

  // ---- per-buyer watermark (Tier 4) -------------------------
  // tools/build-release.js embeds a unique buildId + buyerHash in each
  // buyer's copy. Persist it on the seat so a leaked zip can be traced
  // back to the buyer (query activations by build_id).
  const buildId = String(body.buildId ?? "").trim() || null;
  const buyerHash = String(body.buyerHash ?? "").trim() || null;
  if (buildId || buyerHash) {
    await db.from("activations").update({
      build_id: buildId,
      buyer_hash: buyerHash,
    })
      .eq("license_id", lic.id)
      .eq("device_hash", effectiveFingerprint)
      .eq("status", "active");
  }

  // ---- signed entitlement -----------------------------------
  const token = await signEntitlement({
    licenseId: lic.id,
    deviceHash: effectiveFingerprint,
    extensions: slugs,
    licenseType: lic.license_type,
    maxDevices: lic.max_devices,
    graceDays: lic.grace_days,
    email: lic.profiles?.email ?? null,
  });

  await logEvent(db, req, "activate_ok", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: effectiveFingerprint,
    meta: { hostApp, appVersion: body.appVersion ?? null, buildId, buyerHash },
  });

  return json({
    ok: true,
    token,
    fingerprint: effectiveFingerprint,
    entitlements: slugs,
    license: {
      type: lic.license_type,
      plan: lic.plans?.name,
      maxDevices: lic.max_devices,
      expiresAt: lic.expires_at,
      email: lic.profiles?.email ?? null,
    },
  });
});
