// ============================================================
// Shared helpers for every CompX Edge Function.
// ============================================================
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v5.9.6/index.ts";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request): Response | null {
  return req.method === "OPTIONS" ? new Response("ok", { headers: cors }) : null;
}

/** Service-role client. NEVER expose this key outside an Edge Function. */
export function admin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Resolves the signed-in Supabase user from the Authorization header. */
export async function callerUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}

/** Resolves the caller and verifies they are an admin. */
export async function callerAdmin(req: Request) {
  const user = await callerUser(req);
  if (!user) return null;
  const { data } = await admin()
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "admin" ? data : null;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function country(req: Request): string | null {
  return req.headers.get("cf-ipcountry") ?? null;
}

/** Writes to license_events. Never throws — logging must not break a request. */
export async function logEvent(
  db: SupabaseClient,
  req: Request,
  event: string,
  fields: {
    licenseId?: string | null;
    userId?: string | null;
    actorId?: string | null;
    deviceHash?: string | null;
    meta?: Record<string, unknown>;
  } = {},
) {
  try {
    await db.from("license_events").insert({
      license_id: fields.licenseId ?? null,
      user_id: fields.userId ?? null,
      actor_id: fields.actorId ?? null,
      device_hash: fields.deviceHash ?? null,
      event,
      ip: clientIp(req),
      country: country(req),
      user_agent: req.headers.get("user-agent"),
      meta: fields.meta ?? {},
    });
  } catch (_) { /* ignore */ }
}

/**
 * Simple sliding-window rate limit backed by license_events.
 * Returns true when the caller is OVER the limit.
 */
export async function isRateLimited(
  db: SupabaseClient,
  req: Request,
  event: string,
  max: number,
  windowMinutes: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count } = await db
    .from("license_events")
    .select("id", { count: "exact", head: true })
    .eq("event", event)
    .eq("ip", clientIp(req))
    .gte("created_at", since);
  return (count ?? 0) >= max;
}

/** Normalises a user-typed license key: CX-ABCD-EFGH-... */
export function normalizeKey(raw: unknown): string {
  return String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

// ------------------------------------------------------------
// Entitlement token (ES256)
// The extension embeds only the PUBLIC key, so a cracked panel
// cannot forge a token — and offline grace cannot be extended.
// ------------------------------------------------------------
export interface Entitlement {
  licenseId: string;
  deviceHash: string;
  extensions: string[]; // ['orbit-studio','orbit-premiere']
  licenseType: string;
  maxDevices: number;
  graceDays: number;
  email?: string | null;
}

let cachedKey: CryptoKey | null = null;

async function privateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const pem = Deno.env.get("LICENSE_PRIVATE_KEY");
  if (!pem) throw new Error("LICENSE_PRIVATE_KEY secret is not set");
  cachedKey = await importPKCS8(pem.replace(/\\n/g, "\n"), "ES256");
  return cachedKey;
}

/** Token lives 24h online; grace_until extends usable time offline. */
export async function signEntitlement(e: Entitlement): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    dev: e.deviceHash,
    ent: e.extensions,
    typ: e.licenseType,
    seats: e.maxDevices,
    email: e.email ?? null,
    grace_until: now + e.graceDays * 86400,
  })
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setSubject(e.licenseId)
    .setIssuer("compx")
    .setAudience("compx-extension")
    .setIssuedAt(now)
    .setExpirationTime(now + 86400)
    .sign(await privateKey());
}

/**
 * Loads a license by key together with its plan entitlements,
 * and returns a plain-English reason when it is not usable.
 */
export async function loadLicense(db: SupabaseClient, key: string) {
  const { data } = await db
    .from("licenses")
    .select(
      `id, user_id, key, license_type, status, max_devices, grace_days,
       expires_at, last_reset_at, revoked_reason,
       profiles(email),
       plans!inner(slug, name, plan_extensions(extensions(slug, host_app)))`,
    )
    .eq("key", key)
    .maybeSingle();
  return data as any;
}

