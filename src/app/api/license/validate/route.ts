import { z } from "zod";
import { verifyLicenseToken } from "@/lib/jwt";
import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/extension-cors";

const schema = z.object({
  token: z.string(),
  deviceId: z.string(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return corsJson(
      { valid: false, error: "Invalid input" },
      { status: 400 },
    );

  try {
    const payload = await verifyLicenseToken(parsed.data.token);
    if (payload.device !== parsed.data.deviceId)
      return corsJson(
        { valid: false, error: "Device mismatch" },
        { status: 403 },
      );

    const admin = createAdminClient();
    const { data: license } = await admin
      .from("licenses")
      .select("status, profiles(is_banned)")
      .eq("id", payload.sub as string)
      .maybeSingle();
      
    if (!license || license.status !== "active")
      return corsJson(
        { valid: false, error: "License not active" },
        { status: 403 },
      );

    // Check if user is banned
    const profile = Array.isArray(license.profiles) ? license.profiles[0] : license.profiles;
    if (profile?.is_banned) {
      return corsJson(
        { valid: false, error: "Account suspended. Contact support at support@compxorbit.com" },
        { status: 403 },
      );
    }

    // A valid token must still have a matching active device seat.
    const { data: seat } = await admin
      .from("activations")
      .select("id")
      .eq("license_id", payload.sub as string)
      .eq("device_hash", parsed.data.deviceId)
      .eq("status", "active")
      .maybeSingle();

    if (!seat) {
      return corsJson(
        { valid: false, error: "Device seat released or unlinked" },
        { status: 403 },
      );
    }

    return corsJson({ valid: true });
  } catch {
    return corsJson(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
