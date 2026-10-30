import { Metadata } from "next";
import ToolsExplorer from "@/components/tools/ToolsExplorer";
import { AdBanner } from "@/components/ads/AdBanner";
import { TOOLS_DATA, CATEGORIES } from "@/lib/tools-data";
import { Sparkles, ShieldCheck, Zap, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Tools for Creators & Marketers — CompX Orbit",
  description:
    "80+ fast, private browser-based utilities for PDF editing, image conversion, video & audio, marketing campaigns, subtitles, and developer workflows.",
};

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#26332d] bg-[#050a08] py-20 sm:py-24 text-center">
        {/* Ambient Gradient Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-[#3cff5f]/15 via-[#102a16]/20 to-[#52e2ec]/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Orbit Kicker Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a3f30] bg-[#0b170f] px-4 py-1.5 text-xs font-semibold text-[#a5b8aa] backdrop-blur-md mb-6 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#3cff5f]" />
            <span className="flex items-center gap-1.5 text-[#3cff5f]">
              <i className="h-1.5 w-1.5 rounded-full bg-[#3cff5f] inline-block" /> CompX Orbit Free Tools
            </span>
            <span className="text-[#334538]">•</span>
            <span>80+ Utilities</span>
            <span className="text-[#334538]">•</span>
            <span className="text-[#52e2ec]">100% Client-Side &amp; Private</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#e7eee9] leading-tight">
            Free Online Tools for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#3cff5f] via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Creators &amp; Marketers
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Fast, secure, browser-based utilities for PDF editing, image conversion, video &amp; audio editing, marketing campaign tracking, subtitles, and developer workflows.
          </p>

          {/* Quick Stats Pill */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8da195] font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#3cff5f]" /> Instant Processing
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#3cff5f]" /> 0 Server Uploads
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3cff5f]" /> 100% Free Forever
            </span>
          </div>
        </div>
      </section>

      {/* Top Ad Slot (Active when AdSense ID is set) */}
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
        <AdBanner slot="tools-hub-top" format="horizontal" />
      </div>

      {/* Main Tools Catalog Section */}
      <section id="tools" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full scroll-mt-20">
        <ToolsExplorer tools={TOOLS_DATA} categories={CATEGORIES} />
      </section>

      {/* Bottom Ad Slot (Active when AdSense ID is set) */}
      <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <AdBanner slot="tools-hub-bottom" format="auto" />
      </div>

      {/* Trust & Privacy Guarantee Section */}
      <section className="border-t border-[#26332d] bg-[#080e0b] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e7eee9]">
              Why Use CompX Orbit Tools?
            </h2>
            <p className="mt-2 text-sm text-[#9baaa1]">
              Built with cutting-edge WebAssembly, HTML5, and client-side processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[#26332d] bg-[#101813] p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#29392f] flex items-center justify-center text-[#3cff5f] mb-4 font-bold text-lg">
                🔒
              </div>
              <h3 className="font-bold text-[#e7eee9] text-base">Complete Privacy</h3>
              <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                Your images, PDFs, code, and subtitles never touch our servers. Everything is processed directly inside your browser memory.
              </p>
            </div>

            <div className="rounded-2xl border border-[#26332d] bg-[#101813] p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#0c2333] border border-[#1a3d54] flex items-center justify-center text-[#38bdf8] mb-4 font-bold text-lg">
                ⚡
              </div>
              <h3 className="font-bold text-[#e7eee9] text-base">Lightning Fast</h3>
              <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                No upload delays or server queues. Files are compressed, converted, or analyzed at the full speed of your local device.
              </p>
            </div>

            <div className="rounded-2xl border border-[#26332d] bg-[#101813] p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#27122b] border border-[#4a2052] flex items-center justify-center text-[#d16be9] mb-4 font-bold text-lg">
                🎯
              </div>
              <h3 className="font-bold text-[#e7eee9] text-base">Zero Limits or Paywalls</h3>
              <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                No registration, subscriptions, or watermarks. Enjoy all 80+ tools completely free as part of the CompX creative ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
