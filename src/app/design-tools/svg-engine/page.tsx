import { Metadata } from "next";
import SvgEngineTool from "@/components/tools/SvgEngineTool";
import { CheckCircle2, HelpCircle, Layers, Sparkles, FileCode, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SVG Engine — Convert SVG to EPS, PNG (Up to 8K) & JPG Online Free | CompX Orbit",
  description:
    "Free browser SVG Vector Engine. Convert SVG files to Adobe Illustrator EPS vector, high-DPI transparent PNG (1x-8x up to 8K), and compressed JPG. 100% private, instant client-side.",
  keywords: [
    "svg to eps",
    "svg to eps converter",
    "svg to png 4k",
    "svg to jpg",
    "convert svg to eps online free",
    "illustrator vector eps from svg",
    "svg vector engine",
    "high resolution svg converter",
  ],
  alternates: {
    canonical: "/design-tools/svg-engine",
  },
  openGraph: {
    title: "SVG Engine — Convert SVG to EPS, PNG & JPG Online Free",
    description: "Instant in-browser vector conversion to Illustrator EPS, transparent PNG, and JPG.",
    url: "https://compxorbit.com/design-tools/svg-engine",
    type: "website",
  },
};

export default function SvgEnginePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit SVG Vector Engine",
    url: "https://compxorbit.com/design-tools/svg-engine",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "In-browser SVG Vector Engine: convert SVG to EPS, high-DPI PNG, and JPG.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Free · Client-Side Vector Engine</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            SVG Vector Engine
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#8da194] max-w-2xl mx-auto">
            Convert SVG vectors into native <b>Adobe Illustrator EPS</b>, high-resolution transparent <b>PNG</b> (1x to 8K), and optimized <b>JPG</b> directly in your browser.
          </p>
        </div>

        {/* Main Interactive Tool */}
        <div className="mb-14">
          <SvgEngineTool />
        </div>

        {/* Formats Overview Cards */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-8 mb-10 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#3cff5f]" />
            Supported Output Formats & Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📐</span>
                <h3 className="text-sm font-black text-[#3cff5f]">EPS (PostScript Vector)</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Encapsulated PostScript Level 3 vector format. Opens natively in <b>Adobe Illustrator</b>, <b>Photoshop</b>, InDesign, CorelDRAW, and vector cutting plotters with infinitely scalable vector paths.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🖼️</span>
                <h3 className="text-sm font-black text-[#38bdf8]">PNG (High-DPI Alpha)</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Crisp raster image with full 32-bit transparent alpha channel. Export at <b>1x, 2x Retina, 4x Ultra HD, or 8K</b> for pristine print and digital UI sharpness.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <h3 className="text-sm font-black text-amber-400">JPG / JPEG (Compressed)</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Solid-background raster graphics with adjustable compression quality (30% to 100%) and custom background color selection (White, Black, or custom HEX).
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-[#1d2a21] text-xs">
            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                Can the exported .EPS file be edited in Adobe Illustrator?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                Yes! The generated EPS file uses standard PostScript Level 3 vector path operators (<code className="text-[#3cff5f]">moveto</code>, <code className="text-[#3cff5f]">lineto</code>, <code className="text-[#3cff5f]">curveto</code>, <code className="text-[#3cff5f]">closepath</code>, <code className="text-[#3cff5f]">setrgbcolor</code>). When opened in Adobe Illustrator, it imports as fully editable vector paths, shapes, and color fills.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                Are my SVG files uploaded to any external server?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                No! The entire SVG Engine runs 100% locally in your web browser using HTML5 Canvas and native JavaScript parsers. Your files, proprietary graphics, and logos never leave your computer.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                How large can I scale PNG exports?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                You can choose up to <b>8x resolution multiplier</b>, generating crystal-clear 4K, 8K, and 300+ DPI print-ready images directly from your source vector.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
