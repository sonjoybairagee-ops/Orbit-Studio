import { Metadata } from "next";
import ColorContrastCheckerTool from "@/components/tools/ColorContrastCheckerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Color Contrast Checker — WCAG 2.1 AA & AAA Compliance | ToolHub",
  description:
    "Test foreground text and background color contrast ratios in real-time against WCAG 2.1 AA and AAA accessibility standards. Perfect for web designers and UX engineers.",
  keywords: ["color contrast checker", "wcag contrast ratio", "accessible color palette", "aa aaa contrast tester", "web design accessibility"],
};

export default function ColorContrastCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Color Contrast Checker",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "WCAG 2.1 AA & AAA compliance color contrast ratio checker with live card previews.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            WCAG 2.1 Compliant · AA & AAA Standard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Color Contrast Checker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Calculate accurate luminance contrast ratios between text and background colors according to official W3C accessibility guidelines.
          </p>
        </div>

        <div className="mb-14">
          <ColorContrastCheckerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Understanding WCAG 2.1 Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AA Level (Minimum)",
                desc: "Requires a 4.5:1 ratio for regular text (under 18pt) and a 3.0:1 ratio for large/bold text (18pt+ or 14pt bold).",
              },
              {
                title: "AAA Level (Enhanced)",
                desc: "Requires a strict 7.0:1 ratio for normal text and 4.5:1 for large text. Essential for high readability standards.",
              },
              {
                title: "UI Components & Icons",
                desc: "Active user interface elements, borders, and graphical indicators must meet at least a 3.0:1 contrast ratio.",
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
              <h3 className="text-sm font-bold text-slate-900 mb-1">How is the contrast ratio calculated?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contrast is measured by computing the relative luminance (perceived brightness) of both colors and calculating the formula (L1 + 0.05) / (L2 + 0.05), ranging from 1:1 (lowest) to 21:1 (pure black on pure white).
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Does this checker work offline?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! All color calculations run entirely inside your browser using mathematical formulas with 0 network latency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
