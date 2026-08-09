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

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const transaction = payload?.data;
  const orderId = transaction?.custom_data?.order_id;
  if (
    payload?.event_type !== "transaction.completed" ||
    !orderId ||
    !/^txn_[a-z0-9]+$/.test(String(transaction?.id ?? ""))
  )
    return NextResponse.json({ ignored: true });

  const svc = createAdminClient();
  const { data: order } = await svc
    .from("orders")
    .select("*, plans(name,paddle_price_id), profiles!orders_user_id_fkey(email,full_name)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ ignored: true });
  if (order.method !== "paddle")
    return NextResponse.json({ error: "Order is not a Paddle order" }, { status: 409 });

  const items = Array.isArray(transaction?.items) ? transaction.items : [];
  const matchingQuantity = items
    .filter((item: any) => item?.price?.id === order.plans?.paddle_price_id)
    .reduce((sum: number, item: any) => sum + Number(item?.quantity ?? 0), 0);
  if (
    items.length !== 1 ||
    !order.plans?.paddle_price_id ||
    matchingQuantity !== Number(order.max_devices ?? 1)
  ) {
    return NextResponse.json({ error: "Paddle price or seat quantity mismatch" }, { status: 409 });
  }

  const currency = String(
    transaction?.currency_code ?? transaction?.details?.totals?.currency_code ?? "",
  ).toUpperCase();
  const grandTotalMinor = Number(transaction?.details?.totals?.grand_total);
  if (currency !== "USD" || !Number.isFinite(grandTotalMinor) || grandTotalMinor <= 0) {
    return NextResponse.json({ error: "Invalid Paddle totals" }, { status: 409 });
  }

  const { data: existing } = await svc
    .from("licenses")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true });

  const { data: issued, error: licenseError } = await svc.rpc(
    "approve_order_and_issue_license",
    {
      p_order_id: order.id,
      p_license_key: generateLicenseKey(),
      p_admin_id: null,
      p_provider_transaction_id: transaction.id,
      p_paid_amount: grandTotalMinor / 100,
      p_paid_currency: currency,
    },
  );
  const license = Array.isArray(issued) ? issued[0] : issued;
  if (licenseError || !license) {
    return NextResponse.json(
      { error: licenseError?.message ?? "License was not issued" },
      { status: 500 },
    );
  }

  if (order.profiles?.email)
    await sendEmail({
      to: order.profiles.email,
      subject: "Your CompX license is ready",
      html: licenseIssuedEmail(
        order.plans?.name ?? "your extension",
        license.key,
        order.profiles.full_name || "Creator",
        license.max_devices,
        order.id,
      ),
    });

  return NextResponse.json({ ok: true });
}
