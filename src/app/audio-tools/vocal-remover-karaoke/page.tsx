import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Music, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VocalRemoverTool from "@/components/tools/VocalRemoverTool";

export const metadata: Metadata = {
  title: "Free Vocal Remover & Karaoke Maker Online | Compx Orbit",
  description:
    "Separate vocals and instrumental music from any song directly in your browser. Create karaoke tracks and acapellas with live stem volume sliders. 100% free and unlimited.",
  keywords: [
    "vocal remover",
    "remove vocals from song",
    "karaoke maker online free",
    "acapella extractor",
    "isolate vocals from audio",
    "instrumental extractor online free",
    "stem separator free no limit",
  ],
  alternates: {
    canonical: "/audio-tools/vocal-remover-karaoke",
  },
  openGraph: {
    title: "Free Vocal Remover & Karaoke Maker Online | Compx Orbit",
    description:
      "Separate vocals from music in seconds. Download clean instrumental karaoke tracks and acapella vocal stems with zero server uploads.",
    url: "/audio-tools/vocal-remover-karaoke",
    type: "website",
  },
};

export default function VocalRemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Vocal Remover & Karaoke Maker",
    url: "https://compxorbit.com/audio-tools/vocal-remover-karaoke",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Separate vocals and music from any song directly in your browser with live volume faders and instant stem downloads.",
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
          <Link href="/audio-tools" className="hover:text-[#3cff5f] transition-colors">Audio Tools</Link>
          <span>/</span>
          <span className="text-[#e7eee9]">Vocal Remover &amp; Karaoke</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Stem Separation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Vocal Remover &amp; Karaoke Maker
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Separate vocals and music from any song directly in your browser.
            Adjust vocal and music volume faders in real-time and download studio-grade Karaoke or Acapella stems.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <VocalRemoverTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Music className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Punchy Karaoke Stems</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Preserves the low-end sub-bass and kick punch (30Hz - 120Hz) so your karaoke instrumental tracks sound heavy, rich, and ready for stage or cover recording.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Isolated Acapella Vocals</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Extracts centered speech and singing formants while cutting side instrumental bleed, allowing you to sample vocal hooks for EDM and hip-hop remixes.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% In-Browser &amp; Free</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              No subscription paywalls, no 30-second song duration caps, and no cloud uploads. Your music stays 100% private on your machine.
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
                How does the vocal remover work?
              </h3>
              <p className="leading-relaxed">
                Most music tracks are mixed with lead vocals panned dead-center, while instruments, reverbs, and synths are spread across the left and right stereo channels. Our DSP engine cancels the center phase in speech frequencies while preserving stereo width and bass frequencies.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Can I adjust the volume of the vocals while listening?
              </h3>
              <p className="leading-relaxed">
                Yes! You can drag the Vocal stem slider and Music stem slider independently to create the exact mix you want, from 100% silent vocals (karaoke) to subtle backing vocals.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Is there any limit on song length or file size?
              </h3>
              <p className="leading-relaxed">
                No. Because processing is executed inside your browser memory using Web Audio API, there are no artificial limits or queues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

