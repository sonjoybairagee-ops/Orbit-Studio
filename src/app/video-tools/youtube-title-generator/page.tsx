import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, CheckCircle2, TrendingUp, Zap, HelpCircle } from "lucide-react";
import YoutubeTitleGeneratorTool from "@/components/tools/YoutubeTitleGeneratorTool";

export const metadata: Metadata = {
  title: "Free YouTube Title Generator — High-CTR AI Video Titles & Hooks | Compx Orbit",
  description:
    "Generate viral, high-CTR YouTube titles, psychological hooks, and video ideas instantly. Analyze headline CTR scores, avoid clickbait penalties, and boost views. 100% free.",
  keywords: [
    "youtube title generator",
    "viral youtube titles",
    "youtube title generator free",
    "youtube headline analyzer",
    "high ctr video titles",
    "mrbeast style titles",
    "youtube hook generator",
    "video ideas generator",
  ],
  alternates: {
    canonical: "/video-tools/youtube-title-generator",
  },
  openGraph: {
    title: "Free YouTube Title Generator — High-CTR AI Video Titles & Hooks | Compx Orbit",
    description:
      "Generate viral, high-CTR YouTube video titles and analyze headline clickability with power words and psychological hooks. 100% Free.",
    url: "/video-tools/youtube-title-generator",
    type: "website",
  },
};

export default function YoutubeTitleGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YouTube Title Generator & CTR Analyzer",
    url: "https://compxorbit.com/video-tools/youtube-title-generator",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Instant high-CTR YouTube video title generator and headline score analyzer with psychological hook formulas.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Header Breadcrumbs & Badge */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono text-[#9baaa1]">
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <span>/</span>
          <Link href="/tools?category=video" className="hover:text-[#3cff5f] transition-colors">
            Video Tools
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">YouTube Title Generator</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#213026] bg-[#0c1510] px-4 py-1.5 text-xs font-medium text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Psychological Hook Engine · 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9] max-w-3xl mx-auto">
            Viral YouTube Title Generator & CTR Analyzer
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Generate 25+ click-worthy, algorithm-tested YouTube video titles in seconds. Categorized by curiosity, how-to, negative warning hooks, top lists, and storytelling.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <div className="mb-14">
          <YoutubeTitleGeneratorTool />
        </div>

        {/* SEO Educational Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 mb-10 shadow-xl space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-[#3cff5f]" />
              The Formula Behind 10%+ YouTube CTR Titles
            </h2>
            <p className="mt-3 text-sm text-[#9baaa1] leading-relaxed">
              Your title and thumbnail account for over 80% of whether a viewer clicks your video on the YouTube homepage or suggested feed. Great YouTube titles leverage 5 core psychological drivers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3cff5f] mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>The Curiosity Gap</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Popularized by MrBeast and Veritasium, curiosity gap titles leave an unanswered question in the viewer&apos;s mind that can only be satisfied by clicking.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f87171] mb-2">
                <Zap className="h-4 w-4" />
                <span>Negative Bias Hooks</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Humans are psychologically wired to avoid loss twice as much as seeking gain. Words like &quot;Stop&quot;, &quot;Mistake&quot;, and &quot;Avoid&quot; generate significantly higher CTRs.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#60a5fa] mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>The 50-Character Rule</span>
              </div>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Over 70% of YouTube views happen on mobile devices where titles truncate after ~50-60 characters. Keep your core hook front-loaded before character 50.
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
              <h3 className="text-sm font-bold text-[#e7eee9]">Is this YouTube Title Generator free?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes, it is 100% free with unlimited generations. No sign-up, credit card, or subscription required.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">Can I change my YouTube video title after uploading?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! If a video has a low initial Click-Through Rate (below 4%), changing your title and thumbnail often triggers the YouTube algorithm to re-test your video with new audiences.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">What is a good YouTube CTR (Click-Through Rate)?</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                According to YouTube Studio data, average CTR across channels is between 2% and 10%. Viral videos often maintain an 8% - 12%+ CTR during their initial 48-hour launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

