import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import LandscapeToPortraitTool from "@/components/tools/LandscapeToPortraitTool";

export const metadata: Metadata = {
  title: "16:9 to 9:16 Video Blur Background Converter for Shorts & Reels | Compx Orbit",
  description:
    "Convert 16:9 landscape video to 9:16 portrait for TikTok, YouTube Shorts, and Instagram Reels with aesthetic blurred background padding. No watermarks, 100% free.",
  keywords: [
    "convert 16:9 to 9:16 online",
    "landscape to portrait video converter",
    "video blur background for shorts",
    "make horizontal video vertical for tiktok",
    "reels blur padding generator",
    "convert youtube video to shorts free no watermark",
  ],
  alternates: {
    canonical: "/video-tools/landscape-to-portrait-converter",
  },
  openGraph: {
    title: "16:9 to 9:16 Video Blur Background Converter for Shorts & Reels | Compx Orbit",
    description:
      "Transform horizontal videos into 9:16 vertical shorts with customizable blur background padding. 100% client-side and free.",
    url: "/video-tools/landscape-to-portrait-converter",
    type: "website",
  },
};

export default function LandscapeToPortraitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "16:9 to 9:16 Video Blur Background Converter",
    url: "https://compxorbit.com/video-tools/landscape-to-portrait-converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Convert horizontal landscape videos to 9:16 vertical format with blurred duplicate background padding.",
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
          <span className="text-[#e7eee9]">16:9 to 9:16 Video Converter</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Short-Form Video Repurposing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            16:9 to 9:16 Shorts &amp; Reels Converter
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Convert landscape YouTube videos into vertical 9:16 clips for TikTok, Instagram Reels, and YouTube Shorts.
            Automatic blurred background padding with zero watermarks.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <LandscapeToPortraitTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">No Watermarks Ever</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike online editors that slap large intrusive watermarks on free exports, our tool produces clean, professional 1080×1920 video ready for instant publishing.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Aesthetic Blurred Padding</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Fills the empty top and bottom areas with a dynamically blurred duplicate of your video, creating the modern podcast and viral interview look.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Private In-Browser Rendering</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Your video is processed and composited locally on your device hardware using HTML5 Canvas &amp; MediaRecorder APIs with no cloud uploading.
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
                Will the video have sound after rendering?
              </h3>
              <p className="leading-relaxed">
                Yes! The original audio track is captured directly through Web Audio routing into the 9:16 export stream.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Can I adjust the blur intensity and background darkening?
              </h3>
              <p className="leading-relaxed">
                Yes! You can customize the blur radius from 5px to 50px, add a dark vignette overlay up to 75% for high contrast, and adjust foreground corner rounding.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                What aspect ratio is used for the export?
              </h3>
              <p className="leading-relaxed">
                The canvas renders at standard 9:16 (1080×1920 pixels), which is the native full-screen aspect ratio for TikTok, YouTube Shorts, and Instagram Reels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

