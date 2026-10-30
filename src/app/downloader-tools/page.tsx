import { Metadata } from "next";
import Link from "next/link";
import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import { Download, ChevronRight, Sparkles, ShieldCheck, Zap, Video, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Media & Video Downloaders — CompX Orbit",
  description:
    "Download high quality 4K and 1080p MP4 videos, 320kbps MP3 audio, and Full HD thumbnails from YouTube, Facebook, Instagram, and Pinterest. 100% free and private.",
};

export default function DownloaderToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "downloader");

  return (
    <main className="min-h-screen bg-[#050a08] text-[#e7eee9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#26332d] bg-[#050a08] py-16 sm:py-20 text-center">
        {/* Ambient Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-[#3cff5f]/15 via-[#102a16]/20 to-teal-500/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-4 py-1.5 text-xs font-semibold text-[#3cff5f] mb-5 shadow-xs">
            <Download className="h-4 w-4" />
            <span>High Speed Downloader Suite</span>
            <span className="text-[#334538]">•</span>
            <span className="text-[#9baaa1]">True 4K &amp; 1080p Full HD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#e7eee9] leading-tight">
            Free Online Media &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#3cff5f] via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Video Downloaders
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Download high resolution 4K, 1080p, and 720p videos, 320kbps MP3 audio, and Full HD thumbnails from YouTube, Facebook, Instagram, and Pinterest with zero watermarks.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8da195] font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-[#3cff5f]" /> High-Speed Muxing
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#3cff5f]" /> True 1080p with Audio
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3cff5f]" /> 100% Free &amp; Private
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <span className="text-[#3cff5f] font-semibold">Downloader Tools</span>
        </nav>
      </div>

      {/* Downloader Tools Grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Feature Highlights Section */}
        <div className="mt-16 rounded-3xl border border-[#213026] bg-gradient-to-b from-[#0c1510] to-[#080e0b] p-8 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
              Why Creators Choose CompX Orbit Downloaders
            </h2>
            <p className="mt-2 text-sm text-[#9baaa1]">
              Engineered with advanced real-time media muxing to deliver authentic high-definition video and audio tracks.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#213026] bg-[#050a08] p-5">
              <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] mb-3">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[#e7eee9]">True 1080p &amp; 4K HD</h3>
              <p className="mt-1 text-xs text-[#9baaa1] leading-relaxed">
                Unlike ordinary tools that cap video at 360p, our FFmpeg engine muxes genuine high-definition video and pristine stereo audio.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#050a08] p-5">
              <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] mb-3">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[#e7eee9]">No Watermarks or Caps</h3>
              <p className="mt-1 text-xs text-[#9baaa1] leading-relaxed">
                Download original creator videos with zero overlays, no hidden watermarks, and zero file count restrictions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#050a08] p-5">
              <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[#e7eee9]">Direct Browser Streams</h3>
              <p className="mt-1 text-xs text-[#9baaa1] leading-relaxed">
                Fast multi-platform support across YouTube, Facebook, Instagram Reels, and Pinterest Pins.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

