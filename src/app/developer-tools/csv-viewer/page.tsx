import { Metadata } from "next";
import CsvViewerTool from "@/components/tools/CsvViewerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSV Viewer & Editor — Free Online Spreadsheet & Data Grid | ToolHub",
  description:
    "Open, inspect, sort, filter, and edit CSV and TSV files in a high-speed interactive data grid. 1-click copy and export to Excel, JSON, Clean CSV, HTML, SQL or Markdown tables 100% in-browser.",
  alternates: {
    canonical: "/developer-tools/csv-viewer",
  },
  keywords: [
    "csv viewer",
    "csv editor online",
    "tsv viewer",
    "view csv online",
    "csv to excel",
    "csv to markdown table",
    "csv to json online",
    "open csv file browser",
  ],
};

export default function CsvViewerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub CSV Viewer & Data Grid Editor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser interactive CSV and TSV spreadsheet grid with inline editing, 1-click copy, and multi-format exports.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · Client-Side Grid · Zero Uploads · Interactive Editing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSV & TSV Viewer & Data Editor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Open comma-separated or tab-separated datasets, edit cells & headers inline, sort columns, filter rows with live search, and export to Excel, JSON, HTML, SQL, or Markdown tables.
          </p>
        </div>

        <div className="mb-14">
          <CsvViewerTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Key Capabilities of ToolHub CSV Engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Interactive In-Grid Editing",
                formula: "Double-click cells, add rows & cols",
                desc: "Edit cells and rename headers directly inside the table with double-click. Add or delete rows and columns with two-way sync to raw CSV text.",
              },
              {
                title: "1-Click Multi-Format Copy",
                formula: "Excel TSV, CSV, JSON, Markdown & HTML",
                desc: "Copy data in 1 click ready to paste into Microsoft Excel, Google Sheets, markdown documents, HTML pages, or database queries.",
              },
              {
                title: "Comprehensive Export Engine",
                formula: "8+ Export Formats Supported",
                desc: "Download as CSV, Excel-ready UTF-8 BOM CSV, TSV, JSON, standalone HTML table, Markdown, SQL INSERT scripts, or YAML.",
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
                q: "How do I copy data into Excel or Google Sheets?",
                a: "Click '1-Click Copy' and choose 'Excel / Sheets (TSV)'. Then press Ctrl+V (or Cmd+V) directly in Excel or Google Sheets — rows and columns will align perfectly.",
              },
              {
                q: "Can I edit cells and save my changes?",
                a: "Yes! Double-click any cell to type new data, or click 'Add Row' / 'Add Col'. Then click 'Export File' to download your edited CSV, Excel, or JSON dataset.",
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
