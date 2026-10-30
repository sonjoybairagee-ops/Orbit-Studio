import { Metadata } from "next";
import ImageWatermarkTool from "@/components/tools/ImageWatermarkTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Image Watermark Tool — Add Text & Logo Watermarks Online | ToolHub",
  description:
    "Protect your photos by stamping custom text or logo watermarks online for free. Control opacity, rotation, 9-point grid position, or repeated tile patterns.",
  keywords: ["image watermark tool", "add watermark to photo", "watermark maker online free", "logo watermark tool", "photo copyright stamp"],
};

export default function ImageWatermarkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Image Watermark Tool",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "In-browser text and logo image watermarker with grid alignment and tiling.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            100% Free · Full Resolution Export
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Image Watermark Tool
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Safeguard your creative photography, digital artwork, and listings with custom text stamps or brand logo watermarks.
          </p>
        </div>

        <div className="mb-14">
          <ImageWatermarkTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            How to Watermark Images Online
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Choose Base Photo", body: "Upload your photo or screenshot in full resolution PNG, JPG, or WebP format." },
              { step: 2, title: "Customize Stamp", body: "Type your copyright text or upload your brand logo. Adjust opacity (10-100%), font size, and rotation." },
              { step: 3, title: "Position & Save", body: "Click any square on the 9-point grid (corner, center) or select Repeat Tile, then download your protected photo." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Does watermarking lower my photo's resolution?",
                a: "No! The canvas renders directly at your photo's original pixel dimensions (whether 1080p, 4K, or 24 megapixels) without downscaling.",
              },
              {
                q: "Can I use transparent PNG logos as watermarks?",
                a: "Yes! Transparent logos blend seamlessly onto the photo with adjustable opacity and scaling.",
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
