import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { signLicenseToken } from "@/lib/jwt";

// Called by the browser extension or panel on activation.
const schema = z.object({
  key: z.string().min(4),
  deviceId: z.string().min(6),
  deviceLabel: z.string().optional(),
  os: z.string().optional(),
  hostApp: z.string().optional(),
  appVersion: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { key, deviceId, deviceLabel, os, hostApp, appVersion } = parsed.data;

  const admin = createAdminClient();
  const { data: license } = await admin
    .from("licenses")
    .select("*, profiles(is_banned)")
    .eq("key", key)
    .maybeSingle();

  if (!license)
    return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
  if (license.status !== "active")
    return NextResponse.json(
      { error: `License ${license.status}` },
      { status: 403 },
    );
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ error: "License expired" }, { status: 403 });

  // Check if user profile is banned
  const profile = Array.isArray(license.profiles)
    ? license.profiles[0]
    : license.profiles;
  if (profile?.is_banned) {
    return NextResponse.json(
      { error: "Account suspended. Contact support at support@compxorbit.com" },
      { status: 403 },
    );
  }

  const maxAllowedDevices = license.max_devices || 1;
  const { error: activationError } = await admin.rpc("activate_license_device", {
    p_license_id: license.id,
    p_device_hash: deviceId,
    p_device_label: deviceLabel ?? null,
    p_os: os ?? null,
    p_host_app: hostApp ?? null,
    p_app_version: appVersion ?? null,
  });
  if (activationError) {
    const limit = activationError.message.match(/^DEVICE_LIMIT:(\d+):(\d+)$/);
    if (limit) {
      const maxDevices = Number(limit[1]);
      return NextResponse.json(
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
    return NextResponse.json({ error: "Could not activate this device" }, { status: 409 });
  }

  const token = await signLicenseToken({
    sub: license.id,
    ext: license.extension_id,
    device: deviceId,
  });

  return NextResponse.json({
    ok: true,
    token,
    extensionId: license.extension_id,
    maxDevices: maxAllowedDevices,
  });
}
