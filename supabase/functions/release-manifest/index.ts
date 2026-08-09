// ============================================================
// POST /release-manifest
// Body: { key, fingerprint, slug, channel? }
// The private replacement for latest.json — only licensed,
// activated devices learn that an update exists.
// ============================================================
import {
  admin, json, preflight, logEvent, normalizeKey,
  loadLicense, licenseProblem, entitlementSlugs,
  compareSemanticVersions, findStorageRelease,
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
    .from("extensions").select("id, name").eq("slug", slug).maybeSingle();
  if (!ext) return json({ error: "Unknown extension." }, 404);

  const { data: databaseRelease } = await db
    .from("releases")
    .select("version, channel, sha256, size_bytes, min_host_version, notes, published_at")
    .eq("extension_id", ext.id)
    .eq("channel", channel)
    .eq("is_latest", true)
    .maybeSingle();

  const storageRelease = await findStorageRelease(db, slug, channel);
  const useStorage = storageRelease && (
    !databaseRelease || compareSemanticVersions(storageRelease.version, databaseRelease.version) > 0
  );
  const rel = useStorage ? {
    version: storageRelease.version,
    channel,
    sha256: null,
    size_bytes: storageRelease.sizeBytes,
    min_host_version: null,
    notes: null,
    published_at: storageRelease.publishedAt,
    source: "storage",
  } : databaseRelease ? { ...databaseRelease, source: "database" } : null;

  if (!rel) return json({ error: "No release package was found." }, 404);

  await logEvent(db, req, "manifest", {
    licenseId: lic.id, userId: lic.user_id, deviceHash: fingerprint,
    meta: { slug, version: rel.version, channel, source: rel.source },
  });

  return json({
    ok: true,
    extension: slug,
    name: ext.name,
    version: rel.version,
    channel: rel.channel,
    sha256: rel.sha256,
    sizeBytes: rel.size_bytes,
    minHostVersion: rel.min_host_version,
    notes: rel.notes,
    publishedAt: rel.published_at,
    source: rel.source,
  });
});
