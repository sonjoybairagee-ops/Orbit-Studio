import { Metadata } from "next";
import CharacterCounterTool from "@/components/tools/CharacterCounterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Character Counter Online - Social Media Length Checker Free",
  description: "Count total characters, letters, spaces, digits, and track limits for Twitter/X, Instagram, LinkedIn, and SEO meta descriptions.",
  keywords: ["character counter", "count characters online", "twitter character limit", "letter count", "social media length checker"],
};

export default function CharacterCounterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Character Counter",
    url: "https://iformat.io/text-tools/character-counter",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Detailed character counter and social media character limit tracker.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            Social Media Length Tracker
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Character Counter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Inspect detailed character breakdown and stay within character limits for Twitter (280), SEO meta descriptions (160), Instagram, and LinkedIn.
          </p>
        </div>

        <div className="mb-14">
          <CharacterCounterTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <span>How to Count Characters (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Input Content</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Enter your tweet, article headline, or bio into the live editor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Track Social Limits</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Check the color-coded platform progress bars to prevent exceeding character allowances.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Copy to Clipboard</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Copy Text&rdquo; to paste your verified copy directly to your social platform.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-700" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">
              What is the ideal length for SEO meta descriptions?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Google generally truncates search snippets around 155 to 160 characters on desktop devices. Keeping descriptions between 140 and 155 characters ensures your full message is visible in search results.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
