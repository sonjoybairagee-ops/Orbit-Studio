import { Metadata } from "next";
import UnixTimestampConverterTool from "@/components/tools/UnixTimestampConverterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter — Free Epoch Time & Date Converter | ToolHub",
  description:
    "Convert Unix timestamps (seconds, milliseconds) to human-readable dates (UTC, local, ISO 8601) and convert dates to timestamps with a live ticking epoch clock.",
  keywords: [
    "unix timestamp converter",
    "epoch converter",
    "timestamp to date",
    "date to unix timestamp",
    "current unix timestamp",
    "epoch time now",
    "convert epoch to gmt",
  ],
};

export default function UnixTimestampConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Unix Timestamp Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser Unix timestamp and Epoch date converter with live ticking clock and quick math offsets.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            100% Free · Live Ticking Epoch · Subsecond Precision
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Unix Timestamp Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert Unix epoch timestamps to UTC, local times, and ISO 8601 strings, or convert calendar dates back into seconds and milliseconds.
          </p>
        </div>

        <div className="mb-14">
          <UnixTimestampConverterTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            Understanding the Unix Epoch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "What is the Unix Epoch?",
                formula: "Starts: Jan 1, 1970 00:00:00 UTC",
                desc: "Unix time measures the total number of seconds that have elapsed since the Unix Epoch (midnight UTC on January 1, 1970), ignoring leap seconds.",
              },
              {
                title: "Seconds vs. Milliseconds",
                formula: "10 Digits (Sec) vs 13 Digits (Ms)",
                desc: "Backend databases like MySQL and PostgreSQL often store 10-digit seconds, while JavaScript (Date.now()) utilizes 13-digit milliseconds.",
              },
              {
                title: "The Year 2038 Problem",
                formula: "Overflow: Jan 19, 2038 at 03:14:07 UTC",
                desc: "Systems using signed 32-bit integers will overflow when reaching 2,147,483,647 seconds. Modern 64-bit systems are immune for billions of years.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-amber-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "How does the tool distinguish seconds from milliseconds?",
                a: "If you enter a number with 10 digits or fewer, the tool automatically interprets it as seconds. If it has 11 to 13 digits, it is treated as milliseconds.",
              },
              {
                q: "Can I convert timestamps into different timezones?",
                a: "Yes! The tool automatically outputs both standard GMT/UTC time and your local browser timezone, along with the full ISO 8601 timestamp.",
              },
              {
                q: "What does the Quick Offsets bar do?",
                a: "The Quick Offsets bar allows you to quickly add or subtract standard intervals (+1 Hour, +1 Day, +1 Week, +30 Days) to test token expirations, cache TTLs, or scheduling logic.",
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
