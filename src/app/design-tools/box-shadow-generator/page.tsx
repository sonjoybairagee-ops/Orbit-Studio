import { Metadata } from "next";
import BoxShadowGeneratorTool from "@/components/tools/BoxShadowGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Box Shadow Generator — Multi-Layer Elevation & Presets | ToolHub",
  description:
    "Design realistic multi-layer CSS box-shadows with blur, spread, offsets, inset shadows, and one-click Tailwind or CSS code export.",
  keywords: ["css box shadow generator", "smooth shadow generator", "tailwind shadow", "multi layer box shadow", "box-shadow css3"],
};

export default function BoxShadowGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Box Shadow Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual multi-layer CSS box shadow editor and generator with preset elevations.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            Multi-Layer Shadows · Modern Elevation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Box Shadow Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Stack multiple shadow layers with granular blur, spread, color opacity, and inset controls for smooth, hyper-realistic UI depth.
          </p>
        </div>

        <div className="mb-14">
          <BoxShadowGeneratorTool />
        </div>

        {/* Shadow Elevation Guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Creating Natural UI Shadows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Layer Stacking",
                desc: "Real light creates a sharp contact shadow right beneath the object and a larger, softer ambient shadow dispersed outward.",
              },
              {
                title: "Color Harmony",
                desc: "Instead of generic pure black (rgba(0,0,0,0.1)), tint your shadow with your page background or primary theme hue for a clean finish.",
              },
              {
                title: "Subtle Elevation",
                desc: "Keep blur radii proportional to the perceived height (Z-index). Higher cards have wider blur and softer opacities.",
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
              <h3 className="text-sm font-bold text-slate-900 mb-1">What is spread radius in CSS box-shadow?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spread radius expands or shrinks the size of the shadow before blur is applied. A positive value expands the shadow outward, while a negative value shrinks it behind the container.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">How can I paste this into Tailwind CSS?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can copy the generated `box-shadow` value directly into your `tailwind.config.js` under `extend.boxShadow` or use Tailwind's arbitrary value class: `shadow-[...]`.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
