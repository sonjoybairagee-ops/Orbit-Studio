import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateLicenseKey } from "@/lib/license";
import { sendEmail, licenseIssuedEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { orderId, action } = parsed.data;

  const svc = createAdminClient();
  const { data: order } = await svc
    .from("orders")
    .select("*, extensions(name)")
    .eq("id", orderId)
    .single();
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "pending")
    return NextResponse.json(
      { error: "Order already reviewed" },
      { status: 409 },
    );

  const reviewed = {
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  };

  if (action === "reject") {
    await svc
      .from("orders")
      .update({ status: "rejected", ...reviewed })
      .eq("id", orderId);
    return NextResponse.json({ ok: true });
  }

  // Approve -> mark paid and AUTO-ISSUE a license.
  await svc
    .from("orders")
    .update({ status: "approved", ...reviewed })
    .eq("id", orderId);

  const { data: license, error } = await svc
    .from("licenses")
    .insert({
      user_id: order.user_id,
      plan_id: order.plan_id,
      extension_id: order.extension_id,
      order_id: order.id,
      key: generateLicenseKey(),
      status: "active",
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Email the license key to the buyer.
  const { data: profile } = await svc
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .single();
  if (profile?.email) {
    await sendEmail({
      to: profile.email,
      subject: "Your license key is ready",
      html: licenseIssuedEmail(
        order.extensions?.name ?? "your extension",
        license.key,
      ),
    });
  }

  return NextResponse.json({ ok: true, license });
}
