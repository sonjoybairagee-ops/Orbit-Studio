import { Metadata } from "next";
import { GridGeneratorTool } from "@/components/tools/GridGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Grid Generator — Visual Layout Builder & Code Export | ToolHub",
  description:
    "Visual CSS Grid builder with interactive row & column controls, item spanning, gap adjustments, layout presets (Holy Grail, Bento, Dashboard), and instant CSS code export.",
  keywords: ["css grid generator", "css grid layout builder", "holy grail grid", "bento grid css", "css grid area tool"],
};

export default function GridGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Grid Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual CSS Grid layout generator with interactive spanning, templates, and one-click CSS export.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            Visual Matrix Builder · Multi-Track Spanning
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Grid Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Design multi-column, multi-row responsive layouts visually. Adjust column spans, row placements, and gaps with immediate production-ready CSS code.
          </p>
        </div>

        <div className="mb-14">
          <GridGeneratorTool />
        </div>

        {/* CSS Grid Cheat Sheet */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            CSS Grid Essentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Fractional Units (fr)",
                desc: "The `fr` unit represents a fraction of the available space inside the grid container, dynamically shrinking and stretching with viewport changes.",
              },
              {
                title: "Grid Lines vs Tracks",
                desc: "Grid tracks are the rows and columns, while grid lines are the dividing borders. A 4-column grid has 5 column lines (1 through 5).",
              },
              {
                title: "grid-area Shorthand",
                desc: "Defines the bounding box of a child item: `grid-area: row-start / col-start / row-end / col-end;` without needing multiple properties.",
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
              <h3 className="text-sm font-bold text-slate-900 mb-1">How can I make the grid responsive?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use `repeat(auto-fit, minmax(280px, 1fr))` to automatically adapt columns based on the screen width without manual media queries.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Does CSS Grid replace Flexbox?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No, they complement each other! Modern web development uses CSS Grid for the macro layout (overall page structure, sidebars, content grids) and Flexbox for micro layouts (cards, navbars, button groups).
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
