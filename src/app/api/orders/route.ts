import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DISCOUNT_CAMPAIGN, isCouponCodeValid } from "@/lib/discount-campaign";

const schema = z.object({
  planId: z.string().regex(/^(?:[0-9a-f-]{36}|[a-z0-9-]+)$/i),
  method: z.enum(["bkash", "nagad", "paddle"]),
  txnRef: z.string().trim().optional().nullable(),
  receiptUrl: z.string().max(500).optional().nullable(),
  seats: z.number().int().min(1).max(10).optional().default(1),
  couponCode: z.string().trim().max(50).optional().nullable(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { planId, method, receiptUrl, seats, couponCode } = parsed.data;
  const txnRef = parsed.data.txnRef?.trim().toUpperCase() || null;
  const deviceSeats = seats;

  // Validate coupon if provided
  let isDiscountApplied = false;
  if (couponCode) {
    if (!isCouponCodeValid(couponCode)) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }

    // Check remaining keys out of 500
    const adminClient = createAdminClient();
    const { count: approvedCount } = await adminClient
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("provider_transaction_id", `%${DISCOUNT_CAMPAIGN.CODE}%`)
      .eq("status", "approved");

    if ((approvedCount ?? 0) >= DISCOUNT_CAMPAIGN.TOTAL_KEYS) {
      return NextResponse.json(
        { error: "The Orbit100 discount limit of 500 keys has been fully claimed." },
        { status: 400 }
      );
    }
    isDiscountApplied = true;
  }

  if (receiptUrl && !receiptUrl.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Invalid receipt path" }, { status: 400 });
  }

  // Basic validation for manual payment transaction IDs
  if (method === "bkash" || method === "nagad") {
    if (!txnRef) {
      return NextResponse.json({ error: "Transaction ID is required for this payment method" }, { status: 400 });
    }
    const isOnlyNumbers = /^\d+$/.test(txnRef);
    const isOnlyLetters = /^[a-zA-Z]+$/.test(txnRef);
    if (isOnlyNumbers || isOnlyLetters || txnRef.length < 8 || txnRef.length > 12) {
      return NextResponse.json({ error: "Invalid Transaction ID format" }, { status: 400 });
    }
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);
  const planQuery = supabase
    .from("plans")
    .select("id,slug,name,billing_type,is_active,is_public,unit_price_usd,unit_price_bdt,paddle_price_id");

  const { data: plan } = isUuid
    ? await planQuery.eq("id", planId).maybeSingle()
    : await planQuery.eq("slug", planId).maybeSingle();

  if (!plan || !plan.is_active || !plan.is_public)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  if (method === "paddle" && !plan.paddle_price_id) {
    return NextResponse.json({ error: "Card checkout is not configured for this plan" }, { status: 409 });
  }

  // Prevent double submissions of manual payments
  if (txnRef) {
    const { data: existingTxn } = await createAdminClient()
      .from("orders")
      .select("id")
      .eq("method", method)
      .ilike("txn_ref", txnRef)
      .in("status", ["pending", "approved"])
      .limit(1)
      .maybeSingle();

    if (existingTxn) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted. Please wait for verification." },
        { status: 400 }
      );
    }
  }

  const unitAmount = Number(
    method === "bkash" || method === "nagad"
      ? plan.unit_price_bdt
      : plan.unit_price_usd,
  );
  if (!Number.isFinite(unitAmount) || unitAmount < 0) {
    return NextResponse.json({ error: "Plan price is not configured" }, { status: 409 });
  }
  const baseAmount = unitAmount * deviceSeats;
  const currency = (method === "bkash" || method === "nagad") ? "BDT" : "USD";

  // Apply 100 Tk discount if coupon is applied
  let finalAmount = baseAmount;
  let providerTxnId: string | null = null;
  if (isDiscountApplied) {
    if (currency === "BDT") {
      finalAmount = Math.max(0, baseAmount - DISCOUNT_CAMPAIGN.DISCOUNT_BDT);
    }
    // Tag provider_transaction_id with unique identifier so it obeys unique index constraint
    providerTxnId = `${DISCOUNT_CAMPAIGN.TAG_PREFIX}:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Standard essential columns present in Supabase orders table
  const essentialPayload: any = {
    user_id: user.id,
    plan_id: plan.id,
    amount: finalAmount,
    currency: currency,
    method,
    txn_ref: txnRef ?? null,
    provider_transaction_id: providerTxnId,
    status: "pending",
    ...(receiptUrl ? { receipt_path: receiptUrl } : {}),
  };

  const orderResult = await supabase
    .from("orders")
    .insert({
      ...essentialPayload,
      max_devices: deviceSeats,
    })
    .select()
    .single();

  if (orderResult.error) {
    return NextResponse.json({ error: orderResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ order: orderResult.data });
}
