import { Metadata } from "next";
import LoanEmiCalculatorTool from "@/components/tools/LoanEmiCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Loan EMI Calculator — Free Mortgage, Auto & Home Loan Calculator | ToolHub",
  description:
    "Calculate monthly EMI payments, total loan interest, and amortization schedules for mortgages, auto loans, and personal loans with prepayment savings simulator.",
  keywords: [
    "loan emi calculator",
    "mortgage calculator",
    "car loan emi calculator",
    "home loan payment calculator",
    "amortization schedule calculator",
    "monthly loan payment",
    "loan interest calculator",
  ],
};

export default function LoanEmiCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Loan EMI Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser loan EMI and amortization schedule calculator with prepayment simulator.",
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
            100% Free · Interactive Sliders · Full Amortization Table
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loan EMI & Mortgage Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Calculate your exact monthly payments, total interest costs, and view year-by-year principal reduction schedules for any loan.
          </p>
        </div>

        <div className="mb-14">
          <LoanEmiCalculatorTool />
        </div>

        {/* EMI Formula Explained */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            How Loan EMI is Calculated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "The Standard EMI Formula",
                formula: "EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]",
                desc: "Where P = Principal Loan Amount, r = Monthly Interest Rate (Annual Rate / 12 / 100), and n = Total Tenure in Months.",
              },
              {
                title: "Principal vs. Interest Ratio",
                formula: "Interest is front-loaded in early years",
                desc: "During early loan years, the majority of each EMI covers accrued interest. As the loan matures, more of each payment goes toward the principal balance.",
              },
              {
                title: "The Power of Extra Prepayments",
                formula: "Extra payments reduce principal directly",
                desc: "Every additional dollar paid over the EMI directly reduces the loan principal, drastically cutting subsequent compound interest and shortening the payoff date.",
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
                q: "What types of loans can I calculate with this tool?",
                a: "You can use this calculator for Home Mortgages, Auto Loans, Personal Loans, Student Loans, and Business Term Loans using reducing-balance amortization.",
              },
              {
                q: "What is an amortization schedule?",
                a: "An amortization schedule is a complete table showing the breakdown of every payment into interest and principal, along with the remaining loan balance at each stage.",
              },
              {
                q: "Can I download my loan repayment schedule?",
                a: "Yes! Click the 'Export CSV' button above the schedule table to download the full year-by-year or month-by-month repayment schedule for your records.",
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
