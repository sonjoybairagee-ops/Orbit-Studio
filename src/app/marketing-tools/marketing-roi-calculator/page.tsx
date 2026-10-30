import { Metadata } from "next";
import MarketingRoiCalculatorTool from "@/components/tools/MarketingRoiCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing ROI & ROAS Calculator — Calculate Ad Performance | ToolHub",
  description:
    "Calculate Marketing Return on Investment (ROI), Return on Ad Spend (ROAS), Customer Acquisition Cost (CAC), LTV:CAC ratios, CPC, and conversion rates.",
  keywords: [
    "marketing roi calculator",
    "roas calculator",
    "calculate return on ad spend",
    "cac ltv calculator",
    "cost per acquisition calculator",
    "ad campaign profitability",
    "digital marketing calculator",
  ],
};

export default function MarketingRoiCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Marketing ROI Calculator",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser Marketing ROI, ROAS, and CAC/LTV profitability calculator with real-time analytics.",
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
            100% Free · Real-Time ROAS &amp; LTV:CAC · Instant Break-even
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Marketing ROI &amp; ROAS Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Evaluate advertising campaign profitability, compute Return on Ad Spend (ROAS), determine Customer Acquisition Cost (CAC), and assess LTV ratios.
          </p>
        </div>

        <div className="mb-14">
          <MarketingRoiCalculatorTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Core Growth &amp; Ad Performance Formulas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "ROAS (Return on Ad Spend)",
                formula: "ROAS = Total Revenue / Direct Ad Spend",
                desc: "Measures gross revenue generated for every $1 spent on advertising. For example, $20,000 revenue on $5,000 ad spend = 4.0x ROAS (400%).",
              },
              {
                title: "Marketing ROI (%)",
                formula: "ROI = [(Revenue - Total Costs) / Total Costs] × 100",
                desc: "Unlike ROAS, ROI factors in agency fees, software subscriptions, creative production, and overhead for true net bottom-line profitability.",
              },
              {
                title: "LTV:CAC Ratio (Golden Rule)",
                formula: "Optimal Target: 3.0x to 5.0x",
                desc: "An LTV:CAC ratio of 3:1 means customers generate 3x what it costs to acquire them. A ratio below 1:1 indicates unprofitable acquisition.",
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
                q: "What is the difference between ROI and ROAS?",
                a: "ROAS measures gross revenue generated directly by ad spend, while ROI accounts for all campaign expenses (agency fees, product margins, software) to calculate actual net profit percentage.",
              },
              {
                q: "What is a good ROAS for ecommerce vs SaaS?",
                a: "For ecommerce with physical inventory costs, a 3.0x to 4.0x ROAS is typically needed to break even. For high-margin digital SaaS products, a 2.0x to 2.5x ROAS is often highly profitable.",
              },
              {
                q: "How is Customer Acquisition Cost (CAC) calculated?",
                a: "CAC is calculated by dividing total sales and marketing spend over a given period by the total number of new customers acquired during that same timeframe.",
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
