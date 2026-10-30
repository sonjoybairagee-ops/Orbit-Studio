import { Metadata } from "next";
import BpmTapTempoTool from "@/components/tools/BpmTapTempoTool";
import { Music, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "BPM Tap Tempo & Video Frame Sync Calculator — Tap to Find Beats Per Minute",
  description:
    "Free online Tap Tempo and BPM Calculator with Video Frame Sync for video editors, music producers, and sound designers. Tap with mouse or spacebar to measure BPM and calculate 24/25/30/60 FPS beat intervals.",
  keywords: [
    "tap tempo",
    "bpm calculator",
    "tap bpm",
    "bpm to frames calculator",
    "video editor beat sync",
    "after effects bpm to frames",
    "music tempo finder",
    "tap tempo online",
  ],
  openGraph: {
    title: "BPM Tap Tempo & Video Frame Sync Calculator",
    description:
      "Tap to measure BPM and instantly calculate exact video timeline frame intervals for 24fps, 25fps, 30fps, and 60fps cuts.",
  },
};

export default function BpmTapTempoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit BPM Tap Tempo & Video Frame Calculator",
    url: "https://compxorbit.com/audio-tools/bpm-tap-tempo",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Tap Tempo BPM counter with audio click feedback and video editing frame-rate synchronization tables.",
    featureList: [
      "Keyboard Spacebar & Click Tap Tempo detection",
      "Web Audio synthesized metronome click",
      "Frame-rate calculations for 24fps, 25fps, 30fps, and 60fps timelines",
      "Tempo marking classification (Largo, Andante, Allegro, Presto)",
      "100% Free and client-side",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <Music className="h-3.5 w-3.5" />
            <span>Audio & Rhythm Production</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            BPM Tap Tempo & Frame Sync
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Tap with your mouse or hit the Spacebar to calculate music BPM in
            real time. Automatically converts beats into exact frame counts for
            After Effects, Premiere Pro, and DaVinci Resolve.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <BpmTapTempoTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Sync Video Cuts to Music Beats</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Tap to the Beat</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Play your background music and tap the big button (or tap Spacebar) 4 to 8 times in rhythm to detect the song tempo.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Read Frame Counts</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Check the table below for your project frame rate (24fps cinema, 25fps PAL, or 30/60fps web) to see the exact number of frames per beat.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Set Timeline Markers</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Copy the frame intervals and use them to place cuts, zoom hits, and motion graphics transitions directly on the beat.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                How many taps are needed for an accurate BPM measurement?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Generally, tapping <strong>4 to 8 consecutive beats</strong> gives an accuracy within ±1 BPM. Our algorithm calculates a rolling weighted average across your last 16 taps to eliminate human timing jitter.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                How is BPM converted to video frames?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                The formula is: <code className="text-[#3cff5f]">Frames = (60 / BPM) × FPS</code>. For example, at 120 BPM in a 24 FPS sequence: each beat is 0.5 seconds, which equals exactly <strong>12 frames</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Can I use this on mobile devices?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! The giant tap pad is fully touch-optimized with high-precision timestamp handling on iOS and Android devices.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Music-Synced Motion Design</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Tired of Setting After Effects Markers Manually?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            CompX Orbit helps video editors automate rhythm-synced typography, transitions, and kinetic animations in Adobe After Effects.
          </p>
          <div className="mt-5">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20"
            >
              <span>Explore CompX Orbit Features</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

