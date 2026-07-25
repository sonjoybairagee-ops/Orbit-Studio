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
    const { data: license } = await admin
      .from("licenses")
      .select("status")
      .eq("id", payload.sub as string)
      .maybeSingle();
    if (!license || license.status !== "active")
      return NextResponse.json(
        { valid: false, error: "License not active" },
        { status: 403 },
      );

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
