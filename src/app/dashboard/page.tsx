import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LicenseCard, type LicenseView } from "@/components/LicenseCard";

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
    planName: r.plans?.name ?? "CompX Legacy Access",
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
      {/* ── Email Confirmation Success Banner ── */}
      {searchParams.verified === "true" && (
        <div className="mb-6 rounded-xl border border-[#45c66d]/40 bg-[#45c66d]/10 p-4 text-sm text-[#45c66d]">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold text-white">Email confirmed successfully!</p>
              <p className="text-xs text-[#aab0bd]">Welcome to CompX Orbit. Your account is verified and ready to use.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Licenses</h1>
          <p className="muted mt-2">
            Manage your keys, devices and downloads in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://discord.gg/Je8pxakYf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 px-4 py-2.5 text-sm font-bold text-[#5865F2] transition-all hover:bg-[#5865F2] hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Join Discord
          </a>
          <Link href="/pricing" className="btn-primary">
            Buy a license →
          </Link>
        </div>
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

      <div className={`mt-8 grid gap-6 ${licenses.length > 1 ? "xl:grid-cols-2" : "grid-cols-1"}`}>
        {licenses.length === 0 ? (
          <div className="card col-span-full p-10 text-center">
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

      <div className="card mt-8 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="label">Need help or community support?</p>
          <p className="muted mt-2 text-sm leading-7 max-w-2xl">
            One license covers one computer at a time, and both After Effects and
            Premiere Pro on that computer share the same seat. You can move to a
            new machine yourself once every 24 hours. If a computer is lost or
            broken, request an admin reset or join our Discord community for instant support.
          </p>
        </div>
        <a
          href="https://discord.gg/Je8pxakYf"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#4752C4]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
          </svg>
          Join Discord
        </a>
      </div>
    </div>
  );
}