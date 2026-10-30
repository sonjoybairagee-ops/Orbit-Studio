import { Metadata } from "next";
import ImageResizerTool from "@/components/tools/ImageResizerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Image Resizer Online - Resize Photos by Pixel, Percentage & Presets",
  description:
    "Resize images online for free. Adjust dimensions with locked aspect ratio, percentage scaling, and social media presets (Instagram, YouTube, Facebook).",
  keywords: ["image resizer", "resize image online", "resize photo pixels", "instagram photo resizer", "youtube thumbnail resizer"],
};

export default function ImageResizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Image Resizer",
    url: "https://iformat.io/image-tools/image-resizer",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Resize photos by dimensions, percentage, and presets online.",
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
            Dimension Scaling
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Image Resizer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Change pixel dimensions or scale percentage while keeping crisp visual quality and proportional aspect ratio.
          </p>
        </div>

        <div className="mb-14">
          <ImageResizerTool />
        </div>

        {/* Step by step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            <span>How to Resize Images (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Upload Your Photo</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Choose any JPG, PNG, or WebP picture. The tool automatically detects its natural dimensions.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Input Width or Presets</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Enter target pixel width/height, choose a percentage (e.g. 50%), or click an Instagram/YouTube social template.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Instant Download</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Download Resized Image&rdquo; to save your perfectly sized graphic.
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
              Will resizing stretch or distort my image?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              By default, the &ldquo;Aspect Ratio Locked&rdquo; option is enabled. When you alter width, height automatically calculates proportionately so distortion never occurs.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
