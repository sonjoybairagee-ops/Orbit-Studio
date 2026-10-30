import type { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle, FileText, Download, Clock } from "lucide-react";
import YoutubeTranscriptTool from "@/components/tools/YoutubeTranscriptTool";

export const metadata: Metadata = {
  title: "Free YouTube Transcript Generator — Video to Text & SRT Export (100% Free)",
  description:
    "Extract transcripts and captions from any YouTube video or Shorts with timestamps. Download .SRT and .VTT subtitle files for Premiere Pro, DaVinci Resolve, CapCut, or ChatGPT. 100% free with unlimited videos.",
  keywords: [
    "youtube transcript generator",
    "youtube video to text",
    "youtube transcript to srt",
    "extract subtitles from youtube",
    "download srt from youtube free",
    "youtube captions to text",
    "vtt from youtube video",
    "transcribe youtube video online",
  ],
  alternates: {
    canonical: "/video-tools/youtube-transcript-generator",
  },
  openGraph: {
    title: "Free YouTube Transcript Generator — Video to Text & SRT Subtitle Exporter",
    description:
      "Instant timestamped transcripts from any YouTube video. 1-click download .SRT and .VTT subtitles with zero registration. 100% Free.",
    url: "/video-tools/youtube-transcript-generator",
    type: "website",
  },
};

export default function YoutubeTranscriptPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit YouTube Transcript & Subtitle Generator",
    url: "https://compxorbit.com/video-tools/youtube-transcript-generator",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free YouTube transcript generator and caption extractor with timestamped SRT, VTT, and TXT subtitle downloads.",
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
          <span className="text-[#3cff5f]">YouTube Transcript Generator</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#213026] bg-[#0c1510] px-4 py-1.5 text-xs font-medium text-[#3cff5f] mb-4">
            <Film className="h-3.5 w-3.5 text-red-500" />
            <span>YouTube to Text & Subtitle Engine · 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9] max-w-3xl mx-auto">
            Free YouTube Transcript Generator & SRT Downloader
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Extract complete timestamped transcripts from any YouTube video or Shorts link in seconds. Export to .SRT, .VTT, or clean text for video editing and AI summaries.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <div className="mb-14">
          <YoutubeTranscriptTool />
        </div>

        {/* Educational Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 mb-10 shadow-xl space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-[#3cff5f]" />
              Why Creators and Editors Need YouTube Transcripts
            </h2>
            <p className="mt-3 text-sm text-[#9baaa1] leading-relaxed">
              Video creators, researchers, and professional editors use video transcripts to save hours of manual transcription work:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3cff5f] mb-2">
                <Download className="h-4 w-4" />
                <span>1-Click SRT for Premiere & DaVinci</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Download timestamp-perfect .SRT files and drag them directly into Adobe Premiere Pro, After Effects, DaVinci Resolve, or CapCut for instant auto-captions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#60a5fa] mb-2">
                <Sparkles className="h-4 w-4" />
                <span>ChatGPT & AI Summarization</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Copy hours of podcast or lecture transcripts with 1 click to generate instant summaries, blog posts, Twitter threads, or study notes using AI.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f59e0b] mb-2">
                <Clock className="h-4 w-4" />
                <span>Click-to-Seek Navigation</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Search any word or phrase in the video transcript and click the timestamp to jump the video directly to that exact second.
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
              <h3 className="text-sm font-bold text-[#e7eee9]">Does this tool work with YouTube Shorts?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! Simply paste any YouTube Shorts URL (e.g. `https://www.youtube.com/shorts/...`), and the tool will automatically extract the captions with millisecond precision.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">What subtitle formats can I export?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                You can download .SRT (SubRip Subtitle format), .VTT (WebVTT format for web players), or plain .TXT text format, or copy the entire text to your clipboard.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">Can I transcribe my own video files (MP4, WebM)?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! Switch to the &quot;Upload Video / Audio&quot; tab to transcribe your local MP4, MOV, WAV, or MP3 files with live in-browser speech recognition with 100% privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
