import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  planId: z.string(),
  method: z.enum(["bkash", "nagad", "paddle"]),
  txnRef: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  seats: z.number().optional().default(1),
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

  const { planId, method, txnRef, receiptUrl, seats } = parsed.data;
  const deviceSeats = Math.max(1, Math.min(20, seats ?? 1));

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

  // Try finding plan by ID or Slug or fetch fallback plan
  let { data: plan } = await supabase
    .from("plans")
    .select("*")
    .or(`id.eq.${planId},slug.eq.${planId}`)
    .maybeSingle();

  if (!plan) {
    const { data: firstPlan } = await supabase
      .from("plans")
      .select("*")
      .limit(1)
      .maybeSingle();
    plan = firstPlan;
  }

  if (!plan)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // Prevent double submissions of manual payments
  if (txnRef) {
    const { data: existingTxn } = await supabase
      .from("orders")
      .select("id")
      .eq("txn_ref", txnRef)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingTxn) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted. Please wait for verification." },
        { status: 400 }
      );
    }
  }

  const isPrecomp = plan.slug === "compx-v111" || (plan.name && plan.name.includes("Precomp"));
  const unitAmount = (method === "bkash" || method === "nagad") ? (isPrecomp ? 129 : 249) : (isPrecomp ? 1 : 2);
  const amount = unitAmount * deviceSeats;
  const currency = (method === "bkash" || method === "nagad") ? "BDT" : (plan.currency ?? "USD");

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

  // Try inserting with optional columns first
  let orderResult = await supabase
    .from("orders")
    .insert({
      ...essentialPayload,
      max_devices: deviceSeats,
      ...(plan.extension_id ? { extension_id: plan.extension_id } : {}),
    })
    .select()
    .single();

  // If column error occurs (e.g. extension_id missing in schema cache), retry with essential payload
  if (orderResult.error) {
    orderResult = await supabase
      .from("orders")
      .insert(essentialPayload)
      .select()
      .single();
  }

  if (orderResult.error) {
    return NextResponse.json({ error: orderResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ order: orderResult.data });
}
