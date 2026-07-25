// ============================================================
// POST /release-download
// Body: { key, fingerprint, slug, version?, channel? }
// Returns a 60-second signed URL from the PRIVATE 'releases'
// bucket, plus the SHA-256 so the client can verify the file.
// ============================================================
import {
  admin, json, preflight, logEvent, isRateLimited, normalizeKey,
  loadLicense, licenseProblem, entitlementSlugs,
} from "../_shared/lib.ts";

const LINK_TTL_SECONDS = 60;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const db = admin();

  // 20 downloads per IP per hour is plenty for a real customer.
  if (await isRateLimited(db, req, "download", 20, 60)) {
    return json({ error: "Download limit reached. Please try again later." }, 429);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const key = normalizeKey(body.key);
  const fingerprint = String(body.fingerprint ?? "").trim();
  const slug = String(body.slug ?? "");
  const channel = body.channel === "beta" ? "beta" : "stable";

  const lic = await loadLicense(db, key);
  const problem = licenseProblem(lic);
  if (problem) return json({ error: problem }, 403);

  if (!entitlementSlugs(lic).includes(slug)) {
    return json({ error: "This license does not include this extension." }, 403);
  }

  const { data: seat } = await db
    .from("activations").select("id")
    .eq("license_id", lic.id).eq("device_hash", fingerprint)
    .eq("status", "active").maybeSingle();
  if (!seat) return json({ error: "This device is not activated." }, 403);

  const { data: ext } = await db
    .from("extensions").select("id").eq("slug", slug).maybeSingle();
  if (!ext) return json({ error: "Unknown extension." }, 404);

  let q = db.from("releases")
    .select("version, storage_path, sha256, size_bytes")
    .eq("extension_id", ext.id)
    .eq("channel", channel);

  q = body.version ? q.eq("version", String(body.version)) : q.eq("is_latest", true);

  const { data: rel } = await q.maybeSingle();
  if (!rel) return json({ error: "Release not found." }, 404);

  const { data: signed, error } = await db.storage
    .from("releases")
    .createSignedUrl(rel.storage_path, LINK_TTL_SECONDS, { download: true });

  if (error || !signed) {
    return json({ error: "Could not create the download link." }, 500);
  }

  await logEvent(db, req, "download", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: fingerprint,
    meta: { slug, version: rel.version, channel },
  });

  return json({
    ok: true,
    url: signed.signedUrl,
    expiresInSeconds: LINK_TTL_SECONDS,
    version: rel.version,
    sha256: rel.sha256,      // verify after download
    sizeBytes: rel.size_bytes,
  });
});
