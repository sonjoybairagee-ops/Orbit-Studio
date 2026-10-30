import type { Metadata } from "next";
import Link from "next/link";
import { FastForward, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VideoSpeedTool from "@/components/tools/VideoSpeedTool";

export const metadata: Metadata = {
  title: "Free Video Speed Changer — Slow Motion & Fast Forward Video Online (100% Free)",
  description:
    "Speed up or slow down videos online with zero watermark. Change MP4, MOV, and WebM playback speed from 0.25x to 4x, create cinematic slow-mo or time-lapses, and download with 100% privacy.",
  keywords: [
    "video speed changer",
    "change video speed online",
    "slow motion video maker",
    "fast forward video free",
    "speed up video online",
    "video speed controller",
    "make video 2x online",
    "slow down video free",
  ],
  alternates: {
    canonical: "/video-tools/video-speed-changer",
  },
  openGraph: {
    title: "Free Video Speed Changer — Slow Motion & Fast Forward Online",
    description:
      "Adjust video playback speed from 0.2x to 5.0x. Fast forward time-lapses or create smooth slow motion with zero watermarks. 100% Free.",
    url: "/video-tools/video-speed-changer",
    type: "website",
  },
};

export default function VideoSpeedChangerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Video Speed Changer",
    url: "https://compxorbit.com/video-tools/video-speed-changer",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free browser-based video speed changer to speed up or slow down MP4 and WebM videos with pitch correction and zero watermarks.",
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
          <Link href="/tools?category=video" className="hover:text-[#3cff5f] transition-colors">
            Video Tools
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">Video Speed Changer</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#213026] bg-[#0c1510] px-4 py-1.5 text-xs font-medium text-[#3cff5f] mb-4">
            <FastForward className="h-3.5 w-3.5" />
            <span>Video Speed Engine · 100% Free & No Watermark</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9] max-w-3xl mx-auto">
            Free Online Video Speed Changer
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Speed up or slow down any video with precision controls. Make fast-forward time-lapses, smooth slow-motion clips, and export high-definition video directly in your browser.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <div className="mb-14">
          <VideoSpeedTool />
        </div>

        {/* Educational Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 mb-10 shadow-xl space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-[#3cff5f]" />
              How to Change Video Speed Online in 3 Steps
            </h2>
            <p className="mt-3 text-sm text-[#9baaa1] leading-relaxed">
              Whether you need to speed up a long screen tutorial into a fast 2-minute recap or create an epic slow-motion action highlight, our video speed tool handles it instantly:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3cff5f] mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>1. Upload Your Video</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Upload any MP4, MOV, or WebM video file. Files are processed directly in your browser with complete privacy.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#60a5fa] mb-2">
                <FastForward className="h-4 w-4" />
                <span>2. Pick Speed & Audio Settings</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Choose presets (0.5x, 1.5x, 2.0x, 3.0x) or use the custom slider. Toggle pitch preservation to avoid squeaky voices or mute audio completely.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f59e0b] mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>3. Export with Zero Watermarks</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Download your sped up or slow-mo video with zero branding, watermarks, or quality restrictions.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2.5 mb-6">
            <HelpCircle className="h-6 w-6 text-[#3cff5f]" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">Does changing video speed reduce video quality?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                No! The video retains its original canvas resolution and renders at a high bitrate (6 Mbps) so your final video remains crisp and clear.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">What happens to the video audio when sped up?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                By default, our pitch preservation engine keeps voices sounding natural without the high-pitched &quot;chipmunk&quot; distortion. You can also uncheck pitch preservation or mute the audio track.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">Are there file size limits or watermarks?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                None! The tool is completely free, does not add any watermarks to your exported videos, and runs entirely on your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

