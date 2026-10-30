import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import TextToSpeechTool from "@/components/tools/TextToSpeechTool";

export const metadata: Metadata = {
  title: "Free Text to Speech (TTS) Online — AI Voiceover Generator (100% Free)",
  description:
    "Convert text into natural sounding speech and AI voiceovers online. Choose from multiple natural voices, adjust speed & pitch, teleprompter display, and record audio. 100% free with unlimited characters.",
  keywords: [
    "text to speech free",
    "tts online",
    "free ai voice generator",
    "text to voice mp3",
    "natural reader online",
    "speech synthesis free",
    "youtube voiceover generator",
    "text to speech unlimited",
  ],
  alternates: {
    canonical: "/audio-tools/text-to-speech",
  },
  openGraph: {
    title: "Free Text to Speech (TTS) Online — Natural AI Voiceovers",
    description:
      "Instantly convert any text, script, or article into lifelike speech with natural voices, custom tempo, and direct audio export. 100% Free.",
    url: "/audio-tools/text-to-speech",
    type: "website",
  },
};

export default function TextToSpeechPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Text to Speech (TTS) Generator",
    url: "https://compxorbit.com/audio-tools/text-to-speech",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Browser-based Text to Speech tool with realistic voice synthesis, pitch & speed controls, and exportable voiceovers.",
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
          <Link href="/tools?category=audio" className="hover:text-[#3cff5f] transition-colors">
            Audio Tools
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">Text to Speech</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#213026] bg-[#0c1510] px-4 py-1.5 text-xs font-medium text-[#3cff5f] mb-4">
            <Mic className="h-3.5 w-3.5" />
            <span>Natural AI Voiceover Engine · 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9] max-w-3xl mx-auto">
            Free Online Text to Speech & AI Voice Generator
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Convert any script, story, or article into lifelike spoken audio with natural voices. Fine-tune speech tempo, pitch, and export narration for YouTube, TikTok, and podcasts.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <div className="mb-14">
          <TextToSpeechTool />
        </div>

        {/* Educational Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 mb-10 shadow-xl space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-[#3cff5f]" />
              Why Creators Use Free In-Browser Text to Speech
            </h2>
            <p className="mt-3 text-sm text-[#9baaa1] leading-relaxed">
              Traditional cloud TTS services impose strict monthly character quotas, expensive subscription fees, and long server queue times. CompX Orbit TTS provides unlimited voice narration instantly:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3cff5f] mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Character Limits</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Paste long-form video scripts, entire chapters, or quick short-form video hooks without ever running into a paywall or credit limit.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#60a5fa] mb-2">
                <Zap className="h-4 w-4" />
                <span>Zero Lag Playback</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Speech starts playing in milliseconds without uploading your script to third-party servers or waiting for cloud generation queues.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f59e0b] mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Private & Secure</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Your scripts and unpublished content remain completely private on your device. Nothing is saved or shared.
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
              <h3 className="text-sm font-bold text-[#e7eee9]">Can I use these voiceovers on YouTube and commercial videos?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! The generated voices are royalty-free and can be used in your YouTube videos, TikToks, Instagram Reels, podcasts, and video presentations.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">How do I get the most natural sounding voices?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Modern browsers like Google Chrome and Microsoft Edge include high-quality neural voices labeled &quot;Natural&quot; or &quot;Google&quot;. Select these from the voice dropdown for the most human-sounding narration.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">What is the ideal speaking speed for video voiceovers?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                For standard YouTube tutorials and documentaries, 1.0x to 1.1x speed is optimal. For fast-paced TikTok and YouTube Shorts hooks, setting the speed to 1.15x - 1.25x helps maximize viewer retention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

