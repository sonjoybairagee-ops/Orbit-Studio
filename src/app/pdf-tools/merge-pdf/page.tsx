import { Metadata } from "next";
import MergePdfTool from "@/components/tools/MergePdfTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Merge PDF Online - Combine Multiple PDF Files Free",
  description: "Merge multiple PDF files into a single document directly in your browser. 100% private, free, and secure with no file limits.",
  keywords: ["merge pdf", "combine pdf files", "pdf merger online", "join pdf pages free"],
};

export default function MergePdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Merge PDF",
    url: "https://iformat.io/pdf-tools/merge-pdf",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Combine multiple PDF documents into one online for free without uploading files to server.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-2">
            100% Free Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Merge PDF Files
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Combine multiple PDF documents into a single organized file in seconds. Drag and drop, reorder sheets, and download immediately.
          </p>
        </div>

        <div className="mb-14">
          <MergePdfTool />
        </div>

        {/* Step-by-step usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600" />
            <span>How to Merge PDF Files (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Select Multiple PDFs</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click to upload or drag & drop two or more PDF documents into the merging tool.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Reorder Documents</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Use the Move Up and Move Down arrows to set the exact chronological order for your merged PDF.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Merge & Download</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Merge PDFs&rdquo; and immediately download your combined single document.
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
              Is there any limitation on file size or number of PDFs?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Because all merging happens locally in your browser memory, there are no artificial file limits. You can combine large documents without waiting for cloud queues.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
