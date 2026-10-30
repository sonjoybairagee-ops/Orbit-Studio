import { Metadata } from "next";
import SplitPdfTool from "@/components/tools/SplitPdfTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Split PDF Online - Extract Pages from PDF Document Free",
  description: "Extract specific pages or page ranges from PDF files online. Fast, secure, and client-side with no file upload.",
  keywords: ["split pdf", "extract pdf pages", "cut pdf pages", "separate pdf free"],
};

export default function SplitPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Split PDF",
    url: "https://iformat.io/pdf-tools/split-pdf",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Extract pages or ranges from PDF documents online for free.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200/60 mb-2">
            Precision Extraction
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Split PDF Document
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Extract selected pages or custom page intervals (e.g. 1-4, 7) into a brand new PDF without compromising formatting.
          </p>
        </div>

        <div className="mb-14">
          <SplitPdfTool />
        </div>

        {/* Step-by-step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-orange-600" />
            <span>How to Split a PDF (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Upload PDF</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Choose the PDF file you wish to split. The tool immediately detects its total page count.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Enter Page Ranges</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Input the pages you want (e.g. &ldquo;1-3, 5, 8&rdquo;) or click our quick shortcut buttons.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Extract & Download</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Split & Extract&rdquo; to save your targeted pages into a newly created PDF.
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
              Will splitting a PDF affect text quality or hyperlinks?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              No. Our client-side engine copies the original vector objects, typography, fonts, and images directly without re-rasterizing, preserving 100% original quality.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
