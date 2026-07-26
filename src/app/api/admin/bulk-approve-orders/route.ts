import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateLicenseKey } from "@/lib/license";
import { sendEmail, licenseIssuedEmail } from "@/lib/email";
import { waitUntil } from "@vercel/functions";

const schema = z.object({
  orderIds: z.array(z.string().uuid()).max(50),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input or batch size > 50" }, { status: 400 });
  }
  const { orderIds } = parsed.data;

  if (orderIds.length === 0) {
    return NextResponse.json({ approved: [], failed: [] });
  }

  const svc = createAdminClient();
  const { data: orders } = await svc
    .from("orders")
    .select("*, plans(name)")
    .in("id", orderIds)
    .eq("status", "pending");

  if (!orders || orders.length === 0) {
    return NextResponse.json({ approved: [], failed: orderIds });
  }

  const reviewed = {
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  };

  const approvedIds: string[] = [];
  const failedIds: string[] = [];
  const emailsToSend: { to: string; subject: string; html: string }[] = [];

  for (const order of orders) {
    try {
      // 1. Mark as approved
      const { error: updateErr } = await svc
        .from("orders")
        .update({ status: "approved", ...reviewed })
        .eq("id", order.id);

      if (updateErr) throw updateErr;

      // 2. Issue license
      const { data: license, error: licErr } = await svc
        .from("licenses")
        .insert({
          user_id: order.user_id,
          plan_id: order.plan_id,
          extension_id: order.extension_id,
          order_id: order.id,
          key: generateLicenseKey(),
          status: "active",
        })
        .select()
        .single();

      if (licErr) throw licErr;

      approvedIds.push(order.id);

      // 3. Queue email to send
      const { data: profile } = await svc
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .single();

      if (profile?.email) {
        emailsToSend.push({
          to: profile.email,
          subject: "Your license key is ready",
          html: licenseIssuedEmail(order.plans?.name ?? "your extension", license.key),
        });
      }
    } catch (e) {
      console.error(`Failed to bulk approve order ${order.id}:`, e);
      failedIds.push(order.id);
    }
  }

  // Find out which ones didn't even get queried
  const queriedIds = orders.map((o) => o.id);
  const ignoredIds = orderIds.filter((id) => !queriedIds.includes(id));
  failedIds.push(...ignoredIds);

  // Audit Log
  if (approvedIds.length > 0) {
    await svc.from("license_events").insert({
      actor_id: admin.id,
      event: "bulk_approve",
      meta: { approved_count: approvedIds.length, approved_ids: approvedIds },
    });
  }

  // Background email dispatch with staggering
  if (emailsToSend.length > 0) {
    waitUntil(
      (async () => {
        for (let i = 0; i < emailsToSend.length; i++) {
          try {
            await sendEmail(emailsToSend[i]);
          } catch (e) {
            console.error(`Failed to send background email to ${emailsToSend[i].to}:`, e);
          }
          // Small stagger of 100ms between emails to prevent Resend rate limits
          if (i < emailsToSend.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      })()
    );
  }

  return NextResponse.json({ ok: true, approved: approvedIds, failed: failedIds });
}
