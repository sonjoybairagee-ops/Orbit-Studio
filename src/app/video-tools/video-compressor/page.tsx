import type { Metadata } from "next";
import Link from "next/link";
import { HardDrive, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VideoCompressorTool from "@/components/tools/VideoCompressorTool";

export const metadata: Metadata = {
  title: "Free Video Compressor Online (Discord 25MB, WhatsApp) | Compx Orbit",
  description:
    "Compress MP4, WebM, and MOV video files without losing visual clarity. Hit exact Discord 25MB, WhatsApp 16MB, or Email attachment limits with zero watermarks. 100% free and in-browser.",
  keywords: [
    "video compressor",
    "compress mp4 online free",
    "reduce video file size without losing quality",
    "compress video for discord 25mb",
    "whatsapp video compressor online",
    "compress mp4 no watermark free",
    "freeconvert alternative no limit",
  ],
  alternates: {
    canonical: "/video-tools/video-compressor",
  },
  openGraph: {
    title: "Free Video Compressor Online (Discord 25MB, WhatsApp) | Compx Orbit",
    description:
      "Compress your videos to fit Discord, WhatsApp, and email size limits without uploading to cloud servers.",
    url: "/video-tools/video-compressor",
    type: "website",
  },
};

export default function VideoCompressorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Online Video Compressor",
    url: "https://compxorbit.com/video-tools/video-compressor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Reduce MP4 and WebM video file size directly in your browser with Discord and WhatsApp presets.",
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
          <span className="text-[#e7eee9]">Online Video Compressor</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fast In-Browser Video Compression</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Online Video Compressor
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Compress large MP4, WebM, and MOV videos to fit Discord 25MB, WhatsApp, or Email limits.
            Zero watermarks, no file upload queues, and 100% data privacy.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <VideoCompressorTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Hit Exact Platform Caps</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Target exact limits like Discord&apos;s 25MB free attachment cap, WhatsApp 16MB file limit, or email ceilings with automatic bitrate calculation.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <HardDrive className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Zero Watermarks</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike online competitors that stamp large watermarks on your video, our free tool outputs clean, professional video files.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% Private In-Browser</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Your video is re-encoded completely inside your browser hardware. No gigabyte file uploads and no waiting in slow cloud queues.
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
                How do I compress a video to send on Discord?
              </h3>
              <p className="leading-relaxed">
                Upload your video, click the &quot;Discord &amp; Email Cap (&lt; 25 MB)&quot; preset, and click &quot;Start Video Compression&quot;. The tool will downscale and compress the bitrate so the final file size is under 25 megabytes.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Will compressing my video reduce visual quality?
              </h3>
              <p className="leading-relaxed">
                Our smart compression engine maintains the optimal balance between bitrate and resolution. By selecting &quot;50% Balanced Reduction&quot;, you can retain crisp 1080p quality while cutting the file weight in half.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Is there any file size limit for the video I upload?
              </h3>
              <p className="leading-relaxed">
                No! Because compression happens on your local device hardware through modern browser APIs, you can import large 500MB+ videos with zero server limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

