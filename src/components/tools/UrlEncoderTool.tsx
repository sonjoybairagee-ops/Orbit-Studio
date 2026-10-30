"use client";

import { useState, useCallback } from "react";
import { encodeUrl, decodeUrl } from "@/lib/dev-utils";
import { Copy, Check, Repeat, Trash2 } from "lucide-react";

export default function UrlEncoderTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [componentMode, setComponentMode] = useState(true);
  const [copied, setCopied] = useState(false);

  const output =
    mode === "encode"
      ? encodeUrl(input, componentMode)
      : decodeUrl(input);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleSwap = () => {
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  const sample =
    mode === "encode"
      ? "https://example.com/search?q=hello world&lang=en&tag=a+b"
      : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? "bg-white shadow text-purple-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setComponentMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                componentMode
                  ? "bg-white shadow text-purple-700"
                  : "text-slate-500"
              }`}
            >
              encodeURIComponent
            </button>
            <button
              onClick={() => setComponentMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                !componentMode
                  ? "bg-white shadow text-purple-700"
                  : "text-slate-500"
              }`}
            >
              encodeURI
            </button>
          </div>
        )}

        <button
          onClick={() => setInput(sample)}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-purple-600 border border-slate-200 rounded-lg hover:border-purple-300 transition-all"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">
            {mode === "encode" ? "Plain URL / Text" : "Percent-Encoded URL"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "https://example.com/search?q=hello world"
                : "https%3A%2F%2Fexample.com%2F"
            }
            className="w-full h-60 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">
              {mode === "encode" ? "Encoded URL" : "Decoded URL"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 transition-all"
              >
                <Repeat className="w-3 h-3" />
                Swap
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className={`h-60 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre-wrap break-all ${
            output
              ? "bg-slate-900 text-purple-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {output || <span className="text-slate-400">Output will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-purple-800 mb-1">encodeURIComponent</h3>
          <p className="text-xs text-purple-700">Encodes all characters except: <code className="bg-white px-1 rounded">A–Z a–z 0–9 - _ . ! ~ * &#x27; ( )</code>. Best for encoding query parameter values.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">encodeURI</h3>
          <p className="text-xs text-slate-700">Preserves URL structure characters like <code className="bg-white px-1 rounded">: / ? # [ ] @ ! $ & &#x27; ( ) * + , ; =</code>. Best for full URL encoding.</p>
        </div>
      </div>
    </div>
  );
}
