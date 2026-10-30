import { Metadata } from "next";
import FlexboxPlaygroundTool from "@/components/tools/FlexboxPlaygroundTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Flexbox Playground — Interactive Layout Builder & Guide | ToolHub",
  description:
    "Interactive CSS Flexbox builder and visual playground. Master flex-direction, justify-content, align-items, flex-wrap, gap, and align-self with instant CSS code export.",
  keywords: ["css flexbox playground", "flexbox visual tool", "justify content align items", "flexbox interactive builder", "css flex generator"],
};

export default function FlexboxPlaygroundPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Flexbox Playground",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual CSS Flexbox builder with interactive items, alignment toggles, and CSS export.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            Visual Layout Builder · Interactive Items
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Flexbox Playground
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Experiment with flex container properties and item alignments in real time. Perfect for understanding and generating responsive 1D layouts.
          </p>
        </div>

        <div className="mb-14">
          <FlexboxPlaygroundTool />
        </div>

        {/* Flexbox Guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Key Flexbox Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Main Axis vs Cross Axis",
                desc: "Flex-direction determines the main axis (row or column). Justify-content always controls alignment along the main axis, while align-items controls the cross axis.",
              },
              {
                title: "Wrapping & Flow",
                desc: "By default, flex items shrink to fit on a single line (`flex-wrap: nowrap`). Enabling `wrap` allows items to break gracefully into multiple rows.",
              },
              {
                title: "Modern Gap Property",
                desc: "No more messy negative margins! The CSS `gap` property applies clean uniform spacing strictly between items without affecting edges.",
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
              <h3 className="text-sm font-bold text-slate-900 mb-1">When should I use Flexbox instead of CSS Grid?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use Flexbox when you are designing one-dimensional layouts (a single row or column of items like navbars, badge groups, button bars). Use CSS Grid for two-dimensional page structures with both rows and columns.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">What does align-self do?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                `align-self` allows an individual flex child to override the container's `align-items` rule. For instance, pinning one button to the bottom while all others remain centered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
