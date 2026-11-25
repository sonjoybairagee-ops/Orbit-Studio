import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type LicenseView } from "@/components/LicenseCard";
import { DashboardView } from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { verified?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Auto-bind any unattached licenses matching user's email
  if (user.email) {
    try {
      const adminClient = createAdminClient();
      await adminClient
        .from("licenses")
        .update({ user_id: user.id })
        .ilike("legacy_email", user.email.toLowerCase())
        .is("user_id", null);
    } catch (bindErr) {
      console.error("Auto-bind licenses error:", bindErr);
    }
  }

  // Licenses -> plan -> bundled extensions, plus every active seat and user orders
  const [{ data: rows }, { data: userOrders }] = await Promise.all([
    supabase
      .from("licenses")
      .select(
        `id, order_id, plan_id, key, status, license_type, max_devices, grace_days, expires_at,
         last_reset_at, revoked_reason, created_at,
         plans ( name, slug, plan_extensions ( extensions ( slug, name ) ) ),
         activations ( id, device_label, os, host_apps, app_version,
                       first_seen, last_seen, status ),
         device_reset_requests ( id, status )`,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, plan_id, status, hold_reason")
      .eq("user_id", user.id),
  ]);

  // Identify refunded orders
  const refundedOrderIds = new Set(
    (userOrders ?? [])
      .filter(
        (o: any) =>
          o.status === "refunded" ||
          (typeof o.hold_reason === "string" && o.hold_reason.startsWith("[REFUNDED")),
      )
      .map((o: any) => o.id),
  );

  const approvedOrderPlanIds = new Set(
    (userOrders ?? [])
      .filter(
        (o: any) =>
          o.status === "approved" &&
          !(typeof o.hold_reason === "string" && o.hold_reason.startsWith("[REFUNDED")),
      )
      .map((o: any) => o.plan_id),
  );

  // STRICT FILTER: Completely hide revoked, suspended, and refunded licenses from customer dashboard
  const visibleRows = (rows ?? []).filter((r: any) => {
    // 1. Must be active (revoked, suspended, expired are completely hidden)
    if (r.status !== "active") return false;

    // 2. Must not have a revocation reason
    if (r.revoked_reason) return false;

    // 3. Must not be linked to a refunded order
    if (r.order_id && refundedOrderIds.has(r.order_id)) return false;

    // 4. If user has refunded orders and this license was paid (not promo/legacy), ensure they have a separate approved order
    if (
      refundedOrderIds.size > 0 &&
      r.license_type === "paid" &&
      !approvedOrderPlanIds.has(r.plan_id)
    ) {
      return false;
    }

    return true;
  });

  const licenses: LicenseView[] = visibleRows.map((r: any) => ({
    id: r.id,
    order_id: r.order_id,
    key: r.key,
    status: r.status,
    license_type: r.license_type,
    max_devices: r.max_devices,
    grace_days: r.grace_days,
    expires_at: r.expires_at,
    last_reset_at: r.last_reset_at,
    revoked_reason: r.revoked_reason,
    planName: r.plans?.name ?? "CompX Legacy Access",
    products: (r.plans?.plan_extensions ?? [])
      .map((pe: any) => pe.extensions)
      .filter(Boolean),
    activations: (r.activations ?? []).filter((a: any) => a.status === "active"),
    pendingReset: (r.device_reset_requests ?? []).some(
      (d: any) => d.status === "pending",
    ),
  }));

  return (
    <DashboardView
      user={user}
      licenses={licenses}
      verified={searchParams.verified === "true"}
    />
  );
}
