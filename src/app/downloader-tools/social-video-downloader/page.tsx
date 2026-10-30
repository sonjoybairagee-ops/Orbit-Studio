import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Music,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import SocialVideoDownloaderTool from "@/components/tools/SocialVideoDownloaderTool";

export const metadata: Metadata = {
  title: "Free Social Video Downloader - YouTube, Facebook, Instagram & Pinterest MP4",
  description:
    "Download high-definition videos and MP3 audio from YouTube, Facebook Reels, Instagram, and Pinterest in seconds. 100% free, unlimited, no watermarks, up to 4K & 1080p Full HD.",
  keywords: [
    "youtube video downloader",
    "facebook video downloader",
    "instagram reels downloader",
    "pinterest video downloader",
    "download youtube shorts",
    "online video downloader",
    "free mp4 downloader",
    "youtube to mp3 downloader",
    "download facebook reels",
    "pinterest pin downloader",
  ],
  openGraph: {
    title: "Free Social Video Downloader | YouTube, Facebook, Instagram & Pinterest",
    description:
      "Save videos and audio directly to your device from YouTube, Facebook, Instagram, and Pinterest with zero watermarks.",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Zap,
    title: "Instant 1-Click Extraction",
    desc: "Paste any video or Shorts link and instantly generate direct MP4 and MP3 download streams in high resolution.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Watermarks & Ad-Free",
    desc: "Download clean, original video files with zero branding overlays, logos, or annoying redirects.",
  },
  {
    icon: Globe,
    title: "All Major Platforms",
    desc: "Unified support for YouTube (Videos & Shorts), Facebook (Reels & Videos), Instagram (Reels & Posts), and Pinterest Video Pins.",
  },
  {
    icon: Music,
    title: "MP3 Audio Extraction",
    desc: "Extract high-bitrate 320kbps MP3 audio tracks directly from videos for podcasting, background music, or voice samples.",
  },
];

const FAQS = [
  {
    q: "How do I download a video from YouTube or Shorts in 1080p / 4K?",
    a: "Copy the YouTube link, paste it into the downloader above, and click 'Download Video'. Choose 4K, 1080p Full HD, or 720p HD. Our backend automatically muxes high-definition video with crisp stereo sound.",
  },
  {
    q: "How do I download Pinterest video pins (pin.it)?",
    a: "Copy the pin link from Pinterest (both regular pinterest.com/pin/... and short pin.it/... links work). Paste the link into the box to instantly download the original 1080p or 720p MP4 video.",
  },
  {
    q: "Can I download Facebook and Instagram Reels?",
    a: "Yes! As long as the Reel or post is public, paste the share link into CompX Orbit to extract high-definition video formats without watermarks.",
  },
  {
    q: "Is this video downloader completely free?",
    a: "Yes, CompX Orbit Video Downloader is 100% free with unlimited downloads, zero subscriptions, and no software installation required.",
  },
];

export default function SocialVideoDownloaderPage() {
  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] selection:bg-[#3cff5f]/30 selection:text-[#3cff5f]">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#102a16]/30 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-[#3cff5f]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <Link href="/downloader-tools" className="hover:text-[#3cff5f] transition-colors">
            Downloader Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <span className="text-[#3cff5f] font-semibold">Social Video Downloader</span>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#213026] bg-[#0c1510] px-4 py-1.5 text-xs text-[#9baaa1]">
            <Sparkles className="h-3.5 w-3.5 text-[#3cff5f]" />
            <span className="font-semibold text-[#e7eee9]">Universal Media Downloader</span>
            <span>•</span>
            <span className="text-[#3cff5f]">True 4K &amp; 1080p Full HD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#e7eee9] leading-[1.15]">
            Social Video Downloader &amp; <br />
            <span className="bg-gradient-to-r from-[#3cff5f] via-[#52ff71] to-[#3cff5f] bg-clip-text text-transparent">
              MP4 / MP3 Extractor
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Download high-definition videos from YouTube, Facebook, Instagram, and Pinterest in seconds.
            Save 4K &amp; 1080p Full HD MP4 clips with full audio or extract high-bitrate MP3 audio with zero watermarks.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <SocialVideoDownloaderTool />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-3 transition-all hover:border-[#3cff5f]/40 hover:bg-[#101c15]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#e7eee9]">{f.title}</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Step-by-Step Guide */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#e7eee9]">
              How to Download Videos in 3 Easy Steps
            </h2>
            <p className="text-sm text-[#9baaa1]">
              Fast and simple workflow designed for creators, video editors, and mobile users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                01
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Copy Link</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Copy the URL of any YouTube video, Shorts, Facebook video, Instagram Reel, or Pinterest pin.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                02
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Paste in Downloader</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Paste the URL into the input field above and click &quot;Download Video&quot; to inspect all high-definition formats.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                03
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Save MP4 or MP3</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Pick your resolution (4K, 1080p Full HD, 720p HD, or 320k MP3) and download immediately to your local device.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e7eee9]">Frequently Asked Questions</h2>
              <p className="text-xs text-[#9baaa1]">Everything you need to know about video and audio downloads.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-2">
                <h3 className="text-sm font-semibold text-[#e7eee9] flex items-center gap-2">
                  <span className="text-[#3cff5f]">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

