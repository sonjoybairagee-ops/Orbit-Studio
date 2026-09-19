import { verifyLicenseToken } from "@/lib/jwt";
import { createAdminClient } from "@/lib/supabase/admin";
import { entitlementSlugs } from "@/lib/license-entitlements";

export async function requireCreatorLensSession(token: string, deviceId: string) {
  let payload;
  try {
    payload = await verifyLicenseToken(token);
  } catch {
    return { ok: false as const, status: 401, body: { error: "Invalid or expired token" } };
  }
  if (payload.device !== deviceId) {
    return { ok: false as const, status: 403, body: { error: "Device mismatch" } };
  }

  const admin = createAdminClient();
  const { data: license } = await admin
    .from("licenses")
    .select("id, status, profiles(is_banned), plans(plan_extensions(extensions(slug, host_app)))")
    .eq("id", payload.sub as string)
    .maybeSingle();

  if (!license || license.status !== "active") {
    return { ok: false as const, status: 403, body: { error: "License not active" } };
  }
  const profile = Array.isArray(license.profiles) ? license.profiles[0] : license.profiles;
  if (profile?.is_banned) {
    return { ok: false as const, status: 403, body: { error: "Account suspended. Contact support at support@compxorbit.com" } };
  }
  const slugs = entitlementSlugs(license);
  if (!slugs.includes("creatorlens")) {
    return { ok: false as const, status: 403, body: { error: "This license does not include Compx Creator.", code: "NOT_ENTITLED" } };
  }

  const { data: seat } = await admin
    .from("activations")
    .select("id")
    .eq("license_id", license.id)
    .eq("device_hash", deviceId)
    .eq("status", "active")
    .maybeSingle();
  if (!seat) {
    return { ok: false as const, status: 403, body: { error: "Device seat released or unlinked" } };
  }

  return { ok: true as const, admin, licenseId: license.id };
}
