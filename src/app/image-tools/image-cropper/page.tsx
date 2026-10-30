import { Metadata } from "next";
import ImageCropperTool from "@/components/tools/ImageCropperTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Image Cropper Online - Crop Photos to Exact Ratios & Shapes",
  description:
    "Crop pictures online with freeform or standard aspect ratios (1:1, 16:9, 4:3, 9:16). Real-time visual canvas cropping with high quality export.",
  keywords: ["image cropper", "crop photo online", "square image crop", "16:9 cropper", "cut image online"],
};

export default function ImageCropperPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "iformat.io Image Cropper",
    url: "https://iformat.io/image-tools/image-cropper",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Crop photos online for free with instant canvas preview.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200/60 mb-2">
            Visual Composition
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Image Cropper
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Cut and trim images to square, widescreen, portrait, or custom dimensions with precision pixel coordinates.
          </p>
        </div>

        <div className="mb-14">
          <ImageCropperTool />
        </div>

        {/* Step by step guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            <span>How to Crop Images (ব্যবহার নির্দেশিকা)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-800">Choose Image</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Upload your picture. The canvas displays both the cropping frame and live output preview.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-800">Select Ratio or Sliders</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Pick 1:1 for profile pictures, 16:9 for YouTube covers, or adjust X/Y offset sliders for customized composition.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-800">Save Cropped File</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Click &ldquo;Download Cropped Image&rdquo; to save the newly framed image instantly.
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
              Is there any watermarking added to my cropped photo?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              None at all. All tools on iformat.io are 100% free with clean, un-watermarked outputs.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
