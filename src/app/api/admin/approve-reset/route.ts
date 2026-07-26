import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { getDeviceResetEmailHtml } from "@/lib/emails/licenseTemplates";

const schema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { requestId, action, reason } = parsed.data;
  const svc = createAdminClient();
  const now = new Date().toISOString();

  const { data: rr } = await svc
    .from("device_reset_requests")
    .select("id, status, license_id, user_id, profiles ( email ), licenses ( plans ( name ) )")
    .eq("id", requestId)
    .maybeSingle();

  if (!rr || rr.status !== "pending")
    return NextResponse.json(
      { error: "Not found or already reviewed." },
      { status: 404 },
    );

  await svc
    .from("device_reset_requests")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_by: admin.id,
      reviewed_at: now,
    })
    .eq("id", requestId);

  if (action === "approve") {
    // Release the seats and start a fresh 24 hour cooldown.
    await svc
      .from("activations")
      .update({ status: "released", released_at: now })
      .eq("license_id", rr.license_id)
      .eq("status", "active");

    await svc
      .from("licenses")
      .update({ last_reset_at: now })
      .eq("id", rr.license_id);

    const email = (rr as any).profiles?.email;
    const extensionName = (rr as any).licenses?.plans?.name ?? "CompX Extension";
    const licenseKey = (rr as any).licenses?.key ?? "";

    if (email) {
      try {
        const html = getDeviceResetEmailHtml({
          customerName: email.split("@")[0],
          extensionName,
          licenseKey,
        });

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>",
          to: email,
          subject: `Device Reset Approved for ${extensionName} — CompX Orbit`,
          html,
        });
      } catch (e) {
        console.error("Failed to send device reset email:", e);
      }
    }
  }

  await svc.from("license_events").insert({
    license_id: rr.license_id,
    user_id: rr.user_id,
    actor_id: admin.id,
    event: action === "approve" ? "reset_approve" : "reset_reject",
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { reason: reason ?? null, source: "admin" },
  });

  return NextResponse.json({ ok: true });
}
