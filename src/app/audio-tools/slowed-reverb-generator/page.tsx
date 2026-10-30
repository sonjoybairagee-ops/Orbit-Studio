import type { Metadata } from "next";
import Link from "next/link";
import { Disc, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import SlowedReverbTool from "@/components/tools/SlowedReverbTool";

export const metadata: Metadata = {
  title: "Free Slowed + Reverb Audio Generator (Aesthetic Music) | Compx Orbit",
  description:
    "Turn any song into a dreamy Slowed & Reverb aesthetic track online. Real-time pitch, room reverb, and vintage tape warmth. Export lossless WAV for TikTok and YouTube.",
  keywords: [
    "slowed and reverb generator",
    "slowed reverb maker online free",
    "make song slowed and reverb",
    "aesthetic audio slowed reverb converter",
    "nightcore generator online",
    "audio speed and pitch changer free",
  ],
  alternates: {
    canonical: "/audio-tools/slowed-reverb-generator",
  },
  openGraph: {
    title: "Free Slowed + Reverb Audio Generator (Aesthetic Music) | Compx Orbit",
    description:
      "Transform any song into a slowed + reverb aesthetic masterpiece directly in your browser. 100% free with real-time controls.",
    url: "/audio-tools/slowed-reverb-generator",
    type: "website",
  },
};

export default function SlowedReverbPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Slowed + Reverb Audio Generator",
    url: "https://compxorbit.com/audio-tools/slowed-reverb-generator",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Generate slowed and reverb aesthetic music tracks directly in your browser with real-time audio controls.",
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
          <span className="text-[#e7eee9]">Slowed + Reverb Generator</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Aesthetic Audio Production</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Slowed + Reverb Audio Generator
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Turn any song or beat into a dreamy, nostalgic Slowed &amp; Reverb aesthetic track for TikTok, YouTube, and Instagram.
            Live real-time DSP preview with instant lossless WAV download.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <SlowedReverbTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Live Real-Time Tuning</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Adjust tempo, reverb hall decay, and tape warmth while the track plays to hear your changes instantaneously without having to wait for re-renders.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Disc className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Atmospheric Reverb Engine</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Powered by stereo convolution reverb that emulates lush cathedral and concert hall reflections for the iconic deep aesthetic spatial vibe.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% Free Privacy</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Your audio files are processed entirely in browser memory using Web Audio API. Zero music files are uploaded or stored on servers.
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
                What does Slowed + Reverb do to a song?
              </h3>
              <p className="leading-relaxed">
                Slowed + Reverb lowers the playback speed and pitch (typically to around 80%-85%) while applying a warm, spacious reverb tail and gentle lowpass filter. This creates an immersive, melancholic, and nostalgic listening atmosphere.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Can I make Nightcore or Sped-Up songs with this tool?
              </h3>
              <p className="leading-relaxed">
                Yes! Simply select the &quot;Nightcore / Sped Up&quot; preset or push the Speed slider above 115% to create high-energy, upbeat remixes.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Is the downloaded WAV audio file high quality?
              </h3>
              <p className="leading-relaxed">
                Yes! The export is rendered at 44,100 Hz stereo 16-bit uncompressed WAV, ensuring professional studio clarity for publishing to TikTok, YouTube, or SoundCloud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

