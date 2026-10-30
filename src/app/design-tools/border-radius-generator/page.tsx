import { Metadata } from "next";
import BorderRadiusGeneratorTool from "@/components/tools/BorderRadiusGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Border Radius Generator — 8-Point Organic Blobs & Corners | ToolHub",
  description:
    "Generate modern CSS border radius shapes, organic fluid blobs, pill badges, and custom corner values with instant visual preview and one-click CSS copy.",
  keywords: ["css border radius generator", "8 point border radius", "organic blob generator", "css shape generator", "border-radius preview"],
};

export default function BorderRadiusGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Border Radius Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Interactive 4-corner and 8-point organic blob CSS border-radius generator.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            Standard Corners & 8-Point Blobs
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Border Radius Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Design smooth card corners, asymmetric modern badges, and organic morphing blob shapes with 8-value CSS3 border-radius syntax.
          </p>
        </div>

        <div className="mb-14">
          <BorderRadiusGeneratorTool />
        </div>

        {/* Feature Explanations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Border Radius Syntax Demystified
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "4-Corner Symmetry",
                desc: "Controls the radius of top-left, top-right, bottom-right, and bottom-left using pixel or percentage measurements.",
              },
              {
                title: "8-Point Full Slash Syntax",
                desc: "Using the slash notation (a b c d / e f g h), you specify independent horizontal and vertical elliptical radii for each corner.",
              },
              {
                title: "Fluid Blob Shapes",
                desc: "By varying the horizontal and vertical radii, elements deform into smooth, organic shapes popular in modern hero sections.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-indigo-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">What does the slash ( / ) mean in border-radius?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The values before the slash define horizontal radii, while the values after the slash define vertical radii. If no slash is present, horizontal and vertical radii are equal.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Is 8-point border-radius supported by all modern browsers?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes, elliptical border radii have been standard in CSS3 and are supported in Chrome, Safari, Firefox, Edge, and mobile browsers since 2011.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
