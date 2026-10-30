import type { Metadata } from "next";
import Link from "next/link";
import { Music, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VideoToMp3Tool from "@/components/tools/VideoToMp3Tool";

export const metadata: Metadata = {
  title: "Free Video to MP3 & Audio Extractor (Unlimited Size) | Compx Orbit",
  description:
    "Extract audio from MP4, WebM, MOV, and MKV videos into lossless WAV or MP3 files directly in your browser. No 50MB file size limits, 100% private and free.",
  keywords: [
    "video to mp3",
    "extract audio from video",
    "mp4 to mp3 converter free",
    "video to audio converter online",
    "extract sound from video without upload",
    "large video to mp3 converter no limit",
  ],
  alternates: {
    canonical: "/video-tools/video-to-mp3",
  },
  openGraph: {
    title: "Free Video to MP3 & Audio Extractor (Unlimited Size) | Compx Orbit",
    description:
      "Convert video to MP3 or lossless WAV audio directly on your device. No file size limits and zero cloud uploads.",
    url: "/video-tools/video-to-mp3",
    type: "website",
  },
};

export default function VideoToMp3Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video to MP3 & Audio Extractor",
    url: "https://compxorbit.com/video-tools/video-to-mp3",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Extract pristine audio tracks from any video file without size limits directly in your browser.",
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
          <span className="text-[#e7eee9]">Video to MP3 Extractor</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fast In-Browser Extraction</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Video to MP3 &amp; Audio Extractor
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Extract pristine audio tracks from MP4, WebM, MOV, and MKV videos into lossless WAV or MP3 format.
            No upload queues, no 50MB file size caps, and 100% data privacy.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <VideoToMp3Tool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">No File Size Limits</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike cloud converters that restrict free users to 50MB or 100MB, our Web Audio decoder runs on your local machine and can process multi-gigabyte video files with ease.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Music className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Lossless WAV &amp; MP3</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Preserves the original 44.1kHz or 48kHz audio fidelity without lossy re-encoding artifacts, making it perfect for video editors and podcasters.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Instant &amp; Zero Waiting</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              No server queue and no waiting for uploads. Decoding happens directly in browser RAM for lightning fast audio extraction.
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
                Is my video uploaded to any server?
              </h3>
              <p className="leading-relaxed">
                No! The audio extraction runs 100% locally on your computer inside your web browser. Your video files never touch an external server.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Can I extract only a specific section of the audio?
              </h3>
              <p className="leading-relaxed">
                Yes! The tool includes an interactive start time and end time trimmer so you can cut out intro/outro sections before downloading.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Which video formats are supported?
              </h3>
              <p className="leading-relaxed">
                All common video formats supported by your browser, including MP4, WebM, MOV, and MKV files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

