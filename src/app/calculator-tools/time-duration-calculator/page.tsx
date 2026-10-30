import { Metadata } from "next";
import TimeDurationCalculatorTool from "@/components/tools/TimeDurationCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Time Duration Calculator — Clock Hours & Interval Math | ToolHub",
  description:
    "Calculate hours and minutes between two times, compute shift timesheets with break deductions, and add or subtract time durations online for free.",
  keywords: ["time duration calculator", "calculate hours worked", "timesheet calculator", "add time durations", "hours and minutes calculator"],
};

export default function TimeDurationCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Time Duration Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser timesheet and time duration calculator.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200/60 mb-2">
            100% Free · Timesheet & Payroll Ready
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Time Duration Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Compute total work hours, deduct unpaid break times, calculate payroll earnings, or add and subtract time intervals.
          </p>
        </div>

        <div className="mb-14">
          <TimeDurationCalculatorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-sky-600" />
            How to Calculate Work Hours & Timesheets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Clock Times", body: "Enter start time and end time. The calculator automatically handles overnight shifts passing midnight." },
              { step: 2, title: "Break & Rate", body: "Specify unpaid break minutes (e.g. 30 or 45 mins) and your hourly rate for instant pay calculation." },
              { step: 3, title: "Decimal Hours", body: "Copy standard hours/minutes or decimal hours (e.g. 8.25 hrs) directly into your billing invoice." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-sky-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What are decimal hours?",
                a: "Decimal hours convert minutes into a fraction of 60 (for example, 8 hours and 30 minutes = 8.50 hours). This is required by most payroll, freelancing, and billing software.",
              },
              {
                q: "How does the interval adder work?",
                a: "Switch to the 'Add & Subtract Time Durations' tab to sum up multiple log entries (e.g., 2h 45m + 1h 30m - 15m) without having to manually convert between units.",
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
