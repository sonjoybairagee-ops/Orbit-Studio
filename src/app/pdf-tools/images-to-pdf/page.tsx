import { Metadata } from "next";
import ImagesToPdfTool from "@/components/tools/ImagesToPdfTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Images to PDF Converter Online - Convert JPG & PNG to PDF Free",
  description: "Convert multiple JPG, PNG, and photos into a single PDF document. Choose A4 or Letter sizes, adjust orientation, and download immediately.",
  keywords: ["images to pdf", "jpg to pdf", "png to pdf", "photos to pdf converter online"],
};

export default function ImagesToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Images to PDF",
    url: "https://iformat.io/pdf-tools/images-to-pdf",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Convert photos and images into a single PDF document online for free.",
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
            Multi-Image Compilation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Images to PDF Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Transform pictures into clean, multi-page PDF documents. Arrange photos, select A4 or Letter formats, and download in one click.
          </p>
        </div>

        <div className="mb-14">
          <ImagesToPdfTool />
        </div>

        {/* Usage guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <span>How to Convert Images to PDF (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Add Pictures</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload one or several JPG and PNG pictures from your mobile or desktop device.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Choose Page Format</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Select between Fit to Image, Standard A4, or US Letter, with portrait or landscape orientation.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download PDF</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Create PDF&rdquo; to download your newly compiled multi-page document.
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
              Can I reorder the sequence of images before converting?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Yes. Use the up and down arrow buttons next to any image thumbnail to reorder pages before compiling into PDF.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
