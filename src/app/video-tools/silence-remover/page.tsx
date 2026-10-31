import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle, Film, Sliders } from "lucide-react";
import SilenceRemoverTool from "@/components/tools/SilenceRemoverTool";

export const metadata: Metadata = {
  title: "Free AI Video Silence Remover — Auto Jump Cut Generator (TimeBolt & Recut Alternative)",
  description:
    "Automatically detect and remove dead-air pauses and silence from any video or audio file online. 100% Free, zero watermarks, and 1-click export to Adobe Premiere Pro XML and DaVinci Resolve EDL.",
  keywords: [
    "silence remover",
    "video silence remover",
    "remove silence from video online",
    "auto jump cut generator",
    "timebolt alternative free",
    "recut alternative free",
    "cut dead air from audio",
    "premiere pro silence remover",
    "davinci resolve silence remover edl",
    "podcast silence remover",
  ],
  alternates: {
    canonical: "/video-tools/silence-remover",
  },
  openGraph: {
    title: "Free AI Video Silence Remover & Jump Cut Generator",
    description:
      "Cut awkward pauses and silent gaps from your videos automatically. Free in-browser processing with Premiere Pro XML and DaVinci Resolve EDL export.",
    url: "/video-tools/silence-remover",
    type: "website",
  },
};

export default function SilenceRemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit AI Video Silence Remover",
    url: "https://compxorbit.com/video-tools/silence-remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online video and audio silence remover. Automatically detects silent gaps, generates jump cuts, and exports Premiere Pro XML and DaVinci Resolve EDL timelines.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono text-[#9baaa1]">
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <span>/</span>
          <Link href="/video-tools" className="hover:text-[#3cff5f] transition-colors">
            Video Tools
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">Silence Remover</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2a5234] bg-[#102a16] text-[#3cff5f] text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free TimeBolt & Recut Alternative • Unlimited File Size</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            AI Video Silence Remover &amp;{" "}
            <span className="bg-gradient-to-r from-[#3cff5f] to-[#20b240] bg-clip-text text-transparent">
              Jump Cut Generator
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Eliminate awkward dead-air pauses and silent intervals from tutorials, podcasts, and YouTube videos.
            Export directly to <strong>Adobe Premiere Pro XML</strong> and <strong>DaVinci Resolve EDL</strong> with zero watermarks.
          </p>
        </div>

        {/* Main Interactive Tool Component */}
        <SilenceRemoverTool />

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Save 80% Editing Time</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Trimming pauses manually takes hours. CompX Orbit analyzes your audio in seconds and eliminates dead air with frame-accurate jump cuts.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
              <Film className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">NLE Timeline Export</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Download standard Premiere Pro XML or DaVinci Resolve EDL files. Drop them into your project to get a pre-cut sequence with full control to tweak.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Your video and audio never leaves your computer. All waveform analysis and cut calculations execute entirely inside your web browser.
            </p>
          </div>
        </div>

        {/* How It Works & FAQ Section */}
        <div className="mt-16 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-10 space-y-8">
          <div className="border-b border-[#213026] pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#3cff5f]" />
              <span>How to Use the Free Silence Remover</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-1">
              Step-by-step guide to cutting silence and importing timelines into your editor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#9baaa1]">
            <div className="space-y-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold text-[11px]">
                1
              </span>
              <h4 className="text-sm font-bold text-white">Upload Media</h4>
              <p>
                Drag and drop your raw MP4, MOV, WEBM, or audio recording into the dropzone. Processing starts immediately.
              </p>
            </div>

            <div className="space-y-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold text-[11px]">
                2
              </span>
              <h4 className="text-sm font-bold text-white">Choose Preset</h4>
              <p>
                Pick <strong>Balanced</strong> for normal YouTube videos, <strong>Aggressive</strong> for rapid Shorts/Reels, or customize dB sensitivity.
              </p>
            </div>

            <div className="space-y-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold text-[11px]">
                3
              </span>
              <h4 className="text-sm font-bold text-white">Export Timeline</h4>
              <p>
                Click <strong>Download Premiere Pro XML</strong> or <strong>DaVinci Resolve EDL</strong>. Open your editor and import the timeline to see cuts applied!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

