"use client";

import { useState, useCallback } from "react";
import { encodeHtmlEntities, decodeHtmlEntities } from "@/lib/dev-utils";
import { Copy, Check, Repeat, Trash2 } from "lucide-react";

export default function HtmlEntityEncoderTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const output =
    mode === "encode" ? encodeHtmlEntities(input) : decodeHtmlEntities(input);

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
      ? '<a href="https://example.com">Hello & "World"</a>'
      : "&lt;a href=&quot;https://example.com&quot;&gt;Hello &amp; &quot;World&quot;&lt;/a&gt;";

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? "bg-white shadow text-amber-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => setInput(sample)}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-amber-600 border border-slate-200 rounded-lg hover:border-amber-300 transition-all"
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
            {mode === "encode" ? "Plain Text / HTML" : "Encoded HTML Entities"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? '<p>Hello & "World" <br/></p>'
                : "&lt;p&gt;Hello &amp; &quot;World&quot;&lt;/p&gt;"
            }
            className="w-full h-72 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">
              {mode === "encode" ? "HTML Entities Output" : "Decoded Plain Text"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                title="Swap input/output"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 transition-all"
              >
                <Repeat className="w-3 h-3" />
                Swap
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className={`h-72 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre-wrap ${
            output
              ? "bg-slate-900 text-amber-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {output || <span className="text-slate-400">Output will appear here...</span>}
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3">Common HTML Entities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { char: "<", entity: "&lt;" },
            { char: ">", entity: "&gt;" },
            { char: "&", entity: "&amp;" },
            { char: '"', entity: "&quot;" },
            { char: "'", entity: "&#39;" },
            { char: "©", entity: "&copy;" },
            { char: "®", entity: "&reg;" },
            { char: " ", entity: "&nbsp;" },
          ].map((item) => (
            <div key={item.entity} className="flex items-center gap-2 text-xs font-mono bg-white border border-amber-100 rounded-lg px-2 py-1.5">
              <span className="text-amber-700 font-bold">{item.char}</span>
              <span className="text-slate-400">→</span>
              <span className="text-slate-600">{item.entity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
