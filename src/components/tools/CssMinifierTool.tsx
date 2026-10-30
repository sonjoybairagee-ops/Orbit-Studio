"use client";

import { useState, useCallback } from "react";
import { minifyCss } from "@/lib/dev-utils";
import { Copy, Check, Download, Trash2 } from "lucide-react";

export default function CssMinifierTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = minifyCss(input);
  const hasOutput = !!result.minified.trim();

  const handleCopy = useCallback(async () => {
    if (!result.minified) return;
    await navigator.clipboard.writeText(result.minified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.minified]);

  const handleDownload = () => {
    if (!result.minified) return;
    const blob = new Blob([result.minified], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sample = `/* Navigation Styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Button Variants */
.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2563eb;
}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setInput(sample)}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-orange-600 border border-slate-200 rounded-lg hover:border-orange-300 transition-all"
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

      {/* Savings Banner */}
      {hasOutput && result.savedPercentage > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl shadow-md">
          <div className="text-3xl font-black">{result.savedPercentage}%</div>
          <div>
            <p className="font-bold text-sm">Size Reduction!</p>
            <p className="text-xs text-orange-100">
              {result.originalSize} → {result.minifiedSize} bytes
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Input CSS</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your CSS stylesheet here..."
            className="w-full h-80 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">Minified CSS</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!hasOutput}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!hasOutput}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 transition-all disabled:opacity-40"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
          <div className={`h-80 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre-wrap break-all ${
            hasOutput
              ? "bg-slate-900 text-orange-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {hasOutput
              ? result.minified
              : <span className="text-slate-400">Minified CSS will appear here...</span>}
          </div>
        </div>
      </div>

      {hasOutput && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Original Size", value: `${result.originalSize} B` },
            { label: "Minified Size", value: `${result.minifiedSize} B` },
            { label: "Bytes Saved", value: `${result.originalSize - result.minifiedSize} B` },
          ].map((s) => (
            <div key={s.label} className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-orange-700">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">What gets minified?</h3>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>All <code className="bg-white border border-slate-200 px-1 rounded">/* comments */</code> are removed</li>
          <li>Whitespace around <code className="bg-white border border-slate-200 px-1 rounded">{"{ } : ; , > ~ +"}</code> is stripped</li>
          <li>Trailing semicolons before <code className="bg-white border border-slate-200 px-1 rounded">{"}"}</code> are removed</li>
          <li>Multiple spaces collapsed to single space</li>
        </ul>
      </div>
    </div>
  );
}
