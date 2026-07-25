// ============================================================
// POST /license-deactivate
// Body: { key, fingerprint }
// The user releases THIS device themselves (panel "Sign out").
// Starts the 24h cooldown — this is what stopped licence sharing
// in the old Firebase build, where logout was unlimited.
// ============================================================
import {
  admin, json, preflight, logEvent, normalizeKey,
  loadLicense, licenseProblem,
} from "../_shared/lib.ts";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

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
  if (!lic) return json({ error: "Invalid license key." }, 404);

  // Revoked licences may always be released; otherwise normal checks apply.
  const problem = licenseProblem(lic);
  if (problem && lic.status !== "revoked") return json({ error: problem }, 403);

  // ---- server-side cooldown (clock never comes from the client) ----
  const last = lic.last_reset_at ? new Date(lic.last_reset_at).getTime() : 0;
  const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - last));
  if (remaining > 0) {
    const hours = Math.ceil(remaining / 3_600_000);
    return json({
      error: `Device changes are limited to once every 24 hours. Try again in about ${hours} hour(s), or ask support for a forced reset.`,
      code: "COOLDOWN",
      retryAfterSeconds: Math.ceil(remaining / 1000),
    }, 429);
  }

  const { data: seat } = await db
    .from("activations")
    .select("id")
    .eq("license_id", lic.id)
    .eq("device_hash", fingerprint)
    .eq("status", "active")
    .maybeSingle();

  if (!seat) return json({ error: "This device is not currently activated." }, 404);

  await db.from("activations").update({
    status: "released",
    released_at: new Date().toISOString(),
  }).eq("id", seat.id);

  await db.from("licenses").update({
    last_reset_at: new Date().toISOString(),
    reset_count: (lic.reset_count ?? 0) + 1,
  }).eq("id", lic.id);

  await logEvent(db, req, "deactivate", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: fingerprint,
    meta: { self_service: true },
  });

  return json({
    ok: true,
    message: "Device released. You can activate on a new device right away; the next change is available in 24 hours.",
  });
});
