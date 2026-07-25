import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { signLicenseToken } from "@/lib/jwt";

// Called by the browser extension on first activation.
const schema = z.object({
  key: z.string().min(4),
  deviceId: z.string().min(6),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { key, deviceId } = parsed.data;

  const admin = createAdminClient();
  const { data: license } = await admin
    .from("licenses")
    .select("*")
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

  if (license.device_id && license.device_id !== deviceId)
    return NextResponse.json(
      { error: "License already bound to another device. Request a reset." },
      { status: 409 },
    );

  // First activation -> bind this device.
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
  });
}
