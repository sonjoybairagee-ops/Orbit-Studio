import { Metadata } from "next";
import PdfOrganizerTool from "@/components/tools/PdfOrganizerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Page Organizer Online - Reorder, Rotate & Delete Pages Free",
  description: "Visual PDF page organizer: reorder pages, rotate upside-down sheets, and delete unwanted pages directly in your browser.",
  keywords: ["pdf organizer", "reorder pdf pages", "rotate pdf pages", "delete pdf pages online free"],
};

export default function PdfOrganizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io PDF Page Organizer",
    url: "https://iformat.io/pdf-tools/pdf-organizer",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Reorder, rotate, and delete pages from PDF files online for free.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/60 mb-2">
            Page Management
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            PDF Page Organizer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Reorder pages, rotate sideways or upside-down sheets, and delete unnecessary pages with visual cards.
          </p>
        </div>

        <div className="mb-14">
          <PdfOrganizerTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-600" />
            <span>How to Organize PDF Pages (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Load PDF</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your document to generate interactive visual cards for each individual page.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Rotate, Reorder or Delete</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click rotate to fix orientations, use arrows to reorder, or click the trash icon to exclude pages.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Export PDF</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Apply & Export PDF&rdquo; to download your perfectly arranged document.
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
              Can I recover a page if I accidentally mark it as deleted?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Yes. Clicking the Undo/Restore button on any deleted page immediately brings it back before you click Export.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
