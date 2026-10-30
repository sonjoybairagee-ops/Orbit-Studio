import { Metadata } from "next";
import SrtFormatterTool from "@/components/tools/SrtFormatterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "SRT Formatter Online - Clean, Fix & Standardize SubRip Subtitles Free",
  description: "Repair broken subtitle numbers, standardize irregular timestamps, clean HTML tags, and remove blank cues from SRT files online.",
  keywords: ["srt formatter", "clean srt file", "repair srt timestamps", "fix srt subtitle free"],
};

export default function SrtFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io SRT Formatter",
    url: "https://iformat.io/subtitle-tools/srt-formatter",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Standardize and repair broken SRT subtitle files online for free.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60 mb-2">
            Subtitle Repair & Cleanup
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SRT Subtitle Formatter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Fix broken cue indexes, standardize timecodes (e.g. converting dot periods to standard commas), and purge unneeded HTML tags.
          </p>
        </div>

        <div className="mb-14">
          <SrtFormatterTool />
        </div>

        {/* Step-by-step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <span>How to Format SRT Subtitles (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Upload or Paste SRT</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your `.srt` file or paste raw subtitle text into the left editor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Automatic Repair</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Broken indexes are renumbered sequentially (1, 2, 3...) and timecodes are normalized.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download .SRT</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Download .SRT&rdquo; to save your perfectly formatted subtitle document.
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
              Why do media players fail to display certain SRT files?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Many media players (VLC, TV media players) strictly require timecodes to use comma separators (e.g. `00:00:01,500`) and sequential numbering. Irregular dots or missing index numbers cause players to skip lines. Our formatter repairs these instantly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
