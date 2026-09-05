import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LicenseAdminActions } from "@/components/LicenseAdminActions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const s = createAdminClient();

  const { data: profile } = await s
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!profile) return notFound();

  const [ordersRes, licensesRes, resetsRes] = await Promise.all([
    s
      .from("orders")
      .select("*, plans(name, slug)")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false }),
    s
      .from("licenses")
      .select(
        `*,
         plans (
           id, name, slug, price, billing_type, max_devices,
           plan_extensions (
             extensions ( id, slug, name, host_app, description, bundle_id )
           )
         ),
         activations (*)`
      )
      .eq("user_id", params.id)
      .order("created_at", { ascending: false }),
    s
      .from("device_reset_requests")
      .select("*")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  const orders = ordersRes.data ?? [];
  const licenses = licensesRes.data ?? [];
  const resets = resetsRes.data ?? [];

  return (
    <div className="space-y-6">
      {/* ── Top Navigation & User Header ── */}
      <div>
        <Link href="/admin/users" className="muted text-sm hover:text-white inline-flex items-center gap-1 mb-3">
          ← Back to Customer Directory
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c100e] p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.full_name || "Unnamed Customer"}</h1>
              <span className={`badge ${profile.role === "admin" ? "badge-amber" : "badge-green"}`}>
                {profile.role.toUpperCase()}
              </span>
              {profile.is_banned && (
                <span className="badge bg-red-600/20 text-red-400 border border-red-500/40 font-bold">
                  BANNED
                </span>
              )}
            </div>
            <p className="font-mono text-sm text-[#45c66d] mt-1">{profile.email}</p>
            <p className="text-xs text-[#717b8c] mt-0.5">
              Customer ID: <code className="text-[#aab0bd]">{profile.id}</code> · Joined {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge bg-white/5 border border-white/10 text-xs px-3 py-1.5 text-white font-mono">
              {licenses.length} License{licenses.length !== 1 ? "s" : ""}
            </span>
            <span className="badge bg-white/5 border border-white/10 text-xs px-3 py-1.5 text-white font-mono">
              {orders.length} Order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Column (Licenses, Entitlements & Live Activations) - 7 cols */}
        <div className="xl:col-span-7 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold uppercase tracking-wider text-xs text-[#aab0bd]">
                Customer Licenses &amp; Live Activations ({licenses.length})
              </h2>
            </div>

            {licenses.map((lic: any) => {
              const allowedExtensions: any[] = (lic.plans?.plan_extensions ?? [])
                .map((pe: any) => pe.extensions)
                .filter(Boolean);

              const hasAe = allowedExtensions.some((e: any) => e.host_app === "AEFT" || e.slug === "orbit-studio");
              const hasPr = allowedExtensions.some((e: any) => e.host_app === "PPRO" || e.slug === "orbit-premiere");
              const isCombo = (hasAe && hasPr) || lic.plans?.slug === "orbit-bundle";

              const activations = lic.activations ?? [];
              const activeSeats = activations.filter((a: any) => a.status === "active");

              return (
                <div key={lic.id} className="rounded-2xl border border-white/10 bg-[#0c100e] p-5 sm:p-6 shadow-xl space-y-5">
                  {/* License Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-base text-white">{lic.plans?.name ?? "Custom License"}</b>
                        {isCombo ? (
                          <span className="badge badge-amber text-[10px] font-black">AE + PR COMBO</span>
                        ) : hasPr ? (
                          <span className="badge bg-[#3ddc6e]/20 text-[#3ddc6e] border border-[#3ddc6e]/40 text-[10px] font-bold">PREMIERE ONLY</span>
                        ) : (
                          <span className="badge badge-purple text-[10px] font-bold">AFTER EFFECTS ONLY</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-[#717b8c]">KEY:</span>
                        <code className="font-mono text-sm font-bold text-[#45c66d] bg-black/40 px-2 py-0.5 rounded border border-white/5 select-all">
                          {lic.key}
                        </code>
                      </div>
                    </div>
                    <span className={`badge ${lic.status === "active" ? "badge-green" : "badge-amber"}`}>
                      {lic.status.toUpperCase()}
                    </span>
                  </div>

                  {/* ── System Entitlement & Dashboard Simulator ── */}
                  <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#45c66d]">
                      🖥️ What User Dashboard Is Showing (Downloads &amp; Access):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {/* After Effects Plugin */}
                      <div className={`rounded-lg p-3 border ${hasAe ? "bg-purple-950/20 border-purple-500/30 text-purple-200" : "bg-white/[0.02] border-white/5 text-[#555] opacity-50"}`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>✨ Orbit Studio (AE)</span>
                          {hasAe ? <span className="text-purple-400 font-bold">✓ ENABLED</span> : <span>✕ NOT IN PLAN</span>}
                        </div>
                        <p className="text-[10px] text-[#aab0bd] mt-1 font-mono">
                          {hasAe ? "CompX-Orbit-Studio-v2.4.15.zxp" : "Download button hidden"}
                        </p>
                      </div>

                      {/* Premiere Pro Plugin */}
                      <div className={`rounded-lg p-3 border ${hasPr ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" : "bg-white/[0.02] border-white/5 text-[#555] opacity-50"}`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>🎬 Orbit Premiere (PR)</span>
                          {hasPr ? <span className="text-[#45c66d] font-bold">✓ ENABLED</span> : <span>✕ NOT IN PLAN</span>}
                        </div>
                        <p className="text-[10px] text-[#aab0bd] mt-1 font-mono">
                          {hasPr ? "CompX-Orbit-Premiere-v2.4.15.zxp" : "Download button hidden"}
                        </p>
                      </div>
                    </div>

                    {/* Bonus Assets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-[#717b8c]">
                      <span>Included Shelf Assets:</span>
                      <span className="badge bg-white/5 text-white/70 border-white/10 text-[9px]">50 Mogrt pack.zip</span>
                      <span className="badge bg-white/5 text-white/70 border-white/10 text-[9px]">Sfx Part 1.zip</span>
                      <span className="badge bg-white/5 text-white/70 border-white/10 text-[9px]">Sfx Part 2.zip</span>
                    </div>
                  </div>

                  {/* ── Live Device & Host App Activation Inspector ── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="label text-xs font-bold text-[#aab0bd]">
                        ⚡ Active Workstations &amp; Apps ({activeSeats.length} / {lic.max_devices} Seats Used)
                      </p>
                      <span className="text-xs text-[#717b8c]">
                        {lic.max_devices - activeSeats.length} Seat{lic.max_devices - activeSeats.length !== 1 ? "s" : ""} Available
                      </span>
                    </div>

                    {activeSeats.length > 0 ? (
                      <div className="space-y-2.5">
                        {activeSeats.map((act: any) => {
                          const hostApps: string[] = act.host_apps ?? [];
                          const usedPpro = hostApps.includes("PPRO") || hostApps.some((h: string) => /ppro|premiere/i.test(h));
                          const usedAeft = hostApps.includes("AEFT") || hostApps.some((h: string) => /aeft|after/i.test(h));

                          return (
                            <div key={act.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-white">{act.device_label ?? "Workstation"}</span>
                                  <span className="badge bg-white/5 text-[#aab0bd] text-[10px] border-white/10">
                                    {act.os ?? "OS Unknown"}
                                  </span>
                                  {act.app_version && (
                                    <span className="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-mono">
                                      v{act.app_version}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#717b8c]">
                                  Last used: {new Date(act.last_seen).toLocaleString()}
                                </span>
                              </div>

                              {/* Host Apps Badges */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                                <span className="text-xs font-bold text-[#717b8c]">Activated Apps:</span>
                                {usedPpro && (
                                  <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                    <span>🎬</span> Premiere Pro (Active)
                                  </span>
                                )}
                                {usedAeft && (
                                  <span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
                                    <span>✨</span> After Effects (Active)
                                  </span>
                                )}
                                {!usedPpro && !usedAeft && (
                                  <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                                    General Activation
                                  </span>
                                )}
                              </div>

                              {/* Combo Status Diagnosis */}
                              {isCombo && usedPpro && !usedAeft && (
                                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300">
                                  <b>ℹ️ Admin Note:</b> User activated this key in <b>Premiere Pro only</b>. The After Effects plugin is enabled under their plan, but they have not opened Orbit Studio in AE yet. Their key <code>{lic.key}</code> will activate AE automatically without consuming extra seats.
                                </div>
                              )}
                              {isCombo && usedAeft && !usedPpro && (
                                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300">
                                  <b>ℹ️ Admin Note:</b> User activated this key in <b>After Effects only</b>. Premiere Pro is enabled and waiting for them to open in Premiere.
                                </div>
                              )}
                              {isCombo && usedPpro && usedAeft && (
                                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-xs text-emerald-300">
                                  ✅ <b>Fully Synchronized:</b> User is actively running both After Effects and Premiere Pro!
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-[#717b8c]">
                        No active device activations recorded yet. The user has not activated the key inside Adobe apps.
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-white/[0.08] pt-4">
                    <LicenseAdminActions licenseId={lic.id} status={lic.status} maxDevices={lic.max_devices} />
                  </div>
                </div>
              );
            })}

            {licenses.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-8 text-center text-sm text-[#717b8c]">
                No licenses associated with this customer account.
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Orders & Device Reset History) - 5 cols */}
        <div className="xl:col-span-5 space-y-6">
          {/* Orders Section */}
          <section className="space-y-4">
            <h2 className="font-bold uppercase tracking-wider text-xs text-[#aab0bd]">
              Orders &amp; Payment History ({orders.length})
            </h2>

            <div className="space-y-3">
              {orders.map((o: any) => (
                <div key={o.id} className="rounded-2xl border border-white/10 bg-[#0c100e] p-4 sm:p-5 shadow-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <b className="text-sm text-white block">{o.plans?.name ?? "Order"}</b>
                      <p className="text-xs text-[#717b8c] mt-0.5">
                        {new Date(o.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <b className="text-sm text-white block font-mono">
                        {o.currency} {o.amount}
                      </b>
                      <span className={`badge mt-1 text-[10px] ${o.status === "approved" ? "badge-green" : o.status === "pending" ? "badge-amber" : "badge-red"}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#717b8c]">Method:</span>
                      <span className="badge bg-white/5 border-white/10 text-[10px] uppercase font-bold text-white">
                        {o.method}
                      </span>
                    </div>

                    {o.txn_ref && (
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="text-[#717b8c]">Txn:</span>
                        <code className="text-[#45c66d] bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          {o.txn_ref}
                        </code>
                      </div>
                    )}
                  </div>

                  {o.receipt_path && (
                    <div className="pt-2">
                      <a
                        href={`/api/admin/receipt?path=${encodeURIComponent(o.receipt_path)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>🧾</span> View Payment Receipt
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {orders.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-6 text-center text-sm text-[#717b8c]">
                  No orders recorded for this user.
                </div>
              )}
            </div>
          </section>

          {/* Reset Requests Section */}
          <section className="space-y-4">
            <h2 className="font-bold uppercase tracking-wider text-xs text-[#aab0bd]">
              Device Reset History ({resets.length})
            </h2>

            <div className="space-y-3">
              {resets.map((r: any) => (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-[#0c100e] p-4 shadow-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#aab0bd]">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    <span className={`badge text-[10px] ${r.status === "approved" ? "badge-green" : r.status === "pending" ? "badge-amber" : "badge-red"}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  {r.reason && (
                    <p className="text-xs text-[#717b8c] bg-black/30 p-2.5 rounded-lg border border-white/5">
                      <b className="text-white/80">Reason:</b> "{r.reason}"
                    </p>
                  )}
                </div>
              ))}

              {resets.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#0c100e] p-6 text-center text-sm text-[#717b8c]">
                  No device reset requests found.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
