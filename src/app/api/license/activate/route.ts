import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { signLicenseToken } from "@/lib/jwt";

// Called by the browser extension on activation.
// Now supports multi-device licenses using the activations table.
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
  const normalizedKey = key.trim().toUpperCase().replace(/\s+/g, "");
  const hostAppUpper = (hostApp ?? "").toUpperCase();

  const admin = createAdminClient();

  // Load license with plan details
  const { data: license } = await admin
    .from("licenses")
    .select(
      `id, user_id, key, license_type, status, max_devices, grace_days,
       expires_at, plans!inner(slug, name, plan_extensions(extensions(slug, host_app))),
       profiles(email)`
    )
    .eq("key", normalizedKey)
    .maybeSingle();

  if (!license)
    return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
  if (license.status === "revoked")
    return NextResponse.json(
      { error: "This license has been revoked." },
      { status: 403 },
    );
  if (license.status === "suspended")
    return NextResponse.json(
      { error: "This license is temporarily suspended. Contact support." },
      { status: 403 },
    );
  if (license.status !== "active")
    return NextResponse.json(
      { error: `License ${license.status}` },
      { status: 403 },
    );
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ error: "License expired" }, { status: 403 });

  // Get entitlement slugs from plan
  const entitlements: string[] = ((license as any).plans?.plan_extensions ?? [])
    .map((pe: any) => pe.extensions?.slug)
    .filter(Boolean);

  // ── Seat management using activations table ──
  // A seat belongs to the MACHINE — AE and Premiere on the same device share one seat.
  const { data: seats } = await admin
    .from("activations")
    .select("id, device_hash, host_apps")
    .eq("license_id", license.id)
    .eq("status", "active");

  const existingSeat = (seats ?? []).find(
    (s: any) => s.device_hash === deviceId,
  );

  if (existingSeat) {
    // Same device re-activating — update last_seen and merge host apps
    const apps: string[] = Array.from(
      new Set([...(existingSeat.host_apps ?? []), hostAppUpper].filter(Boolean)),
    );
    await admin
      .from("activations")
      .update({
        last_seen: new Date().toISOString(),
        host_apps: apps,
        app_version: appVersion ?? null,
        device_label: deviceLabel ?? null,
      })
      .eq("id", existingSeat.id);
  } else {
    // New device — check if slots are available
    if ((seats?.length ?? 0) >= license.max_devices) {
      // Log failed activation
      await admin.from("license_events").insert({
        license_id: license.id,
        user_id: license.user_id,
        event: "activate_fail",
        device_hash: deviceId,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        user_agent: req.headers.get("user-agent"),
        meta: {
          reason: "device_limit",
          seats: seats?.length ?? 0,
          max: license.max_devices,
        },
      });

      return NextResponse.json(
        {
          error:
            license.max_devices === 1
              ? "This license is already active on another device. Request a device reset from your dashboard."
              : `All ${license.max_devices} device slots are in use. Release one from your dashboard or request a reset.`,
          code: "DEVICE_LIMIT",
          maxDevices: license.max_devices,
          activeDevices: seats?.length ?? 0,
        },
        { status: 409 },
      );
    }

    // Insert new activation seat
    const { error: insErr } = await admin.from("activations").insert({
      license_id: license.id,
      device_hash: deviceId,
      device_label: deviceLabel ?? null,
      os: os ?? null,
      host_apps: hostAppUpper ? [hostAppUpper] : [],
      app_version: appVersion ?? null,
    });

    // Unique index protects against race condition double-click; ignore duplicates
    if (insErr && !String(insErr.message).includes("duplicate")) {
      return NextResponse.json(
        { error: "Activation failed. Please try again." },
        { status: 500 },
      );
    }
  }

  // Sign entitlement token
  const token = await signLicenseToken({
    sub: license.id,
    device: deviceId,
    ent: entitlements,
    typ: license.license_type,
    seats: license.max_devices,
    email: (license as any).profiles?.email ?? null,
  });

  // Log successful activation
  await admin.from("license_events").insert({
    license_id: license.id,
    user_id: license.user_id,
    event: "activate_ok",
    device_hash: deviceId,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { hostApp: hostAppUpper, appVersion: appVersion ?? null },
  });

  return NextResponse.json({
    ok: true,
    token,
    entitlements,
    license: {
      type: license.license_type,
      plan: (license as any).plans?.name,
      maxDevices: license.max_devices,
      expiresAt: license.expires_at,
      email: (license as any).profiles?.email ?? null,
    },
  });
}
