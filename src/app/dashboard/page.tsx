import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LicenseCard, type LicenseView } from "@/components/LicenseCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Licenses -> plan -> bundled extensions, plus every active seat.
  const { data: rows } = await supabase
    .from("licenses")
    .select(
      `id, key, status, license_type, max_devices, grace_days, expires_at,
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
    key: r.key,
    status: r.status,
    license_type: r.license_type,
    max_devices: r.max_devices,
    grace_days: r.grace_days,
    expires_at: r.expires_at,
    last_reset_at: r.last_reset_at,
    revoked_reason: r.revoked_reason,
    planName: r.plans?.name ?? "License",
    products: (r.plans?.plan_extensions ?? [])
      .map((pe: any) => pe.extensions)
      .filter(Boolean),
    activations: (r.activations ?? []).filter((a: any) => a.status === "active"),
    pendingReset: (r.device_reset_requests ?? []).some(
      (d: any) => d.status === "pending",
    ),
  }));

  const activeCount = licenses.filter((l) => l.status === "active").length;
  const seatsUsed = licenses.reduce((n, l) => n + l.activations.length, 0);
  const seatsTotal = licenses
    .filter((l) => l.status === "active")
    .reduce((n, l) => n + l.max_devices, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Licenses</h1>
          <p className="muted mt-2">
            Manage your keys, devices and downloads in one place.
          </p>
        </div>
        <Link href="/pricing" className="btn-primary">
          Buy a license →
        </Link>
      </div>

      <div className="stat-grid mt-7">
        <div className="card p-5">
          <p className="label">Active licenses</p>
          <p className="mt-1 text-3xl font-black">{activeCount}</p>
        </div>
        <div className="card p-5">
          <p className="label">Devices in use</p>
          <p className="mt-1 text-3xl font-black">
            {seatsUsed}
            <span className="muted text-lg">/{seatsTotal || 0}</span>
          </p>
        </div>
        <div className="card p-5">
          <p className="label">Signed in as</p>
          <p className="mt-1 truncate text-sm font-bold">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {licenses.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#45c66d]/25 bg-[#45c66d]/10 text-3xl">
              ◈
            </div>
            <h2 className="mt-5 text-2xl font-black">No licenses yet</h2>
            <p className="muted mx-auto mt-3 max-w-[440px] leading-7">
              Once you buy Orbit Studio, your key appears here instantly
              along with your private download links. Already have a key from
              us? Redeem it in the sidebar.
            </p>
            <Link href="/pricing" className="btn-primary mt-7">
              See pricing →
            </Link>
          </div>
        ) : (
          licenses.map((l) => <LicenseCard key={l.id} license={l} />)
        )}
      </div>

      <div className="card mt-8 p-6">
        <p className="label">Need help?</p>
        <p className="muted mt-2 text-sm leading-7">
          One license covers one computer at a time, and both After Effects and
          Premiere Pro on that computer share the same seat. You can move to a
          new machine yourself once every 24 hours. If a computer is lost or
          broken, request an admin reset from the license above and we will
          clear the seat for you.
        </p>
      </div>
    </div>
  );
}