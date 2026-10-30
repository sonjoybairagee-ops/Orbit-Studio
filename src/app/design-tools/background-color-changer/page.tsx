import { Metadata } from "next";
import BackgroundColorChangerTool from "@/components/tools/BackgroundColorChangerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Background Color Changer — Replace Image Backgrounds Online | ToolHub",
  description:
    "Change or replace photo background colors online for free. Adjust color matching tolerance, replace solid backgrounds, or fill transparent PNGs with any color.",
  keywords: ["background color changer", "change image background color", "replace white background", "transparent background to color", "photo background editor"],
};

export default function BackgroundColorChangerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Background Color Changer",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser image background color replacement and underlay tool.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 border border-fuchsia-200/60 mb-2">
            100% Client-Side · Eyedropper Sampling
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Background Color Changer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Swap solid photo backgrounds (white, gray, green screen) with new colors or fill transparent PNGs with vibrant backdrops.
          </p>
        </div>

        <div className="mb-14">
          <BackgroundColorChangerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-fuchsia-600" />
            How to Change Image Background Color
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload Image", body: "Select any PNG, JPG, or WebP photo. The tool automatically detects the background color." },
              { step: 2, title: "Sample & Tune", body: "Click directly on the canvas to sample the exact background color to replace, and tweak tolerance." },
              { step: 3, title: "Pick New Color", body: "Select your new color from the palette swatches or color picker, then download your PNG." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-fuchsia-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is Match Tolerance?",
                a: "Tolerance controls how strictly pixel colors must match your target color. Lower values (10-20) only replace identical shades, while higher values (30-50) replace subtle shadows and gradients.",
              },
              {
                q: "Can I replace white backgrounds with transparency?",
                a: "Yes! Click the 'Clear (Alpha)' button as your new background color to remove the background entirely.",
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
