import { Metadata } from "next";
import CsvToJsonTool from "@/components/tools/CsvToJsonTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSV to JSON Converter — Free Online Table Parser | ToolHub",
  description:
    "Convert CSV files and tabular data to structured JSON arrays online for free. Custom delimiter support, automatic number parsing, live JSON viewer, copy and download.",
  keywords: ["csv to json", "convert csv to json", "csv to json online", "parse csv file", "csv to json array"],
};

export default function CsvToJsonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSV to JSON Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser CSV to JSON converter with delimiter autodetection.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60 mb-2">
            100% Free · Smart Type Parsing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSV to JSON Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Easily convert spreadsheet rows and CSV files into clean, readable JSON object arrays in seconds.
          </p>
        </div>

        <div className="mb-14">
          <CsvToJsonTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            How to Convert CSV to JSON
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Input CSV", body: "Upload your .csv file or paste tabular data directly into the input editor." },
              { step: 2, title: "Choose Options", body: "Select delimiter (comma, semicolon, tab, pipe) and enable automatic number/boolean conversion." },
              { step: 3, title: "Export JSON", body: "Preview the generated JSON with formatted indentation and click Copy or Download." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-teal-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "How are CSV headers handled?",
                a: "The first line of your CSV is automatically extracted as the object keys for each subsequent row in the JSON array.",
              },
              {
                q: "Does it support commas inside quotation marks?",
                a: "Yes! The parser properly supports quoted values containing commas and escaped double quotes according to standard RFC 4180.",
              },
              {
                q: "Can I convert large datasets?",
                a: "Yes! Since the parser operates in pure JavaScript directly in your browser, spreadsheets with thousands of rows parse in milliseconds.",
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
