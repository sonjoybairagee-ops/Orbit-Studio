import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { signLicenseToken } from "@/lib/jwt";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { entitlementSlugs, licenseCoversRequest } from "@/lib/license-entitlements";

// Called by the browser extension or panel on activation.
const schema = z.object({
  key: z.string().min(4),
  deviceId: z.string().min(6),
  canonicalFingerprint: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
  deviceLabel: z.string().optional(),
  os: z.string().optional(),
  hostApp: z.string().optional(),
  appVersion: z.string().optional(),
  extensionSlug: z.string().optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return corsJson({ error: "Invalid input" }, { status: 400 });
  const { key, deviceId, canonicalFingerprint, deviceLabel, os, hostApp, appVersion, extensionSlug } = parsed.data;

  const admin = createAdminClient();
  const { data: license } = await admin
    .from("licenses")
    .select("*, profiles(is_banned), plans(slug, name, plan_extensions(extensions(slug, host_app)))")
    .eq("key", key.trim().toUpperCase().replace(/\s+/g, ""))
    .maybeSingle();

  if (!license)
    return corsJson({ error: "Invalid license key" }, { status: 404 });
  if (!licenseCoversRequest(license, hostApp, extensionSlug))
    return corsJson(
      {
        error: "This license does not include this extension.",
        code: "NOT_ENTITLED",
        entitlements: entitlementSlugs(license),
      },
      { status: 403 },
    );
  if (license.status !== "active")
    return corsJson(
      { error: `License ${license.status}` },
      { status: 403 },
    );
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return corsJson({ error: "License expired" }, { status: 403 });

  // Check if user profile is banned
  const profile = Array.isArray(license.profiles)
    ? license.profiles[0]
    : license.profiles;
  if (profile?.is_banned) {
    return corsJson(
      { error: "Account suspended. Contact support at support@compxorbit.com" },
      { status: 403 },
    );
  }

  const maxAllowedDevices = license.max_devices || 1;
  const { data: activationData, error: activationError } = await admin.rpc("activate_license_device_v2", {
    p_license_id: license.id,
    p_device_hash: deviceId,
    p_canonical_hash: canonicalFingerprint?.toLowerCase() ?? deviceId,
    p_device_label: deviceLabel ?? null,
    p_os: os ?? null,
    p_host_app: hostApp ?? null,
    p_app_version: appVersion ?? null,
  });
  if (activationError) {
    const limit = activationError.message.match(/^DEVICE_LIMIT:(\d+):(\d+)$/);
    if (limit) {
      const maxDevices = Number(limit[1]);
      return corsJson(
        {
          error: maxDevices === 1
            ? "This license is already active on another device. Request a device reset from your dashboard."
            : `All ${maxDevices} device slots for this license are in use. Release an existing device or request a reset.`,
          code: "DEVICE_LIMIT",
          maxDevices,
          activeSeats: Number(limit[2]),
        },
        { status: 409 },
      );
    }
    return corsJson({ error: "Could not activate this device" }, { status: 409 });
  }

  const activation = Array.isArray(activationData) ? activationData[0] : activationData;
  const effectiveDeviceId = String(activation?.device_hash ?? canonicalFingerprint ?? deviceId);
  const slugs = entitlementSlugs(license);
  const plan = Array.isArray(license.plans) ? license.plans[0] : license.plans;

  const token = await signLicenseToken({
    sub: license.id,
    ext: license.extension_id,
    device: effectiveDeviceId,
  });

  return corsJson({
    ok: true,
    token,
    fingerprint: effectiveDeviceId,
    extensionId: license.extension_id,
    entitlements: slugs,
    maxDevices: maxAllowedDevices,
    license: {
      type: license.license_type,
      plan: plan?.name ?? "Compx Creator",
      maxDevices: maxAllowedDevices,
      expiresAt: license.expires_at ?? null,
    },
  });
}
