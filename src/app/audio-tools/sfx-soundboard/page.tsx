import { Metadata } from "next";
import SfxSoundboardTool from "@/components/tools/SfxSoundboardTool";
import { Music, CheckCircle2, HelpCircle, Sparkles, Volume2, Download, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Creator SFX Soundboard & Sound Downloader — Video Editing Sound Effects",
  description:
    "Free online creator soundboard and SFX generator for video editors. 1-click preview and download of 48kHz uncompressed WAV whooshes, cinematic braams, glitch effects, risers, and UI pops for Premiere Pro & After Effects.",
  keywords: [
    "sfx soundboard online",
    "free sound effects for video editing",
    "whoosh sound effect free",
    "cinematic boom sfx",
    "riser sound effect download",
    "glitch sound effect free",
    "royalty free sfx for premiere pro",
    "creator soundboard youtube",
    "after effects sound effects",
    "compx orbit sfx soundboard",
  ],
  openGraph: {
    title: "Free Creator SFX Soundboard & Sound Downloader — CompX Orbit",
    description:
      "Instant playback, pitch modulation, and 1-click uncompressed 48kHz WAV downloads for video editors, motion designers, and content creators.",
    url: "https://compxorbit.com/audio-tools/sfx-soundboard",
    type: "website",
  },
};

export default function SfxSoundboardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Creator SFX Soundboard & Synthesizer",
    url: "https://compxorbit.com/audio-tools/sfx-soundboard",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Interactive studio SFX soundboard for video editors. Includes cinematic impacts, whip whooshes, risers, digital glitch bursts, and tactile UI clicks with pitch shifting and 48kHz WAV downloads.",
    featureList: [
      "20+ Essential video editing sound effects synthesized in pure Web Audio",
      "Live pitch shifting (0.5x deep trailer to 2.0x high snap)",
      "Reverse sound mode for transition sweeps",
      "1-Click 48,000 Hz 16-bit uncompressed Broadcast WAV export",
      "Keyboard shortcut pad triggering (1-9, Q-T, A-F, Z-C)",
      "100% Royalty-Free for YouTube, TikTok, and Commercial Ads",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
            <Volume2 className="h-3.5 w-3.5" />
            <span>Audio Post-Production</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Creator SFX Soundboard &amp; Synthesizer
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Essential transition sound effects for video editors and motion designers. 
            Instant latency-free playback, live pitch modulation, and 1-click{" "}
            <span className="text-[#3cff5f] font-mono">48kHz WAV</span> downloads for Premiere Pro, After Effects, and DaVinci.
          </p>
        </div>

        {/* Main Tool Component */}
        <SfxSoundboardTool />

        {/* Informational & SEO Section */}
        <div className="mt-16 space-y-12">
          {/* Why Creators Love This Tool */}
          <div className="rounded-2xl border border-[#26332d] bg-[#0c1410] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3cff5f]" />
              <span>Built Specifically for Motion Designers &amp; Video Creators</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <Zap className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">Zero Latency Playback</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  Generated in real-time via client-side Web Audio DSP. No buffering, no cloud downloading waits, and no ads interrupting your creative workflow.
                </p>
              </div>

              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <Volume2 className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">Broadcast Studio 48kHz WAV</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  Every downloaded file is rendered at true 48,000 Hz, 16-bit PCM uncompressed WAV—the golden standard for video timelines, eliminating resampling artifacts.
                </p>
              </div>

              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">100% CC0 Royalty-Free</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  Use these sound effects in any monetized YouTube video, TikTok, client commercial, or indie game without copyright claims or licensing fees.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ */}
          <div className="rounded-2xl border border-[#26332d] bg-[#0c1410] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">How do I import these sounds into Premiere Pro or After Effects?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  Simply click the download icon on any sound card. A 48kHz WAV file will download to your computer. Drag and drop the WAV directly onto an audio track in your Premiere Pro timeline or After Effects composition.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">What does the Pitch Shift slider do?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  Pitch shifting changes the playback speed and acoustic frequency of the sound. Lowering to 0.6x produces massive, heavyweight cinematic bass impacts, while raising to 1.5x creates snappy, punchy cartoon or tech effects.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">Can I use keyboard shortcuts while editing?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  Yes! Keep this tab open on a secondary monitor and press keys 1–9, Q, W, E, R, A, S, D, F, Z, X, C on your physical keyboard to audition sounds in real time while watching your video.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">Will YouTube Content ID flag these sounds?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  Never. All sounds are mathematically synthesized from scratch inside your browser. There is no copyrighted sample or fingerprint, so your videos are 100% safe from Content ID claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
