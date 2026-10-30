"use client";

import { useState, useCallback } from "react";
import { processJson } from "@/lib/dev-utils";
import { Copy, Check, Download, AlertCircle, CheckCircle2, Trash2, Minimize2 } from "lucide-react";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = processJson(input, indent);
  const output = mode === "format" ? result.formatted ?? "" : result.minified ?? "";

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "format" ? "formatted.json" : "minified.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleJson = `{
  "name": "ToolHub",
  "version": "1.0.0",
  "tools": ["JSON Formatter", "Base64", "Regex Tester"],
  "meta": { "author": "ToolHub Team", "free": true }
}`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? "bg-white shadow text-blue-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "format" ? "Prettify" : "Minify"}
            </button>
          ))}
        </div>

        {mode === "format" && (
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  indent === n
                    ? "bg-white shadow text-blue-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {n} Spaces
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setInput(sampleJson)}
          className="ml-auto px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg hover:border-blue-300 transition-all"
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

      {/* Status Bar */}
      {input.trim() && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${
          result.isValid
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-rose-50 border-rose-200 text-rose-700"
        }`}>
          {result.isValid ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {result.isValid
            ? `✓ Valid JSON — ${result.byteSize} bytes`
            : `✗ Invalid JSON — ${result.error}`}
        </div>
      )}

      {/* Editor Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here, e.g. {"key": "value"}'
            className="w-full h-80 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
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
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 transition-all disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
          <div className={`h-80 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre-wrap ${
            result.isValid && output
              ? "bg-slate-900 text-emerald-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {output || <span className="text-slate-400">Output will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      {result.isValid && result.formatted && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Input Size", value: `${new Blob([input]).size} B` },
            { label: "Output Size", value: `${result.byteSize} B` },
            { label: "Mode", value: mode === "format" ? `${indent}-space indent` : "Minified" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
