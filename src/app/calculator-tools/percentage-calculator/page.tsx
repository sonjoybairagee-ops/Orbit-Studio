import { Metadata } from "next";
import PercentageCalculatorTool from "@/components/tools/PercentageCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Percentage Calculator — Free Online Percent Math Tool | ToolHub",
  description:
    "Calculate percentages, percentage increases, percentage differences, discounts, and sales tax online for free with step-by-step formula breakdowns.",
  keywords: ["percentage calculator", "calculate percent online", "percentage increase calculator", "discount calculator", "sales tax calculator"],
};

export default function PercentageCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Percentage Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser multi-mode percentage calculator.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Free · Real-Time Calculation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Percentage Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Solve percentage problems instantly: find percentages of numbers, calculate percentage changes, and compute discounts and tax.
          </p>
        </div>

        <div className="mb-14">
          <PercentageCalculatorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Common Percentage Formulas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "What is P% of X?", formula: "Result = (P / 100) × X", desc: "Example: 15% of $250 = (15 / 100) × 250 = $37.50" },
              { title: "X is what % of Y?", formula: "Percentage = (X / Y) × 100", desc: "Example: 35 is what % of 140 = (35 / 140) × 100 = 25%" },
              { title: "Percentage Change", formula: "% Change = ((To - From) / From) × 100", desc: "Example: From 80 to 120 = ((120 - 80) / 80) × 100 = +50%" },
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
                q: "How do I calculate a discount?",
                a: "Use Card 4 (Discount & Tax Calculator): enter the original item price, select '-' (Off), and type the discount percentage (e.g. 20%). The tool outputs both your total savings and final checkout price.",
              },
              {
                q: "Can I use negative numbers or decimals?",
                a: "Yes! All inputs accept floating-point decimals and negative integers.",
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
