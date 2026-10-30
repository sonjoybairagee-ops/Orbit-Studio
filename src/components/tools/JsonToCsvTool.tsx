"use client";

import { useState, useCallback } from "react";
import { jsonToCsv } from "@/lib/dev-utils";
import { Copy, Check, Download, AlertCircle, Trash2 } from "lucide-react";

export default function JsonToCsvTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = jsonToCsv(input);
  const hasOutput = !result.error && !!result.csv;

  const handleCopy = useCallback(async () => {
    if (!result.csv) return;
    await navigator.clipboard.writeText(result.csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.csv]);

  const handleDownload = () => {
    if (!result.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sample = `[
  {"name": "Alice", "age": 30, "city": "Dhaka"},
  {"name": "Bob", "age": 25, "city": "Chittagong"},
  {"name": "Carol", "age": 28, "city": "Sylhet"}
]`;

  const rowCount = result.csv ? result.csv.split("\n").length - 1 : 0;
  const colCount = result.csv ? result.csv.split("\n")[0]?.split(",").length ?? 0 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setInput(sample)}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-emerald-600 border border-slate-200 rounded-lg hover:border-emerald-300 transition-all"
        >
          Load Sample
        </button>
        <button
          onClick={() => setInput("")}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-300 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {result.error && input.trim() && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {result.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Input JSON Array</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste a JSON array: [{"col1":"val1", "col2":"val2"}]'
            className="w-full h-80 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">CSV Output</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!hasOutput}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!hasOutput}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-all disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Download CSV
              </button>
            </div>
          </div>
          <div className={`h-80 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre ${
            hasOutput
              ? "bg-slate-900 text-emerald-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {hasOutput ? result.csv : <span className="text-slate-400">CSV output will appear here...</span>}
          </div>
        </div>
      </div>

      {hasOutput && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rows", value: rowCount },
            { label: "Columns", value: colCount },
            { label: "CSV Size", value: `${new Blob([result.csv]).size} B` },
          ].map((s) => (
            <div key={s.label} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-emerald-700">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
