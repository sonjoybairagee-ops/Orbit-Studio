import { Metadata } from "next";
import RemoveExtraSpacesTool from "@/components/tools/RemoveExtraSpacesTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Remove Extra Spaces Online - Strip Multiple & Trailing Whitespace Free",
  description: "Remove unnecessary spaces, multiple consecutive whitespaces, trailing spaces, and blank lines from your text online for free.",
  keywords: ["remove extra spaces", "clean whitespace", "strip double spaces", "remove blank lines", "text cleaner online"],
};

export default function RemoveExtraSpacesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Remove Extra Spaces",
    url: "https://iformat.io/text-tools/remove-extra-spaces",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Remove duplicate whitespace, trailing spaces, and blank lines from text online.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            Whitespace Cleaner
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Remove Extra Spaces
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Clean up messy documents, code snippets, or notes by collapsing consecutive double spaces, trimming line edges, and removing empty blank lines.
          </p>
        </div>

        <div className="mb-14">
          <RemoveExtraSpacesTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            <span>How to Remove Extra Spaces (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Paste Messy Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Paste your unformatted content containing erratic spaces or empty lines.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Configure Rules</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Enable or disable collapsing multi-spaces, trimming line margins, or removing blank lines.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Copy Cleaned Text</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Review how many characters were saved and copy the clean copy with a single click.
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
              Will this tool remove single spaces between words?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              No. It specifically collapses repeated consecutive spaces (e.g. 2, 3, or more spaces) down to a single clean space so your sentences remain grammatical and readable.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
