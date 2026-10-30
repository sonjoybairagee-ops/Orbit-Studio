import { Metadata } from "next";
import TextDiffCheckerTool from "@/components/tools/TextDiffCheckerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Text Diff Checker Online - Compare Two Texts & Find Differences Free",
  description: "Compare two text snippets side-by-side or word-by-word. Highlight additions, deletions, and changes in real-time online for free.",
  keywords: ["text diff checker", "compare text online", "diff tool", "find differences in text", "text comparison online"],
};

export default function TextDiffCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Text Diff Checker",
    url: "https://iformat.io/text-tools/text-diff-checker",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Compare two texts and highlight differences online for free.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200/60 mb-2">
            Visual Comparison
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Text Diff Checker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Compare two versions of a text, article, or code snippet. Instantly detect added words (green) and removed words (red).
          </p>
        </div>

        <div className="mb-14">
          <TextDiffCheckerTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            <span>How to Compare Texts (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Paste Original Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Paste the original draft or base content in the left box.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Paste Modified Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Paste the revised, edited, or updated version in the right box.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Analyze Differences</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                View highlighted additions, deletions, and toggle between word-by-word and line-by-line comparison.
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
              Is my text compared securely without being logged?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Yes. All comparison calculations run client-side in your browser JavaScript memory. Neither snippet is ever transmitted to or stored on any server.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
