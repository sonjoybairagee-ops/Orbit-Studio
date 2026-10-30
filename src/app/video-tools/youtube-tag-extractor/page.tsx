import type { Metadata } from "next";
import Link from "next/link";
import { Tag, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import YoutubeTagExtractorTool from "@/components/tools/YoutubeTagExtractorTool";

export const metadata: Metadata = {
  title: "Free YouTube Tag Extractor & SEO Keyword Finder | Compx Orbit",
  description:
    "Extract hidden tags, keywords, and hashtags from any YouTube video or Shorts. 1-click copy comma-separated tags for YouTube Studio with character limit validation. 100% free.",
  keywords: [
    "youtube tag extractor",
    "extract youtube tags",
    "find youtube tags",
    "youtube keyword finder",
    "youtube video tags copy",
    "youtube seo tool free",
    "competitor youtube tags spy",
  ],
  alternates: {
    canonical: "/video-tools/youtube-tag-extractor",
  },
  openGraph: {
    title: "Free YouTube Tag Extractor & SEO Keyword Finder | Compx Orbit",
    description:
      "Find out what keywords and tags top ranking YouTube videos use. Copy all tags with 1 click for YouTube Studio.",
    url: "/video-tools/youtube-tag-extractor",
    type: "website",
  },
};

export default function YoutubeTagExtractorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YouTube Tag Extractor & SEO Keyword Finder",
    url: "https://compxorbit.com/video-tools/youtube-tag-extractor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Instantly extract all hidden keywords, tags, and hashtags from any YouTube video or Shorts link.",
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
          <Link href="/video-tools" className="hover:text-[#3cff5f] transition-colors">Video Tools</Link>
          <span>/</span>
          <span className="text-[#e7eee9]">YouTube Tag Extractor</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>YouTube SEO &amp; Research</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            YouTube Tag Extractor &amp; SEO Finder
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Extract hidden tags, SEO keywords, and hashtags from any public YouTube video or Shorts link.
            Copy all tags in 1 click ready to paste into YouTube Studio.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <YoutubeTagExtractorTool />

        {/* Educational Content & Guide */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Spy on Competitor SEO</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Discover the exact search queries and tag combinations viral creators in your niche use to rank on YouTube Search and Suggested Videos.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Tag className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">YouTube Studio Ready</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Export comma-separated tags with a live 500-character budget counter so your video tags fit YouTube upload requirements seamlessly.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% Free &amp; Unlimited</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              No daily search quotas, no browser extensions to install, and no account signup required. Fast and lightweight.
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
                How do I copy tags from a YouTube video?
              </h3>
              <p className="leading-relaxed">
                Copy the link of any YouTube video or Shorts, paste it into the box above, and click &quot;Extract Tags&quot;. You can then click &quot;Copy All Tags&quot; to copy the comma-separated keywords directly into your clipboard.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Why are video tags useful for YouTube SEO?
              </h3>
              <p className="leading-relaxed">
                Tags help YouTube&apos;s recommendation algorithm understand common misspellings, semantic synonyms, and contextual themes of your content, assisting in matching your video with interested viewers.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                What is the maximum number of tags allowed on YouTube?
              </h3>
              <p className="leading-relaxed">
                YouTube allows up to 500 total characters across all tags combined. Our tool includes an active character counter to ensure your selected tags stay under the 500-character ceiling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

