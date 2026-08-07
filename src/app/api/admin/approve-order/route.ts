import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, logAdminAction } from "@/lib/supabase/admin";
import { generateLicenseKey } from "@/lib/license";
import { sendEmail, licenseIssuedEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(["approve", "reject", "reject_ban"]),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { orderId, action } = parsed.data;

  const svc = createAdminClient();
  const { data: order } = await svc
    .from("orders")
    .select("*, plans(name)")
    .eq("id", orderId)
    .single();
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "pending")
    return NextResponse.json(
      { error: "Order already reviewed" },
      { status: 409 },
    );

  const reviewed = {
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  };

  if (action === "reject" || action === "reject_ban") {
    await svc
      .from("orders")
      .update({ status: "rejected", ...reviewed })
      .eq("id", orderId);
      
    if (action === "reject_ban") {
      const { error: banError } = await svc.auth.admin.updateUserById(order.user_id, { ban_duration: "876000h" });
      if (banError) {
        return NextResponse.json({ error: "Order rejected, but failed to ban user: " + banError.message }, { status: 500 });
      }

      // Update profile
      const { error: dbError } = await svc
        .from("profiles")
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_by: admin.id,
          ban_reason: "Fake order"
        })
        .eq("id", order.user_id);

      if (dbError) {
        // Attempt rollback
        const { error: rollbackError } = await svc.auth.admin.updateUserById(order.user_id, { ban_duration: "none" });
        if (rollbackError) {
          console.error(`[CRITICAL] Failed to rollback auth ban for user ${order.user_id} after DB update failed. Auth and DB are in inconsistent state.`, rollbackError);
        }
        return NextResponse.json({ error: "Failed to update profile. User ban was rolled back." }, { status: 500 });
      }

      await logAdminAction(admin.id, "BANNED_USER", order.user_id, { reason: "Fake order", order_id: orderId });
    }

    await logAdminAction(admin.id, "REJECTED_ORDER", orderId, { user_id: order.user_id, plan_id: order.plan_id });
    return NextResponse.json({ ok: true });
  }

  // Approve -> mark paid and AUTO-ISSUE a license.
  await svc
    .from("orders")
    .update({ status: "approved", ...reviewed })
    .eq("id", orderId);

  // Determine max_devices from order.max_devices, or calculate from order.amount
  let maxDevicesToIssue = order.max_devices;
  if (!maxDevicesToIssue || maxDevicesToIssue < 1) {
    const unitPrice = order.currency === "BDT" ? 249 : 2;
    maxDevicesToIssue = Math.max(1, Math.round(Number(order.amount) / unitPrice));
  }

  const { data: license, error } = await svc
    .from("licenses")
    .insert({
      user_id: order.user_id,
      plan_id: order.plan_id,
      extension_id: order.extension_id,
      order_id: order.id,
      key: generateLicenseKey(),
      status: "active",
      max_devices: maxDevicesToIssue,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Email the license key to the buyer.
  const { data: profile } = await svc
    .from("profiles")
    .select("email, full_name")
    .eq("id", order.user_id)
    .single();
  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      subject: "Your license key is ready",
      html: licenseIssuedEmail(
        order.plans?.name ?? "your extension",
        license.key,
        profile.full_name || "Creator",
        license.max_devices,
        order.id
      ),
    });
  }

  await logAdminAction(admin.id, "APPROVED_ORDER", orderId, { user_id: order.user_id, plan_id: order.plan_id, license_id: license.id });

  return NextResponse.json({ ok: true, license });
}
