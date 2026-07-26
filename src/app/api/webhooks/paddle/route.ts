import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateLicenseKey } from "@/lib/license";
import { licenseIssuedEmail, sendEmail } from "@/lib/email";

function validSignature(raw: string, header: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const values = Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key, rest.join("=")];
    }),
  );
  if (!values.ts || !values.h1) return false;
  // Reject replayed webhooks older than 5 minutes.
  if (Math.abs(Date.now() / 1000 - Number(values.ts)) > 300) return false;
  const digest = createHmac("sha256", secret)
    .update(`${values.ts}:${raw}`)
    .digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(values.h1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("paddle-signature")))
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const payload = JSON.parse(raw);
  const orderId = payload?.data?.custom_data?.order_id;
  if (payload?.event_type !== "transaction.completed" || !orderId)
    return NextResponse.json({ ignored: true });

  const svc = createAdminClient();
  const { data: order } = await svc
    .from("orders")
    .select("*, plans(name), profiles!orders_user_id_fkey(email)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ ignored: true });

  const { data: existing } = await svc
    .from("licenses")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true });

  const key = generateLicenseKey();
  const { error: licenseError } = await svc.from("licenses").insert({
    user_id: order.user_id,
    plan_id: order.plan_id,
    extension_id: order.extension_id,
    order_id: order.id,
    key,
    status: "active",
    legacy_email: (order.profiles as any)?.email ?? null,
  });
  if (licenseError)
    return NextResponse.json({ error: licenseError.message }, { status: 500 });

  await svc
    .from("orders")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", orderId);

  if (order.profiles?.email)
    await sendEmail({
      to: order.profiles.email,
      subject: "Your CompX license is ready",
      html: licenseIssuedEmail(order.plans?.name ?? "your extension", key),
    });

  return NextResponse.json({ ok: true });
}
