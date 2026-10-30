import { Metadata } from "next";
import CssGradientGeneratorTool from "@/components/tools/CssGradientGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Gradient Generator — Linear & Radial CSS Maker | ToolHub",
  description:
    "Design beautiful linear and radial CSS gradients online. Multi-stop color slider, angle controls, curated presets, and instant CSS code output.",
  keywords: ["css gradient generator", "linear gradient css", "radial gradient generator", "css background gradient", "gradient maker online"],
};

export default function CssGradientGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Gradient Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual CSS gradient editor with multi-stop color pickers and presets.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200/60 mb-2">
            100% Free · Real-Time CSS Output
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Gradient Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Create ultra-smooth multi-stop linear and radial gradients with interactive sliders and copy clean CSS code.
          </p>
        </div>

        <div className="mb-14">
          <CssGradientGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            How to Build CSS Gradients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Choose Type", body: "Select Linear for directional transitions or Radial for circular, center-outward glow effects." },
              { step: 2, title: "Adjust Stops", body: "Click Add Stop to insert extra color transitions, choose custom hex colors, and drag stop positions from 0% to 100%." },
              { step: 3, title: "Copy Code", body: "Click Copy CSS Code to get cross-browser compliant background gradient declarations." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-purple-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Can I use these gradients in Tailwind CSS?",
                a: "Yes! You can paste the generated `linear-gradient(...)` function into `tailwind.config.js` or directly inside arbitrary values like `bg-[linear-gradient(90deg,#4f46e5,#06b6d4)]`.",
              },
              {
                q: "How many color stops can I add?",
                a: "You can add up to 6 custom color stops with precise percentage positioning.",
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
