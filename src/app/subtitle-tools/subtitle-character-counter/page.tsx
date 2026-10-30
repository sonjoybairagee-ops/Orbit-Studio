import { Metadata } from "next";
import SubtitleCharacterCounterTool from "@/components/tools/SubtitleCharacterCounterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Subtitle Character Counter & Reading Speed Analyzer (CPS) Free",
  description: "Calculate subtitle Characters Per Second (CPS), line lengths, and identify cues that flash too quickly on screen for comfortable reading.",
  keywords: ["subtitle character counter", "subtitle cps analyzer", "characters per second subtitles", "reading speed subtitle audit free"],
};

export default function SubtitleCharacterCounterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Subtitle Character Counter",
    url: "https://iformat.io/subtitle-tools/subtitle-character-counter",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Analyze subtitle reading speeds (CPS), character counts, and line lengths online.",
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
            Readability & Quality Audit
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Subtitle Character Counter & CPS
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Audit subtitle readability metrics: calculate Characters Per Second (CPS), total character counts, and pinpoint cues that flash too fast for viewers to read.
          </p>
        </div>

        <div className="mb-14">
          <SubtitleCharacterCounterTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <span>How to Audit Subtitle Readability (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Upload Subtitles</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your `.srt` or `.vtt` file to initiate the client-side readability audit.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Review Average CPS</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Check average duration per cue and Characters Per Second (industry ideal is 15-20 CPS).
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Fix Flagged Problem Cues</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Inspect cues highlighted with warnings (&gt;22 CPS or &gt;42 chars) to adjust timings or trim dialogue.
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
              What is the standard Characters Per Second (CPS) for subtitles?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Major streaming services (including Netflix and BBC) recommend a reading speed between 15 and 17 CPS for adult audiences, and 12 to 14 CPS for children. Anything over 22-25 CPS is generally unreadable without pausing.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
