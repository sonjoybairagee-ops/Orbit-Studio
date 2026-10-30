import { Metadata } from "next";
import WorkHoursCalculatorTool from "@/components/tools/WorkHoursCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Work Hours Calculator — Free Timesheet & Overtime Pay Calculator | ToolHub",
  description:
    "Calculate weekly work hours, timesheet punches, unpaid lunch breaks, and gross earnings with daily or weekly overtime rules (1.5x, 2.0x). Export to CSV.",
  keywords: [
    "work hours calculator",
    "timesheet calculator",
    "time card calculator",
    "calculate payroll hours",
    "overtime pay calculator",
    "employee punch card calculator",
    "hours worked calculator",
  ],
};

export default function WorkHoursCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Work Hours & Timesheet Calculator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online timesheet calculator with breaks, overtime pay, and CSV export.",
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
            100% Free · Automatic Breaks · Overtime & CSV Export
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Work Hours & Timesheet Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Log shift start and end times, deduct unpaid breaks, compute overtime rates, and calculate total gross pay for employees and freelancers.
          </p>
        </div>

        <div className="mb-14">
          <WorkHoursCalculatorTool />
        </div>

        {/* Overtime Rules Guide */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Standard Overtime & Timesheet Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "US Federal Rule (FLSA)",
                formula: "Hours over 40 / week = 1.5× rate",
                desc: "Under the Fair Labor Standards Act, non-exempt employees receive time-and-a-half for all hours worked exceeding 40 in a standard workweek.",
              },
              {
                title: "California Daily Overtime",
                formula: "Hours over 8 / day = 1.5× rate",
                desc: "In states like California and Alaska, overtime is computed on a daily basis (1.5x after 8 hours, 2.0x after 12 hours).",
              },
              {
                title: "Unpaid Meal Deductions",
                formula: "Net Hours = Gross Shift - Break",
                desc: "Meal periods lasting 30 minutes or longer where the employee is relieved of all duties are typically unpaid.",
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
                q: "Can this calculator handle overnight shifts past midnight?",
                a: "Yes! If your end time is earlier than your start time (for example, starting at 10:00 PM and finishing at 6:30 AM), the calculator automatically recognizes that the shift crossed midnight into the next day.",
              },
              {
                q: "Can I export this timesheet for payroll or invoicing?",
                a: "Yes! Click the 'Export CSV' button to instantly download an Excel-ready CSV spreadsheet with your hours and wages.",
              },
              {
                q: "Is my payroll and wage data private?",
                a: "100% private. All calculations happen strictly in your local browser sandbox. None of your hours, rates, or wage info is ever sent to any remote server.",
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
