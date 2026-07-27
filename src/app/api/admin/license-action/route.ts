import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, logAdminAction } from "@/lib/supabase/admin";
import { sendEmail, resetApprovedEmail } from "@/lib/email";

// Every admin action on a license funnels through here so that the audit
// log always records who did what and why.
const schema = z.object({
  licenseId: z.string().uuid(),
  action: z.enum([
    "force_reset",
    "revoke",
    "suspend",
    "reactivate",
    "set_seats",
  ]),
  reason: z.string().min(3, "Please write a short reason.").max(500),
  maxDevices: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin)
    return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );

  const { licenseId, action, reason, maxDevices } = parsed.data;
  const svc = createAdminClient();
  const now = new Date().toISOString();

  const { data: license } = await svc
    .from("licenses")
    .select("id, key, user_id, status, profiles ( email )")
    .eq("id", licenseId)
    .maybeSingle();

  if (!license)
    return NextResponse.json({ error: "License not found." }, { status: 404 });

  let message = "";

  if (action === "force_reset") {
    // Release every active seat AND clear the cooldown so the customer can
    // activate again immediately.
    await svc
      .from("activations")
      .update({ status: "released", released_at: now })
      .eq("license_id", licenseId)
      .eq("status", "active");

    await svc
      .from("licenses")
      .update({ last_reset_at: null })
      .eq("id", licenseId);

    await svc
      .from("device_reset_requests")
      .update({
        status: "approved",
        forced: true,
        reviewed_by: admin.id,
        reviewed_at: now,
      })
      .eq("license_id", licenseId)
      .eq("status", "pending");

    const email = (license as any).profiles?.email;
    if (email) {
      await sendEmail({
        to: email,
        subject: "Your device reset is complete",
        html: resetApprovedEmail("CompX Orbit"),
      });
    }
    message = "All devices released and the cooldown was cleared.";
  }

  if (action === "revoke") {
    await svc
      .from("activations")
      .update({ status: "blocked", released_at: now })
      .eq("license_id", licenseId)
      .eq("status", "active");

    await svc
      .from("licenses")
      .update({ status: "revoked", revoked_at: now, revoked_reason: reason })
      .eq("id", licenseId);

    message = "License revoked and all devices blocked.";
  }

  if (action === "suspend") {
    await svc.from("licenses").update({ status: "suspended" }).eq("id", licenseId);
    message = "License suspended. The panel will lock at the next check-in.";
  }

  if (action === "reactivate") {
    await svc
      .from("licenses")
      .update({ status: "active", revoked_at: null, revoked_reason: null })
      .eq("id", licenseId);
    message = "License reactivated.";
  }

  if (action === "set_seats") {
    if (!maxDevices)
      return NextResponse.json(
        { error: "Please choose a device limit." },
        { status: 400 },
      );
    await svc
      .from("licenses")
      .update({ max_devices: maxDevices })
      .eq("id", licenseId);
    message = `Device limit set to ${maxDevices}.`;
  }

  await svc.from("license_events").insert({
    license_id: licenseId,
    user_id: license.user_id,
    actor_id: admin.id,
    event: action === "set_seats" ? "issue" : action,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent"),
    meta: { reason, action, maxDevices: maxDevices ?? null, source: "admin" },
  });

  await logAdminAction(admin.id, action.toUpperCase() + "_LICENSE", licenseId, { reason, maxDevices: maxDevices ?? null });

  return NextResponse.json({ ok: true, message });
}
