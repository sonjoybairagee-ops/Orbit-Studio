"use client";

import { useState, useCallback } from "react";
import { formatXml } from "@/lib/dev-utils";
import { Copy, Check, Download, Minimize2, Trash2, AlertCircle } from "lucide-react";

export default function XmlFormatterTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);

  const result = formatXml(input);
  const output = mode === "format" ? result.formatted : result.minified;

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "format" ? "formatted.xml" : "minified.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sample = `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price></book></catalog>`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? "bg-white shadow text-teal-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "format" ? "Prettify" : "Minify"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setInput(sample)}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-teal-600 border border-slate-200 rounded-lg hover:border-teal-300 transition-all"
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
          <label className="text-sm font-semibold text-slate-600">Input XML / SVG</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste XML or SVG here..."
            className="w-full h-80 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">Output</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-100 hover:text-teal-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-teal-100 hover:text-teal-700 text-slate-600 transition-all disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
          <div className={`h-80 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre ${
            output && !result.error
              ? "bg-slate-900 text-teal-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {output && !result.error
              ? output
              : <span className="text-slate-400">Formatted XML will appear here...</span>}
          </div>
        </div>
      </div>

      {output && !result.error && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Input Size", value: `${new Blob([input]).size} B` },
            { label: "Output Size", value: `${new Blob([output]).size} B` },
            { label: "Mode", value: mode === "format" ? "Prettified" : "Minified" },
          ].map((s) => (
            <div key={s.label} className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-teal-700">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
