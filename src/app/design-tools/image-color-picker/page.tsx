import { Metadata } from "next";
import ImageColorPickerTool from "@/components/tools/ImageColorPickerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Color Picker from Image — Extract HEX & RGB from Photos | ToolHub",
  description:
    "Pick and sample exact pixel colors from any image online with an interactive magnifying loupe. Get HEX, RGB, and HSL values and extract dominant color palettes.",
  keywords: ["color picker from image", "image eyedropper online", "extract palette from image", "hex from photo", "rgb color picker"],
};

export default function ImageColorPickerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Color Picker from Image",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "In-browser image color picker with magnifying loupe and palette extractor.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-2">
            100% Client-Side · Eyedropper & Palette Extraction
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Color Picker from Image
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Sample colors from photos, logos, and UI screenshots with pixel precision or extract the top dominant color palette.
          </p>
        </div>

        <div className="mb-14">
          <ImageColorPickerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600" />
            How to Pick Colors from Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload Graphic", body: "Select any PNG, JPG, or WebP graphic from your phone, screenshot folder, or computer." },
              { step: 2, title: "Hover & Sample", body: "Hover over the image to inspect real-time pixel hex codes, then click to lock the color." },
              { step: 3, title: "Copy Codes", body: "Copy the exact HEX, RGB, or HSL code, or explore the automatically generated dominant palette." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white mb-3">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-rose-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "How are dominant colors chosen?",
                a: "The tool scans pixel distributions across the entire image and groups the most prominent color clusters into an 8-swatch palette.",
              },
              {
                q: "Is my image uploaded to any server?",
                a: "No! All canvas pixel reads happen in your local browser memory via HTML5 Canvas `getImageData`.",
              },
            ].map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="text-sm font-bold text-slate-800">{faq.q}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
