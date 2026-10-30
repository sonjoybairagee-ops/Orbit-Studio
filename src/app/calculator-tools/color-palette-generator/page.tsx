import { Metadata } from "next";
import ColorPaletteGeneratorTool from "@/components/tools/ColorPaletteGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Color Palette Generator — Create Beautiful Color Schemes | ToolHub",
  description:
    "Generate harmonious 5-color palettes online. Color locking, monochromatic, analogous, and triadic schemes. Export to CSS variables or JSON with one click.",
  keywords: ["color palette generator", "color scheme maker", "hex color palette", "css color variables", "random color generator"],
};

export default function ColorPaletteGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Color Palette Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser harmonious 5-color palette generator with lockable colors.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 border border-pink-200/60 mb-2">
            100% Free · Keyboard Friendly (Spacebar)
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Color Palette Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Explore and generate stunning color combinations for websites, brands, and UI designs. Press Spacebar to shuffle!
          </p>
        </div>

        <div className="mb-14">
          <ColorPaletteGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-pink-600" />
            Color Harmony Modes Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Analogous", desc: "Colors that sit next to each other on the color wheel. Creates serene, comfortable, and natural visual designs." },
              { title: "Monochromatic", desc: "Various shades, tints, and tones of a single key hue. Clean, minimal, and foolproof for corporate branding." },
              { title: "Triadic", desc: "Three evenly spaced colors on the color wheel. Delivers high contrast, playful vibrancy, and dynamic visual balance." },
            ].map((h, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{h.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-pink-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "How do I lock a color I like?",
                a: "Click the lock icon at the top of any color column. When you generate a new palette or press Spacebar, locked colors remain unchanged while other colors shuffle.",
              },
              {
                q: "How can I use the palette in my project?",
                a: "Click 'Copy CSS' in the top bar to get ready-to-paste CSS custom properties (`--color-1`, `--color-2`, etc.), or click 'Copy JSON' to import into Tailwind or Figma.",
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
