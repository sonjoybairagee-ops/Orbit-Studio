"use client";

import { useState } from "react";
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
  const [refreshing, setRefreshing] = useState(false);

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

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="w-full text-white">
      {/* ── Email Verified Banner ── */}
      {verified && (
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

      {/* ── Main Top Header (FLEX style) ── */}
      <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#45c66d]">
            COMPX ORBIT PRO ENGINE
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            LICENSE &amp; PURCHASE HISTORY
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#8c97a8]">
            Access your purchased software licenses, view activations, and track extension downloads.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-[#c2cbd8] hover:border-white/20 hover:text-white transition-all"
          >
            <span>←</span> BACK TO STORE
          </Link>

          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-xl bg-[#45c66d] px-5 py-2.5 text-xs font-black text-black shadow-[0_0_25px_rgba(69,198,109,0.3)] hover:bg-[#38b55e] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>＋</span> BUY PRODUCTS
          </Link>
        </div>
      </div>

      {/* ── Horizontal Tab Navigation Bar (FLEX style) ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-1 ${
            activeTab === "licenses"
              ? "border-[#45c66d] text-[#45c66d] bg-[#45c66d]/5 rounded-t-lg"
              : "border-transparent text-[#8592a3] hover:text-white"
          }`}
        >
          <span>✓</span> MY LICENSES ({licenses.length})
        </button>

        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-1 ${
            activeTab === "assets"
              ? "border-[#45c66d] text-[#45c66d] bg-[#45c66d]/5 rounded-t-lg"
              : "border-transparent text-[#8592a3] hover:text-white"
          }`}
        >
          <span>🎁</span> BONUS ASSETS &amp; SFX
        </button>

        <button
          onClick={() => setActiveTab("redeem")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-1 ${
            activeTab === "redeem"
              ? "border-[#45c66d] text-[#45c66d] bg-[#45c66d]/5 rounded-t-lg"
              : "border-transparent text-[#8592a3] hover:text-white"
          }`}
        >
          <span>🔑</span> REDEEM KEY
        </button>

        <button
          onClick={() => setActiveTab("install")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-1 ${
            activeTab === "install"
              ? "border-[#45c66d] text-[#45c66d] bg-[#45c66d]/5 rounded-t-lg"
              : "border-transparent text-[#8592a3] hover:text-white"
          }`}
        >
          <span>🛠️</span> HOW TO INSTALL
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-1 ${
            activeTab === "support"
              ? "border-[#45c66d] text-[#45c66d] bg-[#45c66d]/5 rounded-t-lg"
              : "border-transparent text-[#8592a3] hover:text-white"
          }`}
        >
          <span>💬</span> COMMUNITY &amp; SUPPORT
        </button>
      </div>

      {/* ── Main 2-Column Content Grid ── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: User Profile & Quick Action Panel ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#45c66d] to-[#25753e] text-2xl font-black text-black shadow-[0_0_20px_rgba(69,198,109,0.3)]">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-white truncate">{formattedName}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#45c66d]/15 px-2 py-0.5 text-[10px] font-black text-[#45c66d] border border-[#45c66d]/30">
                    {activeCount > 0 ? "Pro Member" : "Customer"}
                  </span>
                  <span className="text-[11px] text-[#697485]">✦ Lifetime</span>
                </div>
                <p className="mt-1 text-xs text-[#717b8c] truncate">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-2.5 text-xs font-bold text-[#c2cbd8] transition-all"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={refreshing ? "animate-spin" : ""}
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>{refreshing ? "REFRESHING DATA…" : "REFRESH DATA"}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-transparent hover:bg-red-500/10 px-4 py-2 text-xs font-bold text-[#8f9baa] hover:text-red-400 transition-all"
              >
                <span>⎋ SIGN OUT</span>
              </button>
            </div>
          </div>

          {/* Quick Link Key Form (Left Sidebar) */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <RedeemForm />
          </div>

          {/* Legacy Upgrade Card */}
          {isLegacyUser && (
            <div className="rounded-2xl border border-[#45c66d]/40 bg-gradient-to-br from-[#45c66d]/15 to-transparent p-5 text-left shadow-[0_0_30px_rgba(69,198,109,0.1)]">
              <p className="text-xs font-black uppercase tracking-widest text-[#45c66d]">
                🚀 UPGRADE SUITE
              </p>
              <h4 className="mt-1 text-sm font-black text-white">Upgrade to Orbit Suite (AE + PR)</h4>
              <p className="mt-1 text-xs text-[#aab0bd] leading-relaxed">
                Unlock Orbit Studio (AE) &amp; Premiere (PR), 60+ Tools, 50+ MOGRTs &amp; 500+ SFX for just $5 USD (600 BDT).
              </p>
              <Link href="/pricing" className="btn-primary mt-3 w-full py-2 text-xs font-bold justify-center">
                Upgrade Now ($5) →
              </Link>
            </div>
          )}
        </div>

        {/* ── Right Column: Tab Content ── */}
        <div className="lg:col-span-8 min-w-0">
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
                  <span className="text-xl">🎁</span>
                  <h3 className="text-base font-black text-white">Included Bonus Assets &amp; Media Library</h3>
                </div>
                <p className="mt-1 text-xs text-[#8c97a8]">
                  Cloudflare R2 high-speed download bundles tied to your active license.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 50 MOGRTs */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
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
                <span>🔑</span> Link or Redeem License Key
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
                    <span>🛠️</span> Quick Installation Guide
                  </h3>
                  <p className="text-xs text-[#8c97a8] mt-1">
                    Install Orbit Studio or Orbit Premiere in under 60 seconds using any ZXP installer.
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
                    Click the green Orbit Studio (.zxp) or Orbit Premiere (.zxp) button above.
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
                <span>💬</span> Need Community Support or Help?
              </h3>
              <p className="text-xs text-[#8c97a8] leading-relaxed">
                Join our private Discord community to chat directly with developers, get instant troubleshooting, and discover community presets.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
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
                  <span>▶ Video Tutorials</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: HOW TO INSTALL (Always visible clean guide matching FLEX reference) ── */}
      <div className="mt-16 pt-12 border-t border-white/[0.08]">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            HOW TO INSTALL
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#8c97a8] max-w-lg mx-auto">
            Universal builds for Windows &amp; macOS. Compatible with Adobe After Effects &amp; Premiere Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/80 p-5 transition-all hover:border-[#45c66d]/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#45c66d] text-sm font-black text-black shadow-[0_0_15px_rgba(69,198,109,0.3)]">
              01
            </span>
            <h3 className="mt-3.5 text-sm font-black text-white">Download ZXP Tool</h3>
            <p className="mt-1.5 text-xs text-[#8c97a8] leading-relaxed">
              Download the free AEScripts ZXP Installer or Anastasiy Extension Manager.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/80 p-5 transition-all hover:border-[#45c66d]/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#45c66d] text-sm font-black text-black shadow-[0_0_15px_rgba(69,198,109,0.3)]">
              02
            </span>
            <h3 className="mt-3.5 text-sm font-black text-white">Get Orbit .zxp</h3>
            <p className="mt-1.5 text-xs text-[#8c97a8] leading-relaxed">
              Click the green <b>Orbit Studio (.zxp)</b> or <b>Orbit Premiere (.zxp)</b> button above.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/80 p-5 transition-all hover:border-[#45c66d]/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#45c66d] text-sm font-black text-black shadow-[0_0_15px_rgba(69,198,109,0.3)]">
              03
            </span>
            <h3 className="mt-3.5 text-sm font-black text-white">Drag &amp; Drop</h3>
            <p className="mt-1.5 text-xs text-[#8c97a8] leading-relaxed">
              Drag your downloaded <code>.zxp</code> file into the ZXP Installer to finish setup.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/80 p-5 transition-all hover:border-[#45c66d]/30">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#45c66d] text-sm font-black text-black shadow-[0_0_15px_rgba(69,198,109,0.3)]">
              04
            </span>
            <h3 className="mt-3.5 text-sm font-black text-white">Open in Adobe App</h3>
            <p className="mt-1.5 text-xs text-[#8c97a8] leading-relaxed">
              Go to <b>Window &gt; Extensions &gt; Orbit Studio</b> and paste your license key!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;