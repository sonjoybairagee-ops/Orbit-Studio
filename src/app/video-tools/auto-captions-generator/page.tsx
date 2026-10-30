import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Film,
  Type,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import AutoCaptionsTool from "@/components/tools/AutoCaptionsTool";

export const metadata: Metadata = {
  title: "Free AI Auto-Captions & Subtitle Generator for Reels & Shorts — CompX Orbit",
  description:
    "Generate viral word-by-word animated subtitles for TikTok, Instagram Reels, and YouTube Shorts. 100% free Submagic & Captions app alternative with Hormozi styles, SRT, VTT, and ASS export.",
  keywords: [
    "auto caption generator",
    "animated subtitles for reels",
    "submagic alternative free",
    "alex hormozi caption generator",
    "tiktok auto subtitles",
    "word by word captions",
    "shorts subtitle generator",
    "download ass subtitle file",
    "free captions app alternative",
    "instagram reels captions generator",
  ],
  openGraph: {
    title: "Free AI Auto-Captions & Subtitle Generator for Reels & Shorts",
    description:
      "Create viral animated word-by-word subtitles for TikTok, Reels, and Shorts. 100% free with zero watermarks.",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "Viral Caption Presets",
    desc: "Instant Hormozi, Beast, Cyber Emerald, and TikTok bold font styles with active-word illumination.",
  },
  {
    icon: Zap,
    title: "Word-by-Word Sync",
    desc: "Precision timing synchronization with live 9:16 vertical phone preview player.",
  },
  {
    icon: Film,
    title: "Pro ASS & SRT Export",
    desc: "Download .ASS files that import directly into CapCut, Premiere Pro, and After Effects with exact styling intact.",
  },
  {
    icon: ShieldCheck,
    title: "100% Free & No Watermarks",
    desc: "Zero subscriptions, no credit cards, and no annoying watermark overlays on your export.",
  },
];

const FAQS = [
  {
    q: "How does the animated subtitle styler work?",
    a: "Upload your video or audio clip. The tool automatically syncs the dialogue with timestamps. Pick your favorite viral preset (Hormozi, Beast, Minimal), customize font sizes, and download the styled .ASS or .SRT file for your video editor.",
  },
  {
    q: "How do I import .ASS files into CapCut, Premiere Pro, or After Effects?",
    a: "The exported .ASS file contains complete font, color, border, and position code. In CapCut, import under Text > Subtitles. In Premiere Pro or After Effects, drag the file directly into your timeline to render exact animated captions.",
  },
  {
    q: "Is there a video length limit or watermark?",
    a: "No! Unlike Submagic or Captions App that charge $20-$50/month, CompX Orbit Auto Captions is 100% free with zero watermarks.",
  },
  {
    q: "Can I use custom fonts and highlight colors?",
    a: "Yes, you can tweak font sizes, words-per-screen, highlight colors, and text casing directly in the customizer.",
  },
];

export default function AutoCaptionsPage() {
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
          <Link href="/video-tools" className="hover:text-[#3cff5f] transition-colors">
            Video Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <span className="text-[#3cff5f] font-semibold">Auto-Animated Captions</span>
        </nav>

        {/* Interactive Tool Component */}
        <AutoCaptionsTool />

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
              How to Create Viral Captions in 3 Simple Steps
            </h2>
            <p className="text-sm text-[#9baaa1]">
              Fast workflow tailored for YouTube Shorts creators, TikTokers, and Instagram Reels editors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                01
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Upload Video or Audio</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Upload your MP4, WebM, or audio clip. Speech is automatically synced into word-level timestamps.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                02
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Choose Style &amp; Colors</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Select from Hormozi Bold, Beast Pop, or Minimal, adjust font size, and preview live on the phone screen.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                03
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Download .ASS or .SRT</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Download your styled subtitle file to drop directly into CapCut, Premiere Pro, or After Effects.
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
              <p className="text-xs text-[#9baaa1]">
                Everything you need to know about animated captions and subtitle formats.
              </p>
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

