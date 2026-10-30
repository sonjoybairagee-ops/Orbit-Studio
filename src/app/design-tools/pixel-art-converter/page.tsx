import { Metadata } from "next";
import PixelArtConverterTool from "@/components/tools/PixelArtConverterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Image to Pixel Art Converter — Retro 8-Bit & 16-Bit Maker | ToolHub",
  description:
    "Turn photos and graphics into retro 8-bit and 16-bit pixel art online. Choose Game Boy, NES, or PICO-8 color palettes, adjust pixel block size, and export crisp PNGs.",
  keywords: ["image to pixel art", "pixel art converter", "photo to 8bit", "retro pixel generator", "gameboy color converter"],
};

export default function PixelArtConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Image to Pixel Art Converter",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser retro 8-bit and 16-bit pixel art photo converter.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200/60 mb-2">
            100% Free · Retro Gaming Palettes
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Image to Pixel Art Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Transform portraits, landscapes, and graphics into nostalgic 8-bit and 16-bit pixel art sprites in seconds.
          </p>
        </div>

        <div className="mb-14">
          <PixelArtConverterTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-600" />
            How to Convert Photos to Pixel Art
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload Image", body: "Select any PNG, JPG, or WebP photo to load into the pixelation engine." },
              { step: 2, title: "Tune Block Size", body: "Drag the pixel block size slider (4px for subtle mosaic to 32px for chunky 8-bit)." },
              { step: 3, title: "Pick Palette", body: "Switch between Game Boy 4-color green, NES 8-bit, PICO-8, or Full Color, then download." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-cyan-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Why are the pixels so sharp and not blurry?",
                a: "The tool disables bilinear smoothing (`imageSmoothingEnabled = false`) during scaling, using nearest-neighbor interpolation to ensure every pixel block remains razor-sharp.",
              },
              {
                q: "Does downloading maintain the original image dimensions?",
                a: "Yes! The exported PNG file retains the exact width and height of your original upload.",
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
