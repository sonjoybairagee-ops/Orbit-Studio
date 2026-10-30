import { Metadata } from "next";
import SvgOptimizerTool from "@/components/tools/SvgOptimizerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "SVG Optimizer — Minify and Compress SVG Vector Files | ToolHub",
  description:
    "Compress SVG files online for free. Strip editor metadata, remove comments, collapse whitespace, round numeric precision, and track byte savings with live visual render.",
  keywords: ["svg optimizer", "minify svg online", "compress svg vector", "svg cleaner", "clean svg code"],
};

export default function SvgOptimizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub SVG Optimizer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "In-browser SVG code minifier and vector optimizer.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Free · Live Vector Render
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SVG Optimizer & Minifier
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Clean and shrink SVG graphics exported from Figma, Illustrator, or Inkscape by stripping metadata, comments, and redundant coordinate decimals.
          </p>
        </div>

        <div className="mb-14">
          <SvgOptimizerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            What Does SVG Optimization Remove?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Editor Bloat", desc: "Illustrator, Inkscape, and Sketch insert extensive XML tags, namespaces, and doctype headers unnecessary for web rendering." },
              { title: "Excess Decimals", desc: "Coordinates like `12.345678` add dozens of unused characters. Rounding to 2 decimal places reduces size with zero visible difference." },
              { title: "Formatting Spaces", desc: "Tabs, indentations, and newlines intended for human reading are collapsed, maximizing web page loading speed." },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Will optimizing my SVG distort the graphic?",
                a: "No! The live visual render panel previews your optimized vector code side-by-side so you can confirm fidelity before saving.",
              },
              {
                q: "Can I paste raw SVG code directly?",
                a: "Yes! You can either upload an `.svg` file from disk or paste `<svg>...</svg>` code straight into the input editor.",
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
