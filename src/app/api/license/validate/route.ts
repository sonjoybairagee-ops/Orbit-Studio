import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLicenseToken } from "@/lib/jwt";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string(),
  deviceId: z.string(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { valid: false, error: "Invalid input" },
      { status: 400 },
    );

  try {
    const payload = await verifyLicenseToken(parsed.data.token);
    if (payload.device !== parsed.data.deviceId)
      return NextResponse.json(
        { valid: false, error: "Device mismatch" },
        { status: 403 },
      );

    const admin = createAdminClient();

    // Check license status + ban check
    const { data: license } = await admin
      .from("licenses")
      .select("id, status, profiles!inner(is_banned)")
      .eq("id", payload.sub as string)
      .maybeSingle();

    if (!license || license.status !== "active")
      return NextResponse.json(
        { valid: false, error: "License not active" },
        { status: 403 },
      );

    // Check if user is banned
    const profile = Array.isArray(license.profiles)
      ? license.profiles[0]
      : license.profiles;
    if ((profile as any)?.is_banned) {
      return NextResponse.json(
        {
          valid: false,
          error: "Account suspended. Contact support at support@compxorbit.com",
        },
        { status: 403 },
      );
    }

    // Check if this device still has an active seat in the activations table
    const { data: seat } = await admin
      .from("activations")
      .select("id, status")
      .eq("license_id", license.id)
      .eq("device_hash", parsed.data.deviceId)
      .eq("status", "active")
      .maybeSingle();

    if (!seat) {
      return NextResponse.json(
        {
          valid: false,
          code: "SEAT_RELEASED",
          error:
            "This device was unlinked from the license. Please activate again.",
        },
        { status: 403 },
      );
    }

    // Update last_seen for heartbeat tracking
    await admin
      .from("activations")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", seat.id);

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
