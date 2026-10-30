import { Metadata } from "next";
import TipCalculatorTool from "@/components/tools/TipCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Tip Calculator — Free Restaurant Bill Splitter & Gratuity Calculator | ToolHub",
  description:
    "Calculate tips, split restaurant bills evenly with friends, round up to clean dollar amounts, and copy payment summaries for Venmo and WhatsApp.",
  keywords: [
    "tip calculator",
    "bill split calculator",
    "restaurant tip calculator",
    "calculate 18 percent tip",
    "calculate 20 percent tip",
    "split bill with friends",
    "gratuity calculator",
  ],
};

export default function TipCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Tip & Bill Split Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser restaurant tip calculator and group bill splitter with round-up options.",
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
            100% Free · Group Splitting · Clean Rounding
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tip Calculator & Bill Splitter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Calculate gratuity for dining, bars, and deliveries, split the total evenly among friends, and copy payment breakdowns with one click.
          </p>
        </div>

        <div className="mb-14">
          <TipCalculatorTool />
        </div>

        {/* Etiquette Guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Tipping Etiquette Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Pre-Tax vs. Post-Tax Tipping",
                formula: "Traditional etiquette: tip on pre-tax subtotal",
                desc: "While standard etiquette suggests tipping on food and beverage costs before sales tax, many diners find it simpler to tip on the final total.",
              },
              {
                title: "Large Parties & Automatic Gratuity",
                formula: "Check for auto-gratuity on parties of 6+",
                desc: "Many restaurants automatically add an 18% or 20% gratuity for larger parties. Always check your receipt so you don't accidentally double-tip.",
              },
              {
                title: "Clean Round-Up Feature",
                formula: "Round up total to avoid awkward coins",
                desc: "Rounding up your total bill or tip to the nearest whole dollar makes credit card transactions and split payments much cleaner.",
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
                q: "What is standard tipping in the United States?",
                a: "For sit-down restaurants, 15% is standard for acceptable service, 18% to 20% is customary for great service, and 22%+ is common for exceptional dining experiences.",
              },
              {
                q: "How does the Copy Split feature work?",
                a: "Click 'Copy Split' to copy a pre-formatted message listing the bill total, tip amount, and exact per-person share, making it easy to send to group chats or request on Venmo/Zelle.",
              },
              {
                q: "What does 'Round Up Total' do?",
                a: "It adjusts the tip slightly upward so that the final total bill ends in an even whole dollar amount (e.g., $43.27 becomes $44.00).",
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