export function licenseProblem(lic: any): string | null {
  if (!lic) return "Invalid license key.";
  if (lic.status === "revoked") {
    return lic.revoked_reason
      ? `License revoked: ${lic.revoked_reason}`
      : "This license has been revoked.";
  }
  if (lic.status === "suspended") {
    return "This license is temporarily suspended. Please contact support.";
  }
  if (lic.status !== "active") return "This license is not active.";
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
    return "This license has expired.";
  }
  return null;
}

export function entitlementSlugs(lic: any): string[] {
  return (lic?.plans?.plan_extensions ?? [])
    .map((pe: any) => pe.extensions?.slug)
    .filter(Boolean);
}

// ------------------------------------------------------------
// Storage-backed releases
// Upload convention:
//   stable: extensions/<slug>/<semver>/<package>.zxp
//   beta:   extensions/<slug>/beta/<semver>/<package>.zxp
// This keeps manual Supabase Storage uploads usable even when an
// administrator has not created a matching row in public.releases.
// ------------------------------------------------------------
export interface StorageRelease {
  version: string;
  bucket: "extensions";
  storagePath: string;
  sizeBytes: number | null;
  publishedAt: string | null;
}

function versionParts(version: string): { core: number[]; prerelease: string[] } | null {
  const match = String(version).trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

export function compareSemanticVersions(a: string, b: string): number {
  const left = versionParts(a);
  const right = versionParts(b);
  if (!left || !right) return 0;
  for (let i = 0; i < 3; i++) {
    if (left.core[i] !== right.core[i]) return left.core[i] > right.core[i] ? 1 : -1;
  }
  if (!left.prerelease.length && right.prerelease.length) return 1;
  if (left.prerelease.length && !right.prerelease.length) return -1;
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let i = 0; i < length; i++) {
    if (left.prerelease[i] === undefined) return -1;
    if (right.prerelease[i] === undefined) return 1;
    const leftNumber = /^\d+$/.test(left.prerelease[i]) ? Number(left.prerelease[i]) : null;
    const rightNumber = /^\d+$/.test(right.prerelease[i]) ? Number(right.prerelease[i]) : null;
    if (leftNumber !== null && rightNumber !== null && leftNumber !== rightNumber) {
      return leftNumber > rightNumber ? 1 : -1;
    }
    if (leftNumber !== null && rightNumber === null) return -1;
    if (leftNumber === null && rightNumber !== null) return 1;
    if (left.prerelease[i] !== right.prerelease[i]) {
      return left.prerelease[i] > right.prerelease[i] ? 1 : -1;
    }
  }
  return 0;
}

export async function findStorageRelease(
  db: SupabaseClient,
  slug: string,
  channel: "stable" | "beta" = "stable",
  requestedVersion?: string,
): Promise<StorageRelease | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const basePath = channel === "beta" ? `${slug}/beta` : slug;
  const { data: entries, error } = await db.storage
    .from("extensions")
    .list(basePath, { limit: 100, sortBy: { column: "name", order: "desc" } });
  if (error || !entries) return null;

  const versions = entries
    .map((entry) => entry.name)
    .filter((name) => versionParts(name) !== null)
    .filter((name) => !requestedVersion || compareSemanticVersions(name, requestedVersion) === 0)
    .sort((a, b) => compareSemanticVersions(b, a));

  for (const version of versions) {
    const versionPath = `${basePath}/${version}`;
    const { data: files, error: filesError } = await db.storage
      .from("extensions")
      .list(versionPath, { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
    if (filesError || !files) continue;
    const packageFile = files.find((file) => file.name.toLowerCase().endsWith(".zxp"));
    if (!packageFile) continue;
    const metadata = packageFile.metadata as Record<string, unknown> | null;
    return {
      version: version.replace(/^v/i, ""),
      bucket: "extensions",
      storagePath: `${versionPath}/${packageFile.name}`,
      sizeBytes: metadata && typeof metadata.size === "number" ? metadata.size : null,
      publishedAt: packageFile.updated_at ?? packageFile.created_at ?? null,
    };
  }
  return null;
}
