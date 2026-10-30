import { Metadata } from "next";
import VoiceEnhancerTool from "@/components/tools/VoiceEnhancerTool";
import { Mic, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Voice Enhancer & Audio Noise Reducer — Clean Speech & Remove Noise Online",
  description:
    "Free online Voice Enhancer and Noise Reducer. Clean up voice recordings, remove background AC/fan hum and mic hiss, and boost vocal clarity for podcasts, YouTube videos, and voiceovers. 100% Client-side & private.",
  keywords: [
    "voice enhancer",
    "audio noise reducer",
    "remove background noise from audio",
    "clean voice recording online",
    "podcast audio enhancer",
    "voice clarity enhancer",
    "free audio de-noise",
    "microphone noise removal",
  ],
  openGraph: {
    title: "Free Voice Enhancer & Audio Noise Reducer — 100% Private",
    description:
      "Clean background noise, cut room hum, and enhance vocal clarity in your audio files with real-time A/B preview.",
  },
};

export default function VoiceEnhancerNoiseReducerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Voice Enhancer & Noise Reducer",
    url: "https://compxorbit.com/audio-tools/voice-enhancer-noise-reducer",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Browser-based vocal enhancement and background noise removal utility for podcast hosts, video creators, and sound editors.",
    featureList: [
      "Background hum and fan noise reduction",
      "Vocal clarity and speech presence boost",
      "Studio voice leveling dynamics",
      "Real-time A/B before/after comparison playback",
      "100% Client-side privacy - audio is never uploaded to external servers",
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
            <Mic className="h-3.5 w-3.5" />
            <span>Audio & Speech Production</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Voice Enhancer &amp; Noise Reducer
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Clean up noisy voice recordings, eliminate background AC or fan hum,
            and give your voice a crisp, punchy broadcast sound for podcasts,
            YouTube videos, and voiceovers.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <VoiceEnhancerTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Enhance Voice and Remove Background Noise</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Upload Voice Audio</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Drop your MP3, WAV, M4A, or AAC voice recording into the tool.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Choose Preset &amp; Compare</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Select &quot;Studio Podcast Voice&quot; or &quot;Aggressive Noise Removal&quot;. Click between Original and Enhanced to hear the difference live.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Download Clean Audio</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Click &quot;Download Enhanced Audio (WAV)&quot; to get uncompressed studio-quality audio ready for your video editor.
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
                What kinds of noises does this tool remove?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                It specifically targets low-frequency mechanical rumble (air conditioning, computer fans, distant traffic), 50Hz/60Hz electrical mains hum, microphone hiss, and room echo reverberation.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Are my voice recordings uploaded to any cloud server?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                <strong>No!</strong> All audio filtering, gating, and rendering happen 100% locally inside your web browser. Your sensitive recordings and interviews never leave your computer.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                What audio formats are supported?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                You can upload MP3, WAV, M4A, AAC, OGG, and WebM files. The output is exported as an uncompressed, broadcast-ready 16-bit WAV file compatible with Adobe Premiere Pro, After Effects, DaVinci Resolve, and Audacity.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Audio & Video Post-Production</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Sync Crisp Audio to Motion Graphics in After Effects
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            Use CompX Orbit inside Adobe After Effects to automatically animate audio waveforms, captions, and kinetic typography.
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

