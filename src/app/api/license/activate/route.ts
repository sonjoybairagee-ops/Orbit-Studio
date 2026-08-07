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
  appVersion: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { key, deviceId, deviceLabel, os, appVersion } = parsed.data;

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

  // Query active seats from activations table
  const { data: seats } = await admin
    .from("activations")
    .select("id, device_hash, status")
    .eq("license_id", license.id)
    .eq("status", "active");

  const existingSeat = (seats ?? []).find((s: any) => s.device_hash === deviceId);

  if (existingSeat) {
    // Device already has an active seat -> update last_seen
    await admin
      .from("activations")
      .update({
        last_seen: new Date().toISOString(),
        ...(deviceLabel ? { device_label: deviceLabel } : {}),
        ...(os ? { os } : {}),
        ...(appVersion ? { app_version: appVersion } : {}),
      })
      .eq("id", existingSeat.id);
  } else {
    // New device -> check active seats count against max_devices limit
    if ((seats?.length ?? 0) >= maxAllowedDevices) {
      return NextResponse.json(
        {
          error:
            maxAllowedDevices === 1
              ? "This license is already active on another device. Request a device reset from your dashboard."
              : `All ${maxAllowedDevices} device slots for this license are in use. Release an existing device or request a reset.`,
          code: "DEVICE_LIMIT",
          maxDevices: maxAllowedDevices,
          activeSeats: seats?.length ?? 0,
        },
        { status: 409 },
      );
    }

    // Insert new active seat in activations table
    await admin.from("activations").insert({
      license_id: license.id,
      device_hash: deviceId,
      device_label: deviceLabel || null,
      os: os || null,
      app_version: appVersion || null,
      status: "active",
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });
  }

  // Set legacy device_id & device_bound_at if not set yet
  if (!license.device_id) {
    await admin
      .from("licenses")
      .update({
        device_id: deviceId,
        device_bound_at: new Date().toISOString(),
      })
      .eq("id", license.id);
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
