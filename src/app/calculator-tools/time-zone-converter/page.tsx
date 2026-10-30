import { Metadata } from "next";
import TimeZoneConverterTool from "@/components/tools/TimeZoneConverterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Time Zone Converter — World Clock & Global Meeting Planner | ToolHub",
  description:
    "Convert time zones, compare world clock hours, and plan international meetings across New York, London, Tokyo, Paris, Sydney, Dubai, and more with working hours highlights.",
  keywords: [
    "time zone converter",
    "world clock converter",
    "meeting planner across time zones",
    "est to gmt converter",
    "utc converter",
    "pst to est time converter",
    "compare time zones",
  ],
};

export default function TimeZoneConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Time Zone Converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Interactive visual world time zone converter and global meeting scheduler.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · Real-Time World Clock · Overlap Finder
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Time Zone Converter & Meeting Planner
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Compare international cities side-by-side, scrub interactive hours, and find overlapping working hours for hassle-free scheduling.
          </p>
        </div>

        <div className="mb-14">
          <TimeZoneConverterTool />
        </div>

        {/* Meeting Planning Tips */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Tips for Scheduling Across Global Time Zones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "US East (EST) & Europe (GMT/CET)",
                formula: "Overlap: 8:00 AM - 12:00 PM EST",
                desc: "1:00 PM - 5:00 PM in London and 2:00 PM - 6:00 PM in Paris/Berlin. The ideal morning window for transatlantic teams.",
              },
              {
                title: "US West (PST) & Asia-Pacific",
                formula: "Overlap: 4:00 PM - 7:00 PM PST",
                desc: "Corresponds to 9:00 AM - 12:00 PM the following morning in Tokyo, Seoul, and Sydney.",
              },
              {
                title: "Europe & Asia (London - Singapore)",
                formula: "Overlap: 8:00 AM - 11:00 AM GMT",
                desc: "London early morning coincides with 4:00 PM - 7:00 PM end-of-day in Singapore and Hong Kong.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-blue-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
                q: "Does this tool automatically adjust for Daylight Saving Time (DST)?",
                a: "Yes! The tool utilizes the standardized IANA Time Zone Database supported natively by modern browsers, guaranteeing accurate local daylight saving adjustments for the chosen date.",
              },
              {
                q: "How do I share the converted meeting times with my team?",
                a: "Click the 'Copy Schedule' button in the top right. It copies a formatted text breakdown with city names, flags, local times, and dates ready to paste directly into Slack, Teams, or email.",
              },
              {
                q: "What do the colored badges (Green, Yellow, Purple) mean?",
                a: "Green indicates standard working hours (9:00 AM - 5:00 PM), yellow indicates awake leisure hours (7:00 - 9:00 AM and 5:00 - 10:00 PM), and purple indicates late night or sleeping hours (10:00 PM - 7:00 AM).",
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
