import { Metadata } from "next";
import CaseConverterTool from "@/components/tools/CaseConverterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Converter Online - UPPERCASE, lowercase, Title Case Free",
  description: "Convert text casing instantly to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.",
  keywords: ["case converter", "uppercase converter", "lowercase converter", "title case converter", "camelcase converter", "slug generator"],
};

export default function CaseConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Case Converter",
    url: "https://iformat.io/text-tools/case-converter",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Convert text casing formats online for free.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            Instant Typography Transformation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Case Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Change text case between UPPERCASE, lowercase, Title Case, Sentence case, programming formats (camelCase, snake_case), and more with one click.
          </p>
        </div>

        <div className="mb-14">
          <CaseConverterTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>How to Convert Text Case (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Paste Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Paste any mixed, disorganized, or accidentally all-caps text into the editor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Click a Case Button</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Choose UPPERCASE, lowercase, Title Case, Sentence case, or code identifiers (camelCase, snake_case).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Copy Converted Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Hit &ldquo;Copy Text&rdquo; to use your newly formatted copy immediately.
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
              What is the difference between Title Case and Sentence Case?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              In <strong>Title Case</strong>, the first letter of almost every word is capitalized (ideal for headings and book titles). In <strong>Sentence case</strong>, only the very first letter of each sentence is capitalized, just like standard writing prose.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
