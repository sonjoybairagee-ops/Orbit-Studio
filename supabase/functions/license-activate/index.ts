// ============================================================
// POST /license-activate
// Body: { key, fingerprint, deviceLabel?, os?, hostApp?, appVersion? }
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

  // ---- seat management --------------------------------------
  // A seat belongs to the MACHINE, so AE and Premiere on the same
  // computer share one seat.
  const { data: seats } = await db
    .from("activations")
    .select("id, device_hash, host_apps")
    .eq("license_id", lic.id)
    .eq("status", "active");

  const mine = (seats ?? []).find((s: any) => s.device_hash === fingerprint);

  if (mine) {
    const apps: string[] = Array.from(new Set([...(mine.host_apps ?? []), hostApp].filter(Boolean)));
    await db.from("activations").update({
      last_seen: new Date().toISOString(),
      host_apps: apps,
      app_version: body.appVersion ?? null,
      device_label: body.deviceLabel ?? null,
    }).eq("id", mine.id);
  } else {
    if ((seats?.length ?? 0) >= lic.max_devices) {
      await logEvent(db, req, "activate_fail", {
        licenseId: lic.id, deviceHash: fingerprint,
        meta: { reason: "device_limit", seats: seats?.length, max: lic.max_devices },
      });
      return json({
        error: lic.max_devices === 1
          ? "This license is already active on another device. Request a device reset from your dashboard."
          : `All ${lic.max_devices} device slots are in use. Release one or request a reset.`,
        code: "DEVICE_LIMIT",
        maxDevices: lic.max_devices,
      }, 409);
    }

    const { error: insErr } = await db.from("activations").insert({
      license_id: lic.id,
      device_hash: fingerprint,
      device_label: body.deviceLabel ?? null,
      os: body.os ?? null,
      host_apps: hostApp ? [hostApp] : [],
      app_version: body.appVersion ?? null,
    });
    // Unique index protects against a double-click race; ignore duplicates.
    if (insErr && !String(insErr.message).includes("duplicate")) {
      return json({ error: "Activation failed. Please try again." }, 500);
    }
  }

  // ---- signed entitlement -----------------------------------
  const token = await signEntitlement({
    licenseId: lic.id,
    deviceHash: fingerprint,
    extensions: slugs,
    licenseType: lic.license_type,
    maxDevices: lic.max_devices,
    graceDays: lic.grace_days,
    email: lic.profiles?.email ?? null,
  });

  await logEvent(db, req, "activate_ok", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: fingerprint,
    meta: { hostApp, appVersion: body.appVersion ?? null },
  });

  return json({
    ok: true,
    token,
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
