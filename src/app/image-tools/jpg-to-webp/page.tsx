import { Metadata } from "next";
import JpgToWebpTool from "@/components/tools/JpgToWebpTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free JPG to WebP Converter Online - Ultra Fast & Lossless",
  description:
    "Convert JPG and JPEG photos to lightweight WebP format. Boost website speed and improve Google SEO ranking with next-gen image compression.",
  keywords: ["jpg to webp", "convert jpg to webp", "jpeg to webp", "image format converter", "webp converter"],
};

export default function JpgToWebpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io JPG to WebP Converter",
    url: "https://iformat.io/image-tools/jpg-to-webp",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Convert JPG to WebP online for free without uploading files to server.",
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
            Next-Gen Image Format
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            JPG to WebP Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert standard JPG and JPEG images to WebP to save up to 40% file size without loss of visual clarity.
          </p>
        </div>

        <div className="mb-14">
          <JpgToWebpTool />
        </div>

        {/* Step by step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-sky-600" />
            <span>How to Convert JPG to WebP (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Select JPG Image</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Choose any JPG or JPEG file from your computer or drag and drop it into the dropzone.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Set Quality Level</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Use our slider to adjust output quality. 80-85% is ideal for high web performance and crisp aesthetics.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download .WebP</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Hit &ldquo;Download WebP&rdquo; to save your optimized asset immediately.
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
              Why should I convert JPG images to WebP?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Google developed WebP specifically for the modern web. WebP images are substantially smaller than JPGs with identical quality, leading to faster site loading, lower bandwidth costs, and superior Google PageSpeed Insights scores.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
