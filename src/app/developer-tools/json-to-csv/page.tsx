import { Metadata } from "next";
import JsonToCsvTool from "@/components/tools/JsonToCsvTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "JSON to CSV Converter — Free Online Tool | ToolHub",
  description:
    "Convert JSON arrays to downloadable CSV spreadsheets online for free. Automatic header extraction, handles nested objects. 100% private browser-based tool.",
  keywords: ["json to csv", "json converter", "convert json to spreadsheet", "json array to csv"],
};

export default function JsonToCsvPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub JSON to CSV Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Client-Side · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            JSON to CSV Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Transform JSON arrays into clean, spreadsheet-ready CSV files in one click. Headers are automatically extracted from JSON keys.
          </p>
        </div>

        <div className="mb-14">
          <JsonToCsvTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            How to Convert JSON to CSV
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Paste JSON Array", body: "Paste a JSON array (e.g. [{\"name\":\"Alice\", \"age\":30}]) into the input editor." },
              { step: 2, title: "Auto-Convert", body: "The tool instantly parses all keys as column headers and maps each object's values into rows." },
              { step: 3, title: "Download CSV", body: "Click 'Download CSV' to get a .csv file you can open in Excel, Google Sheets, or any spreadsheet app." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white mb-3">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-700" />
            Frequently Asked Questions
          </h2>
          {[
            { q: "Does my JSON need to be an array?", a: "The input should be a JSON array of objects (like API response data). A single object will also work and produce a single-row CSV." },
            { q: "What happens with nested objects?", a: "Nested objects are serialized as JSON strings inside the CSV cell. For deeply nested data, consider flattening your JSON first." },
            { q: "Is my data private?", a: "Yes. All conversion happens locally in your browser. No data is ever sent to any server." },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800">{item.q}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
