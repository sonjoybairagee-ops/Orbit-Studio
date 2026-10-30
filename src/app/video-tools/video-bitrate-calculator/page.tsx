import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VideoBitrateCalcTool from "@/components/tools/VideoBitrateCalcTool";

export const metadata: Metadata = {
  title: "Free Video Bitrate & File Size Calculator (Discord, YouTube) | Compx Orbit",
  description:
    "Calculate exact target export bitrates to fit Discord 25MB, WhatsApp 16MB, or Email file limits in Premiere Pro and After Effects. Plus complete 2026 Social Media Video Specs Cheat Sheet.",
  keywords: [
    "video bitrate calculator",
    "video file size calculator",
    "discord 25mb bitrate calculator",
    "premiere pro export bitrate calculator",
    "youtube recommended video bitrate",
    "social media video specs 2026",
    "tiktok reels resolution and bitrate",
  ],
  alternates: {
    canonical: "/video-tools/video-bitrate-calculator",
  },
  openGraph: {
    title: "Free Video Bitrate & File Size Calculator (Discord, YouTube) | Compx Orbit",
    description:
      "Calculate the exact bitrate needed to compress your video under Discord, Email, and social media upload limits.",
    url: "/video-tools/video-bitrate-calculator",
    type: "website",
  },
};

export default function VideoBitrateCalcPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video Bitrate & File Size Calculator",
    url: "https://compxorbit.com/video-tools/video-bitrate-calculator",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Calculate exact export bitrates and estimated file sizes for video editing and social platforms.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9baaa1] mb-6">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/video-tools" className="hover:text-[#3cff5f] transition-colors">Video Tools</Link>
          <span>/</span>
          <span className="text-[#e7eee9]">Video Bitrate Calculator</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Export Optimization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Video Bitrate &amp; File Size Calculator
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Hit exact Discord (25MB/100MB), WhatsApp (16MB), or Email file limits in Premiere Pro, After Effects, or DaVinci Resolve.
            Plus full 2026 Social Media Video Spec Guide.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <VideoBitrateCalcTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Hit Exact File Limits</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              No more guessing export settings and re-rendering 5 times. Get the exact video bitrate needed to fit your video under file size ceilings.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Two-Way Calculation</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Calculate the required bitrate from a target file size, or input your duration and bitrate to forecast your final rendered output size.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Audio Multiplex Included</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike simplistic calculators that forget audio, our tool deducts your AAC/MP3 audio bandwidth (128kbps-320kbps) so your file never overshoots.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 rounded-3xl border border-[#213026] bg-[#0c1510] p-8">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-[#9baaa1]">
            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                How is video file size calculated?
              </h3>
              <p className="leading-relaxed">
                Total File Size = (Video Bitrate + Audio Bitrate) × Duration in seconds ÷ 8. Our calculator uses a 2% safety container overhead buffer so your export never exceeds platform limits.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                What bitrate should I use for 1080p YouTube videos?
              </h3>
              <p className="leading-relaxed">
                For standard 1080p at 30 fps, YouTube recommends 8 Mbps (VBR 2-pass). For high framerate 1080p 60 fps, use 12 Mbps. For 4K at 60 fps, use 45-53 Mbps.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Is H.265 (HEVC) smaller than H.264?
              </h3>
              <p className="leading-relaxed">
                Yes! H.265 (HEVC) is approximately 30% to 50% more efficient than H.264, meaning you can achieve the same visual clarity at half the bitrate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

