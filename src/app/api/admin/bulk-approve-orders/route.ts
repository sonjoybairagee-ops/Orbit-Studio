import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, logAdminAction } from "@/lib/supabase/admin";
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
    .in("status", ["pending", "on_hold"]);

  if (!orders || orders.length === 0) {
    return NextResponse.json({ approved: [], failed: orderIds });
  }

  const approvedIds: string[] = [];
  const failedIds: string[] = [];
  const emailsToSend: { to: string; subject: string; html: string }[] = [];

  for (const order of orders) {
    try {
      const { data: issued, error: issueError } = await svc.rpc(
        "approve_order_and_issue_license",
        {
          p_order_id: order.id,
          p_license_key: generateLicenseKey(),
          p_admin_id: admin.id,
          p_provider_transaction_id: null,
        },
      );
      if (issueError) throw issueError;
      const license = Array.isArray(issued) ? issued[0] : issued;
      if (!license) throw new Error("License was not issued");

      approvedIds.push(order.id);

      // Queue email only after the transaction has committed.
      const { data: profile } = await svc
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .single();

      if (profile?.email) {
        emailsToSend.push({
          to: profile.email,
          subject: "Your license key is ready",
          html: licenseIssuedEmail(
            order.plans?.name ?? "your extension",
            license.key,
            profile.email.split("@")[0] || "Creator",
            license.max_devices,
            order.id,
          ),
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
    await logAdminAction(admin.id, "BULK_APPROVED_ORDERS", null, { approved_count: approvedIds.length, approved_ids: approvedIds });
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
