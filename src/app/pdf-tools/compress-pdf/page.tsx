import { Metadata } from "next";
import CompressPdfTool from "@/components/tools/CompressPdfTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Compress PDF Online - Reduce PDF File Size Free",
  description: "Compress and optimize PDF documents online. Reduce PDF file size while maintaining sharp text and vector quality directly in browser.",
  keywords: ["compress pdf", "reduce pdf size", "shrink pdf file", "pdf optimizer online free"],
};

export default function CompressPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Compress PDF",
    url: "https://iformat.io/pdf-tools/compress-pdf",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Compress PDF documents online for free without uploading files to server.",
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
            File Weight Reduction
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Compress PDF Document
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Reduce PDF file size by stripping redundant metadata and compacting stream objects while keeping text and layout razor sharp.
          </p>
        </div>

        <div className="mb-14">
          <CompressPdfTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            <span>How to Compress a PDF (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Select PDF</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your heavy PDF document. It loads directly into browser memory.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Automatic Optimization</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Our engine automatically compacts stream structures and purges bloated metadata.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download Optimized File</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Review your savings and click &ldquo;Download PDF&rdquo; to save the streamlined document.
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
              Is my confidential PDF uploaded to any cloud server?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              No. All operations run directly inside your client browser. Your contracts, bank statements, and private files remain entirely local.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
