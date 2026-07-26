import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { resend } from "@/lib/resend";
import {
  getNewLicenseEmailHtml,
  getOldUserRedeemEmailHtml,
} from "@/lib/emails/licenseTemplates";

function generateCXKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  return `CX-${part()}-${part()}-${part()}-${part()}`;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, planId, maxDevices } = await req.json();
  if (!email || !planId) {
    return NextResponse.json({ error: "Email and Plan ID required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Find user by email from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  const key = generateCXKey();

  const { data: license, error } = await supabase
    .from("licenses")
    .insert({
      user_id: profile?.id ?? null,
      plan_id: planId,
      key,
      status: "active",
      license_type: "paid",
      max_devices: maxDevices ?? 1,
      grace_days: 7,
      legacy_email: email.trim().toLowerCase(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch plan name for email
  const { data: plan } = await supabase
    .from("plans")
    .select("name, extensions(name)")
    .eq("id", planId)
    .single();

  const extName = (plan as any)?.extensions?.name || plan?.name || "CompX Extension";

  // Send branded Resend Email to customer
  try {
    const isOldUserMigration = extName.includes("Precomp") || extName.includes("Legacy");
    
    const html = isOldUserMigration
      ? getOldUserRedeemEmailHtml({
          customerName: email.split("@")[0],
          licenseKey: license.key,
          extensionName: extName,
        })
      : getNewLicenseEmailHtml({
          customerName: email.split("@")[0],
          extensionName: extName,
          licenseKey: license.key,
          maxDevices: maxDevices ?? 1,
        });

    const subject = isOldUserMigration
      ? `Redeem Your ${extName} License — CompX Orbit`
      : `Your ${extName} License Key — CompX Orbit`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>",
      to: email.trim(),
      subject,
      html,
    });
  } catch (emailErr) {
    console.error("Failed to send license email:", emailErr);
  }

  return NextResponse.json({ key: license.key, license });
}
