import { Metadata } from "next";
import ImageCompressorTool from "@/components/tools/ImageCompressorTool";
import { ShieldCheck, Zap, Sliders, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Image Compressor - Compress JPG, PNG, WebP Online",
  description:
    "Compress images online up to 90% without losing quality. 100% private browser-based compression with instant preview and download.",
  keywords: ["image compressor", "compress jpeg", "reduce photo size", "png compressor", "bulk image optimizer"],
};

export default function ImageCompressorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Image Compressor",
    url: "https://iformat.io/image-tools/image-compressor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "Free online client-side image compressor for JPG, PNG, and WebP files.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Title & Introduction */}
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Free Privacy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Image Compressor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Reduce image file size dramatically while preserving visual sharpness. Adjust the quality slider to find your perfect balance.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <div className="mb-14">
          <ImageCompressorTool />
        </div>

        {/* Step by Step Guide (ব্যবহারবিধি) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>How to Compress Images (ব্যবহারবিধি ও নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Upload Image</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Drag and drop your JPG, PNG, or WebP photo into the upload box or click to select from your device.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Tune Quality Slider</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Slide between 10% and 95% quality. Our real-time preview shows exact file size savings instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Download Result</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click the &ldquo;Download Image&rdquo; button to save your lightweight, high-performance compressed file.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Editorial / FAQ */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-700" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">
              Will compressing my image reduce its resolution or dimensions?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              No. Our image compressor optimizes color encoding tables and removes unnecessary metadata while keeping the original pixel dimensions completely untouched.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">
              Is my image uploaded to any cloud server?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Never. The entire compression process executes inside your browser&apos;s HTML5 Canvas engine. Your photos remain 100% private on your own computer or phone.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
