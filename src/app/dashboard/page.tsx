import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Licenses -> plan -> bundled extensions, plus every active seat.
  const { data: rows } = await supabase
    .from("licenses")
    .select(
      `id, order_id, key, status, license_type, max_devices, grace_days, expires_at,
       last_reset_at, revoked_reason, created_at,
       plans ( name, slug, plan_extensions ( extensions ( slug, name ) ) ),
       activations ( id, device_label, os, host_apps, app_version,
                     first_seen, last_seen, status ),
       device_reset_requests ( id, status )`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const licenses: LicenseView[] = (rows ?? []).map((r: any) => ({
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
