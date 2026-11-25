import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, logAdminAction } from "@/lib/supabase/admin";
import { sendEmail, refundProcessedEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  account: z.enum(["bKash", "Nagad", "Paddle", "Bank", "Other"]),
  amount: z.number().positive("Amount must be greater than 0"),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }

  const { orderId, account, amount, reason } = parsed.data;
  const svc = createAdminClient();
  const now = new Date().toISOString();

  // 1. Fetch order details with profile and plan
  const { data: order, error: orderErr } = await svc
    .from("orders")
    .select("*, profiles!orders_user_id_fkey(id, email, full_name), plans(name)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAlreadyRefunded =
    order.status === "refunded" ||
    (typeof order.hold_reason === "string" && order.hold_reason.startsWith("[REFUNDED"));

  if (isAlreadyRefunded) {
    return NextResponse.json(
      { error: "This order has already been refunded" },
      { status: 409 },
    );
  }

  // 2. Find and revoke linked license(s)
  const { data: licenses } = await svc
    .from("licenses")
    .select("id, key, status")
    .eq("order_id", orderId);

  const licenseIds: string[] = [];
  if (licenses && licenses.length > 0) {
    licenseIds.push(...licenses.map((l) => l.id));
  } else if (order.user_id && order.plan_id) {
    // Fallback: search by user_id and plan_id if order_id was unpopulated
    const { data: userLicenses } = await svc
      .from("licenses")
      .select("id, key, status")
      .eq("user_id", order.user_id)
      .eq("plan_id", order.plan_id);
    if (userLicenses && userLicenses.length > 0) {
      licenseIds.push(...userLicenses.map((l) => l.id));
    }
  }

  if (licenseIds.length > 0) {
    // Block all active devices for this license
    await svc
      .from("activations")
      .update({ status: "blocked", released_at: now })
      .in("license_id", licenseIds)
      .eq("status", "active");

    // Revoke license(s)
    await svc
      .from("licenses")
      .update({
        status: "revoked",
        revoked_at: now,
        revoked_reason: `Refunded via ${account}${reason ? ": " + reason : ""}`,
      })
      .in("id", licenseIds);
  }

  // 3. Deduct from Ledger: Record expense transaction under selected account (with idempotency guard)
  const customerEmail =
    (order.profiles as any)?.email || (order.profiles as any)?.[0]?.email || "Customer";
  const planName =
    (order.plans as any)?.name || (order.plans as any)?.[0]?.name || "Extension License";

  const currency = order.currency || (account === "Paddle" ? "USD" : "BDT");

  const refundDescPrefix = `Refund for Order #${order.id.slice(0, 8)}`;
  const { data: existingLedger } = await svc
    .from("ledger_transactions")
    .select("id")
    .ilike("description", `${refundDescPrefix}%`)
    .limit(1);

  if (!existingLedger || existingLedger.length === 0) {
    const { error: ledgerErr } = await svc.from("ledger_transactions").insert([
      {
        date: now,
        type: "expense",
        category: "Refund",
        account: account,
        source: "Website",
        amount: Number(amount),
        currency: currency,
        description: `Refund for Order #${order.id.slice(0, 8)} (${customerEmail}) — ${planName}${reason ? ` [${reason}]` : ""}`,
        orders_count: 1,
      },
    ]);

    if (ledgerErr) {
      console.error("Failed to insert refund into ledger_transactions:", ledgerErr);
    }
  } else {
    console.log("Ledger entry already exists for this order refund, skipping duplicate deduction.");
  }

  // 4. Update order status and record refund metadata
  let orderUpdate = await svc
    .from("orders")
    .update({
      status: "refunded",
      refunded_at: now,
      refunded_by: admin.id,
      refund_account: account,
      refund_amount: amount,
      refund_reason: reason || null,
    })
    .eq("id", orderId);

  // Fallback 1: if migration columns are not yet applied on remote database
  if (
    orderUpdate.error &&
    (orderUpdate.error.message.includes("column") || orderUpdate.error.code === "42703")
  ) {
    console.warn(
      "Refund tracking columns not yet in DB, updating status only:",
      orderUpdate.error.message,
    );
    orderUpdate = await svc
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", orderId);
  }

  // Fallback 2: if Postgres check constraint 'orders_status_check' forbids 'refunded'
  // We record status = 'rejected' and store refund details in hold_reason so the operation NEVER fails
  if (
    orderUpdate.error &&
    (orderUpdate.error.message.includes("orders_status_check") ||
      orderUpdate.error.message.includes("check constraint") ||
      orderUpdate.error.code === "23514")
  ) {
    console.warn(
      "orders_status_check forbids 'refunded'. Falling back to 'rejected' with [REFUNDED] marker in hold_reason:",
      orderUpdate.error.message,
    );
    orderUpdate = await svc
      .from("orders")
      .update({
        status: "rejected",
        reviewed_at: now,
        reviewed_by: admin.id,
        hold_reason: `[REFUNDED via ${account} (${currency} ${amount})]: ${reason || "Refund processed"}`,
      })
      .eq("id", orderId);
  }

  if (orderUpdate.error) {
    console.error("Order status update failed:", orderUpdate.error);
    return NextResponse.json(
      { error: "Failed to update order status: " + orderUpdate.error.message },
      { status: 500 },
    );
  }

  // 5. Audit log
  await logAdminAction(admin.id, "REFUNDED_ORDER", orderId, {
    user_id: order.user_id,
    plan_id: order.plan_id,
    license_ids: licenseIds,
    refund_account: account,
    refund_amount: amount,
    reason,
  });

  // 6. Send email notification to customer (optional, non-blocking)
  if (customerEmail && customerEmail !== "Customer") {
    try {
      await sendEmail({
        to: customerEmail,
        subject: `Refund Confirmation for ${planName} — CompX Orbit`,
        html: refundProcessedEmail({
          productName: planName,
          amount: amount,
          currency: currency,
          account: account,
          reason: reason,
        }),
      });
    } catch (emailErr) {
      console.warn("Failed to send refund email:", emailErr);
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Order #${order.id.slice(0, 8)} successfully refunded via ${account}. Amount ৳${amount} deducted from Ledger.`,
    revokedLicenseCount: licenseIds.length,
  });
}
