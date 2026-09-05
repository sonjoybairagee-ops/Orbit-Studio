import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
const schema = z.object({
  extensionId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().min(3).max(3),
  billingType: z.enum(["lifetime", "monthly", "yearly"]),
  paddlePriceId: z.string().optional(),
  features: z.array(z.string()),
});
export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const p = schema.safeParse(await req.json());
  if (!p.success)
    return NextResponse.json({ error: "Invalid plan data" }, { status: 400 });
  const s = createAdminClient();
  const { data, error } = await s
    .from("plans")
    .insert({
      extension_id: p.data.extensionId,
      name: p.data.name,
      price: p.data.price,
      currency: p.data.currency.toUpperCase(),
      billing_type: p.data.billingType,
      paddle_price_id: p.data.paddlePriceId || null,
      features: p.data.features,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  unit_price_usd: z.number().min(0).optional(),
  unit_price_bdt: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  is_public: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });

  const { id, ...updates } = parsed.data;
  const s = createAdminClient();

  // If unit_price_usd is set, sync price field as well
  if (updates.unit_price_usd !== undefined && updates.price === undefined) {
    updates.price = updates.unit_price_usd;
  }

  const { data, error } = await s
    .from("plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan: data });
}

