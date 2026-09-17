"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LicenseCard, type LicenseView } from "@/components/LicenseCard";
import { RedeemForm } from "@/components/RedeemForm";
import { createClient } from "@/lib/supabase/client";

interface DashboardViewProps {
  user: {
    id: string;
    email?: string | null;
    created_at?: string;
  };
  licenses: LicenseView[];
  verified?: boolean;
}

export function DashboardView({ user, licenses, verified }: DashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"licenses" | "assets" | "redeem" | "install" | "support">("licenses");
  const [refreshing, startRefresh] = useTransition();

  const activeCount = licenses.filter((l) => l.status === "active").length;
  const isLegacyUser = licenses.some(
    (l) =>
      l.license_type === "legacy_demo" ||
      l.planName?.toLowerCase().includes("legacy") ||
      l.planName?.toLowerCase().includes("v1.1.1"),
  );

  // Extract display name from email (e.g. sonjoy.bairagee@gmail.com -> Sonjoy Bairagee)
  const emailName = user.email ? user.email.split("@")[0].replace(/[._-]/g, " ") : "CompX Creator";
  const formattedName = emailName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const avatarInitial = formattedName.charAt(0) || "C";

  function handleRefresh() {
    startRefresh(() => router.refresh());
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const tabs = [
    ["licenses", "My licenses"], ["assets", "Bonus assets"], ["redeem", "Redeem key"],
    ["install", "Installation"], ["support", "Support"],
  ] as const;
  return (
    <div className="account-dashboard">
      {verified && <div role="status" className="account-notice">Email confirmed. Your account is ready to use.</div>}
      <header className="account-header">
        <div className="account-identity">
          <span className="account-avatar" aria-hidden="true">{avatarInitial}</span>
          <div><p className="account-eyebrow">YOUR ORBIT WORKSPACE</p><h1>Welcome, {formattedName}</h1><p className="account-email">{user.email}</p></div>
        </div>
        <div className="account-header-actions">
          <span className="account-status">{activeCount > 0 ? activeCount + " active license" + (activeCount === 1 ? "" : "s") : "No active licenses"}</span>
          <button onClick={handleRefresh} disabled={refreshing} aria-busy={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <div className="account-heading"><div><h2>Your licenses & downloads</h2><p>Download your extensions, copy your key and manage your devices.</p></div><Link href="/pricing">Browse products ↗</Link></div>
      <nav className="account-tabs" aria-label="Account sections">
        {tabs.map(([id, label]) => <button key={id} id={"account-tab-" + id} aria-current={activeTab === id ? "page" : undefined} aria-controls="account-content" onClick={() => setActiveTab(id)}>{label}{id === "licenses" && <span>{licenses.length}</span>}</button>)}
      </nav>
      <section id="account-content" aria-labelledby={"account-tab-" + activeTab} aria-busy={refreshing} className="account-content">
          {/* TAB 1: MY LICENSES */}
          {activeTab === "licenses" && (
            <div className="space-y-6">
              {licenses.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0c100e]/90 p-10 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#45c66d]/25 bg-[#45c66d]/10 text-2xl text-[#45c66d]">
                    ◈
                  </div>
                  <h2 className="mt-4 text-xl font-black text-white">No licenses found</h2>
                  <p className="mt-2 text-xs text-[#8c97a8] max-w-sm mx-auto">
                    Once you purchase Orbit Studio or redeem a key, your license card and instant download button will appear here.
                  </p>
                  <Link href="/pricing" className="btn-primary mt-6 inline-flex px-6 py-2.5 text-xs font-bold">
                    Browse Pricing →
                  </Link>
                </div>
              ) : (
                licenses.map((l) => <LicenseCard key={l.id} license={l} />)
              )}
            </div>
          )}

          {/* TAB 2: BONUS ASSETS (MOGRTs & SFX) */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-6 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400">
                  
                  <h3 className="text-base font-black text-white">Included Bonus Assets &amp; Media Library</h3>
                </div>
                <p className="mt-1 text-xs text-[#8c97a8]">
                  Download the bonus packs included with your active license.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 50 MOGRTs */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-2xl">🎬</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                          116 MB
                        </span>
                      </div>
                      <h4 className="mt-3 text-xs font-black text-white">50+ MOGRTs Pack</h4>
                      <p className="mt-1 text-[11px] text-[#8c97a8]">
                        Essential Motion Graphics Templates for Premiere Pro &amp; AE.
                      </p>
                    </div>
                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("50 Mogrt pack.zip")}`}
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 py-2 text-xs font-bold transition-all"
                    >
                      <span>⬇ Download Pack</span>
                    </a>
                  </div>

                  {/* SFX Part 1 */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🎵</span>
                        <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                          265 MB
                        </span>
                      </div>
                      <h4 className="mt-3 text-xs font-black text-white">Premium SFX (Part 1)</h4>
                      <p className="mt-1 text-[11px] text-[#8c97a8]">
                        250+ Cinematic whooshes, hits, risers &amp; UI sounds.
                      </p>
                    </div>
                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("Sfx Part 1.zip")}`}
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 py-2 text-xs font-bold transition-all"
                    >
                      <span>⬇ Download Part 1</span>
                    </a>
                  </div>

                  {/* SFX Part 2 */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🎵</span>
                        <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                          276 MB
                        </span>
                      </div>
                      <h4 className="mt-3 text-xs font-black text-white">Premium SFX (Part 2)</h4>
                      <p className="mt-1 text-[11px] text-[#8c97a8]">
                        250+ Transitions, foley, glitch &amp; atmosphere audio.
                      </p>
                    </div>
                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("Sfx Part 2.zip")}`}
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 py-2 text-xs font-bold transition-all"
                    >
                      <span>⬇ Download Part 2</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REDEEM */}
          {activeTab === "redeem" && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                 Link or Redeem License Key
              </h3>
              <p className="text-xs text-[#8c97a8]">
                If you purchased via external partner, promo, or email invoice, paste your key below to bind it permanently to your CompX account.
              </p>
              <div className="max-w-md pt-2">
                <RedeemForm />
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO INSTALL */}
          {activeTab === "install" && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                     Quick Installation Guide
                  </h3>
                  <p className="text-xs text-[#8c97a8] mt-1">
                    Follow these steps to install Orbit Studio or Orbit Premiere with a ZXP installer.
                  </p>
                </div>
                <a
                  href="https://aescripts.com/learn/zxp-installer/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary px-3 py-1.5 text-xs font-bold"
                >
                  Download AEScripts ZXP Tool ↗
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.05] bg-black/40 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#45c66d]/20 text-xs font-black text-[#45c66d]">
                    1
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-white">Get AEScripts ZXP Installer</h4>
                  <p className="mt-1 text-[11px] text-[#717b8c]">
                    Download and open the free AEScripts ZXP installer for Windows or Mac.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-black/40 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#45c66d]/20 text-xs font-black text-[#45c66d]">
                    2
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-white">Download Extension (.zxp)</h4>
                  <p className="mt-1 text-[11px] text-[#717b8c]">
                    Open My licenses, then download Orbit Studio (.zxp) or Orbit Premiere (.zxp).
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-black/40 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#45c66d]/20 text-xs font-black text-[#45c66d]">
                    3
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-white">Drag &amp; Drop Install</h4>
                  <p className="mt-1 text-[11px] text-[#717b8c]">
                    Drag your downloaded <code>.zxp</code> file directly into the ZXP Installer window.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-black/40 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#45c66d]/20 text-xs font-black text-[#45c66d]">
                    4
                  </span>
                  <h4 className="mt-2 text-xs font-bold text-white">Open in Host App</h4>
                  <p className="mt-1 text-[11px] text-[#717b8c]">
                    Open AE or PR &gt; Window &gt; Extensions &gt; Orbit Studio. Paste your key!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT */}
          {activeTab === "support" && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-6 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Need Help or Community Support?
                </h3>
                <p className="text-xs text-[#8c97a8] mt-1 leading-relaxed">
                  Have questions about activation, device slots, installation or billing? Contact us directly or join our community.
                </p>
              </div>

              {/* Direct Support Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp Support Card */}
                <div className="rounded-xl border border-[#25D366]/30 bg-[#25D366]/[0.05] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">💬</span>
                      <span className="text-[10px] font-mono font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded border border-[#25D366]/30">
                        FASTEST RESPONSE
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-black text-white">WhatsApp Direct Chat</h4>
                    <p className="mt-1 text-[11px] text-[#8c97a8]">
                      Direct 1-on-1 chat with our team for quick licensing &amp; technical help.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/8801922577297?text=Hi%2C%20I%20need%20support%20for%20CompX%20Orbit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black py-2.5 text-xs font-black transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                  >
                    <span>💬 WhatsApp (+880 1922-577297)</span>
                  </a>
                </div>

                {/* Discord Community Card */}
                <div className="rounded-xl border border-[#5865F2]/30 bg-[#5865F2]/[0.05] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🎮</span>
                      <span className="text-[10px] font-mono font-bold text-[#5865F2] bg-[#5865F2]/10 px-2 py-0.5 rounded border border-[#5865F2]/30">
                        COMMUNITY
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-black text-white">Discord Community</h4>
                    <p className="mt-1 text-[11px] text-[#8c97a8]">
                      Connect with 500+ video editors, request features and report bugs.
                    </p>
                  </div>
                  <a
                    href="https://discord.gg/Je8pxakYf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white py-2.5 text-xs font-bold transition-all"
                  >
                    <span>Join Discord Community</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/[0.06]">
                <Link href="/dashboard/support" className="btn-primary text-xs py-2 px-4">
                  Open Support Ticket
                </Link>
                <Link
                  href="/tutorials"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-[#c2cbd8] hover:border-white/20 hover:text-white transition-all"
                >
                  <span>Video Tutorials</span>
                </Link>
                <a
                  href="mailto:support@compxorbit.com"
                  className="text-xs text-[#8c97a8] hover:text-white transition-colors"
                >
                  Email: support@compxorbit.com
                </a>
              </div>
            </div>
          )}

      </section>
      {isLegacyUser && <aside className="account-upgrade"><div><strong>Ready for the full Orbit suite?</strong><p>Explore Orbit Studio and Orbit Premiere license options.</p></div><Link href="/pricing">Compare plans ↗</Link></aside>}
    </div>
  );
}
export default DashboardView;
