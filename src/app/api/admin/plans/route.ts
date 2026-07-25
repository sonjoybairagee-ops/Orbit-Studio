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
