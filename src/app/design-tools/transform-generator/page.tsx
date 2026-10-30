import { Metadata } from "next";
import TransformGeneratorTool from "@/components/tools/TransformGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Transform Generator — 2D & 3D Rotate, Scale, Skew & Perspective | ToolHub",
  description:
    "Interactive CSS 2D and 3D transform generator. Adjust rotate, scale, translate, skew, transform-origin, and 3D perspective with instant CSS code export.",
  keywords: ["css transform generator", "css 3d transform", "css rotate scale skew", "css transform origin", "interactive transform playground"],
};

export default function TransformGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSS Transform Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual 2D and 3D CSS transform generator with rotate, scale, skew, perspective, and transform-origin controls.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            2D & 3D Interactive Playground
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Transform Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Visually manipulate rotate, scale, translate, skew, and perspective in three dimensions with real-time CSS generation.
          </p>
        </div>

        <div className="mb-14">
          <TransformGeneratorTool />
        </div>

        {/* Transform Features */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            CSS Transform Cheat Sheet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Perspective & 3D Space",
                desc: "The perspective property creates depth by placing the viewer at a specified distance from the Z-plane, turning flat layers into isometric 3D scenes.",
              },
              {
                title: "Transform Origin",
                desc: "Determines the anchor point around which rotations and scales occur. Shifting origin from center to corner changes movement dynamics entirely.",
              },
              {
                title: "GPU Hardware Acceleration",
                desc: "CSS transforms are calculated directly on the graphics card (GPU), ensuring silky-smooth 60fps/120fps animations without repainting the DOM.",
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
              <h3 className="text-sm font-bold text-slate-900 mb-1">Does transform order matter in CSS?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! CSS transform functions are applied from right to left in the declaration order. Rotating before translating produces a completely different result than translating then rotating.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">How do I make the transform animate smoothly?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add `transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);` to your CSS element. Hovering or toggling classes will then transition smoothly between states.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
