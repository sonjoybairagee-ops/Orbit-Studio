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
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                 Need Community Support or Help?
              </h3>
              <p className="text-xs text-[#8c97a8] leading-relaxed">
                Join our private Discord community to chat directly with developers, get instant troubleshooting, and discover community presets.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2"><Link href="/dashboard/support" className="btn-primary">Contact support</Link>
                <a
                  href="https://discord.gg/Je8pxakYf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#4752C4] transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <span>Join Discord Community</span>
                </a>

                <Link
                  href="/tutorials"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-[#c2cbd8] hover:border-white/20 hover:text-white transition-all"
                >
                  <span>Video tutorials</span>
                </Link>
              </div>
            </div>
          )}

      </section>
      {isLegacyUser && <aside className="account-upgrade"><div><strong>Ready for the full Orbit suite?</strong><p>Explore Orbit Studio and Orbit Premiere license options.</p></div><Link href="/pricing">Compare plans ↗</Link></aside>}
    </div>
  );
}
export default DashboardView;
