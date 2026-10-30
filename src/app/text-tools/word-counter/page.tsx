import { Metadata } from "next";
import WordCounterTool from "@/components/tools/WordCounterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Word Counter Online - Real-Time Word & Character Count Free",
  description: "Count words, characters, sentences, paragraphs, and reading time in real-time. 100% private client-side word counter tool.",
  keywords: ["word counter", "word count online", "count characters", "reading time calculator", "keyword density"],
};

export default function WordCounterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Word Counter",
    url: "https://iformat.io/text-tools/word-counter",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Count words, characters, and reading time online for free in real-time.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            Real-Time Analysis
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Word Counter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Calculate words, characters, sentences, paragraphs, reading speed, and keyword density live as you type or paste text.
          </p>
        </div>

        <div className="mb-14">
          <WordCounterTool />
        </div>

        {/* Step-by-step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span>How to Use the Word Counter (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Type or Paste Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Paste your content or write directly inside the responsive text editor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Check Live Metrics</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Watch words, characters (with and without spaces), sentences, and reading time update instantaneously.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Inspect Frequency</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Review your top keywords and percentage density at the bottom of the card.
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
              How is reading time calculated?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Standard adult silent reading speed averages 200 words per minute (WPM), while normal speaking speed averages 130 WPM. Our tool computes both metrics dynamically based on total word count.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
