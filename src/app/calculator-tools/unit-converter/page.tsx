import { Metadata } from "next";
import UnitConverterTool from "@/components/tools/UnitConverterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Unit Converter — Free Online Measurement & Metric Converter | ToolHub",
  description:
    "Convert between length, weight, mass, temperature, area, volume, speed, digital data, pressure, and energy units instantly with live conversions and formulas.",
  keywords: [
    "unit converter",
    "convert units online",
    "metric converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "feet to meters",
    "pounds to kilograms",
  ],
};

export default function UnitConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Unit Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser multi-category scientific and metric unit converter.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Free · 10+ Categories · Instant Precision
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Universal Unit Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert length, weight, temperature, volume, area, speed, time, digital bytes, and pressure instantly with full conversion tables.
          </p>
        </div>

        <div className="mb-14">
          <UnitConverterTool />
        </div>

        {/* How It Works & Common Conversions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Common Conversion Benchmarks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Length & Distance",
                formula: "1 meter = 3.28084 feet",
                desc: "1 km = 0.621371 miles · 1 inch = 2.54 cm · 1 yard = 3 feet",
              },
              {
                title: "Weight & Mass",
                formula: "1 kilogram = 2.20462 pounds",
                desc: "1 pound = 16 ounces · 1 metric ton = 1,000 kg · 1 stone = 14 lbs",
              },
              {
                title: "Temperature",
                formula: "°F = (°C × 9/5) + 32",
                desc: "0°C = 32°F (Freezing) · 100°C = 212°F (Boiling) · 37°C = 98.6°F (Body Temp)",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-emerald-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
                q: "How accurate are the conversions?",
                a: "Conversions use international standard definition factors (e.g., exactly 2.54 cm per inch) with floating point double-precision math.",
              },
              {
                q: "Does this tool work offline?",
                a: "Yes! All calculations are performed entirely in your browser using client-side JavaScript. No internet connection is needed once loaded.",
              },
              {
                q: "Can I convert digital data storage units?",
                a: "Yes, select 'Digital Data' to convert between Bits, Bytes, KB, MB, GB, TB, and binary kibibytes (KiB, MiB, GiB).",
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
