import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  planId: z.string().regex(/^(?:[0-9a-f-]{36}|[a-z0-9-]+)$/i),
  method: z.enum(["bkash", "nagad", "paddle"]),
  txnRef: z.string().trim().optional().nullable(),
  receiptUrl: z.string().max(500).optional().nullable(),
  seats: z.number().int().min(1).max(10).optional().default(1),
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

  const { planId, method, receiptUrl, seats } = parsed.data;
  const txnRef = parsed.data.txnRef?.trim().toUpperCase() || null;
  const deviceSeats = seats;

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

  const { data: plan } = await supabase
    .from("plans")
    .select("id,slug,name,billing_type,is_active,is_public,unit_price_usd,unit_price_bdt,paddle_price_id")
    .or(`id.eq.${planId},slug.eq.${planId}`)
    .maybeSingle();

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
  const amount = unitAmount * deviceSeats;
  const currency = (method === "bkash" || method === "nagad") ? "BDT" : "USD";

  // Standard essential columns present in Supabase orders table
  const essentialPayload: any = {
    user_id: user.id,
    plan_id: plan.id,
    amount: amount,
    currency: currency,
    method,
    txn_ref: txnRef ?? null,
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
