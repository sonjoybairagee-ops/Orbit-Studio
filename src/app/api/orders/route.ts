import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  planId: z.string(),
  method: z.enum(["bkash", "paddle"]),
  txnRef: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
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

  const { planId, method, txnRef, receiptUrl } = parsed.data;

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

  const isPrecomp = plan.slug === "compx-v111" || (plan.name && plan.name.includes("Precomp"));
  const amount = isPrecomp ? 1 : 2;

  // Standard essential columns present in Supabase orders table
  const essentialPayload: any = {
    user_id: user.id,
    plan_id: plan.id,
    amount: amount,
    currency: plan.currency ?? "USD",
    method,
    txn_ref: txnRef ?? null,
    status: "pending",
  };

  // Try inserting with optional columns first
  let orderResult = await supabase
    .from("orders")
    .insert({
      ...essentialPayload,
      ...(plan.extension_id ? { extension_id: plan.extension_id } : {}),
      ...(receiptUrl ? { receipt_url: receiptUrl } : {}),
    })
    .select()
    .single();

  // If column error occurs (e.g. extension_id, receipt_url missing in schema cache), retry with essential payload
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
