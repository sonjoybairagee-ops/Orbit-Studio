import { Metadata } from "next";
import SrtToVttTool from "@/components/tools/SrtToVttTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "SRT to VTT Converter Online - Convert SubRip to WebVTT Free",
  description: "Convert SubRip (.SRT) subtitle files to WebVTT (.VTT) for HTML5 video players, Safari, Chrome, and online video streaming.",
  keywords: ["srt to vtt converter", "convert srt to webvtt", "html5 video subtitles", "vtt subtitles free"],
};

export default function SrtToVttPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io SRT to VTT Converter",
    url: "https://iformat.io/subtitle-tools/srt-to-vtt",
    applicationCategory: "UtilityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Convert SubRip .SRT files to modern WebVTT .VTT files online for free.",
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
            HTML5 Video Compatible
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SRT to VTT Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert standard desktop .SRT subtitle files into modern WebVTT format for native HTML5 video tags and streaming platforms.
          </p>
        </div>

        <div className="mb-14">
          <SrtToVttTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>How to Convert SRT to VTT (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Select .SRT File</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Choose any standard SubRip file or paste the text content directly.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Instant Conversion</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                The WEBVTT header is added and timecode comma separators are converted to periods.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download .VTT</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Save the WebVTT file and load it in your website&apos;s &lt;track&gt; video elements.
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
              Can HTML5 &lt;video&gt; tags play .SRT files directly?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              No. The W3C HTML5 video specification mandates the WebVTT (`.vtt`) format for subtitle &lt;track&gt; tags. Standard `.srt` files will not render in web browsers without conversion.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
