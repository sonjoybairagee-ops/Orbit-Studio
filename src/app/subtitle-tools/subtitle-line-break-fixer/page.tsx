import { Metadata } from "next";
import SubtitleLineBreakFixerTool from "@/components/tools/SubtitleLineBreakFixerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Subtitle Line Break Fixer Online - Rebalance CPL & Lines Free",
  description: "Split long subtitle lines into readable two-line dialogues. Conform to Netflix and YouTube standards (max 42 characters per line).",
  keywords: ["subtitle line break fixer", "balance subtitle lines", "characters per line srt", "netflix subtitle guidelines"],
};

export default function SubtitleLineBreakFixerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Subtitle Line Break Fixer",
    url: "https://iformat.io/subtitle-tools/subtitle-line-break-fixer",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Rebalance long subtitle lines into readable dialogues online.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200/60 mb-2">
            Streaming & Broadcast Standards
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Subtitle Line Break Fixer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Automatically balance single-line dialogues into readable, professional two-line subtitles adhering to Netflix and YouTube character limits (max 42 CPL).
          </p>
        </div>

        <div className="mb-14">
          <SubtitleLineBreakFixerTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-sky-600" />
            <span>How to Fix Subtitle Line Breaks (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Add Subtitle File</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your `.srt` file or paste dialogue cues into the original editor.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Choose Character Limit</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Select between 37, 40, or 42 characters per line (Netflix standard).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download Rebalanced SRT</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Save the newly formatted subtitle with natural grammatical splits.
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
              Why should subtitles not exceed 42 characters per line?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              When subtitle lines exceed 42 characters, viewers are forced to make excessive eye movements across the screen, detracting from the video. Furthermore, on mobile phones and tablets, long lines get awkwardly clipped or wrap onto 3 or 4 rows.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
