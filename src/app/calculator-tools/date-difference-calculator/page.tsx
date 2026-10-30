import { Metadata } from "next";
import DateDifferenceCalculatorTool from "@/components/tools/DateDifferenceCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Date Difference Calculator — Days Between Two Dates | ToolHub",
  description:
    "Calculate the exact duration and days between two dates online. Breakdown by years, months, weeks, days, working business days, and hours.",
  keywords: ["date difference calculator", "days between two dates", "business days calculator", "calculate age online", "workdays between dates"],
};

export default function DateDifferenceCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Date Difference Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser date duration and working day calculator.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · Business Days Included
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Date Difference Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Find the exact number of days, months, years, and business working days between any two calendar dates.
          </p>
        </div>

        <div className="mb-14">
          <DateDifferenceCalculatorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            How to Use the Date Calculator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Choose Start Date", body: "Select your starting calendar date or use quick presets like today." },
              { step: 2, title: "Choose End Date", body: "Pick the ending date or add 7, 30, 90, or 365 days with one click." },
              { step: 3, title: "Review Metrics", body: "View total days, business days (Mon-Fri), weekend days, and exact year/month breakdown." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What does the 'Include end date' option mean?",
                a: "If you are counting full event days (e.g., from Monday to Wednesday), including the end date counts 3 days (Mon, Tue, Wed). Excluding it counts the 2 elapsed days between them.",
              },
              {
                q: "How are working days calculated?",
                a: "Working days count every Monday through Friday between the two dates, filtering out Saturdays and Sundays.",
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
