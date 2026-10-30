import { Metadata } from "next";
import CsvViewerTool from "@/components/tools/CsvViewerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSV Viewer & Editor — Free Online Spreadsheet & Data Grid | ToolHub",
  description:
    "Open, inspect, sort, filter, and edit CSV and TSV files in a high-speed interactive data grid. Export to JSON, Clean CSV, or Markdown tables 100% in-browser.",
  keywords: [
    "csv viewer",
    "csv editor online",
    "tsv viewer",
    "view csv online",
    "csv to markdown table",
    "csv to json online",
    "open csv file browser",
  ],
};

export default function CsvViewerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSV Viewer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser interactive CSV and TSV spreadsheet grid with sorting, search, and Markdown export.",
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
            100% Free · Client-Side Grid · Zero Uploads
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSV & TSV Viewer & Table Editor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Open large comma-separated or tab-separated datasets, sort columns, filter rows with live search, and export as JSON or Markdown tables.
          </p>
        </div>

        <div className="mb-14">
          <CsvViewerTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Key Capabilities of ToolHub CSV Viewer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Sort & Filter Anywhere",
                formula: "Natural alphanumeric & numeric sorting",
                desc: "Click any column header to toggle ascending or descending sort. Search simultaneously across all rows and cells in real time.",
              },
              {
                title: "Multi-Delimiter Flexibility",
                formula: "Supports commas, tabs, semicolons & pipes",
                desc: "Easily switch delimiters between standard CSV (,), European CSV (;), TSV (\\t), or log files (|) without reloading.",
              },
              {
                title: "Instant Export Versatility",
                formula: "Export to CSV, JSON & Markdown",
                desc: "Convert spreadsheet rows directly into formatted JSON object arrays or copy ready-to-paste GitHub Markdown tables.",
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
                q: "Is my CSV data uploaded to any server?",
                a: "Never. Your file is read locally via the browser's FileReader API and parsed directly in memory on your device. It never leaves your machine.",
              },
              {
                q: "Can this tool handle TSV (Tab-Separated Values) files?",
                a: "Yes! Simply choose 'Tab (\\t)' in the Delimiter dropdown, or upload a .tsv file and it will automatically adjust.",
              },
              {
                q: "Does this parser support quoted values with commas inside them?",
                a: "Yes, standard RFC 4180 quotation rules are supported, so fields containing commas, line breaks, or double quotes parse correctly.",
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
