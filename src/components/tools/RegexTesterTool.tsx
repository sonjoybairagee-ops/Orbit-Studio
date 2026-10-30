"use client";

import { useState } from "react";
import { testRegex, RegexMatchItem } from "@/lib/dev-utils";
import { Trash2, AlertCircle } from "lucide-react";

const FLAG_OPTIONS = [
  { flag: "g", label: "g", title: "Global — find all matches" },
  { flag: "i", label: "i", title: "Insensitive — case-insensitive" },
  { flag: "m", label: "m", title: "Multiline — ^ and $ match line boundaries" },
  { flag: "s", label: "s", title: "Dotall — dot matches newline" },
];

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");

  const toggleFlag = (f: string) => {
    setFlags((prev) => {
      if (f === "g") return prev; // always keep global
      return prev.includes(f) ? prev.replace(f, "") : prev + f;
    });
  };

  const result = testRegex(pattern, flags, testStr);

  // Build highlighted HTML
  const buildHighlighted = () => {
    if (!result.isValid || result.matches.length === 0 || !testStr) return null;

    const parts: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;

    for (const match of result.matches) {
      if (match.index > lastIndex) {
        parts.push({ text: testStr.slice(lastIndex, match.index), highlight: false });
      }
      parts.push({ text: match.fullMatch, highlight: true });
      lastIndex = match.index + match.fullMatch.length;
    }

    if (lastIndex < testStr.length) {
      parts.push({ text: testStr.slice(lastIndex), highlight: false });
    }

    return parts;
  };

  const highlightedParts = buildHighlighted();

  const samples = [
    { label: "Email", pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", test: "Contact us at hello@example.com or support@test.org" },
    { label: "URL", pattern: "https?://[^\\s]+", test: "Visit https://example.com or http://test.io/path?q=1" },
    { label: "Phone", pattern: "\\+?\\d[\\d\\s\\-]{7,}", test: "Call +880 1234 567890 or 01700-000000" },
    { label: "IPv4", pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b", test: "Server at 192.168.1.1 and gateway 10.0.0.1" },
  ];

  return (
    <div className="space-y-6">
      {/* Pattern Input */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-rose-500">
            <span className="text-slate-400 font-mono text-lg">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter your regex pattern..."
              className="flex-1 bg-transparent font-mono text-sm text-rose-300 focus:outline-none placeholder:text-slate-500"
              spellCheck={false}
            />
            <span className="text-slate-400 font-mono text-lg">/</span>
            <span className="text-amber-400 font-mono text-sm">{flags}</span>
          </div>

          <button
            onClick={() => { setPattern(""); setTestStr(""); }}
            className="p-2 text-slate-400 hover:text-rose-500 border border-slate-200 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Flags:</span>
          {FLAG_OPTIONS.map(({ flag, label, title }) => (
            <button
              key={flag}
              title={title}
              onClick={() => toggleFlag(flag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                flags.includes(flag)
                  ? "bg-rose-100 border-rose-300 text-rose-700"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {!result.isValid && pattern && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {result.error}
        </div>
      )}

      {/* Sample Patterns */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 font-medium self-center">Quick patterns:</span>
        {samples.map((s) => (
          <button
            key={s.label}
            onClick={() => { setPattern(s.pattern); setTestStr(s.test); }}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 border border-slate-200 hover:border-rose-300 transition-all"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Test String */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-600">Test String</label>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          placeholder="Type or paste text to test your pattern against..."
          className="w-full h-36 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-500"
          spellCheck={false}
        />
      </div>

      {/* Match Highlights */}
      {testStr && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">Match Preview</label>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              result.matches.length > 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}>
              {result.matches.length} match{result.matches.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div className="font-mono text-sm p-4 bg-slate-900 rounded-2xl border border-slate-700 whitespace-pre-wrap break-words min-h-[80px] leading-relaxed">
            {highlightedParts ? (
              highlightedParts.map((part, i) =>
                part.highlight ? (
                  <mark key={i} className="bg-yellow-400/80 text-slate-900 rounded px-0.5">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i} className="text-slate-300">{part.text}</span>
                )
              )
            ) : (
              <span className="text-slate-400">Matches will be highlighted here...</span>
            )}
          </div>
        </div>
      )}

      {/* Match Details */}
      {result.matches.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Match Details</label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {result.matches.map((match, i) => (
              <div key={i} className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl p-3">
                <span className="flex-shrink-0 w-6 h-6 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-rose-800 font-semibold truncate">
                    &quot;{match.fullMatch}&quot;
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">at index {match.index}</p>
                  {match.groups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.groups.map((g, gi) => (
                        <span key={gi} className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                          Group {gi + 1}: &quot;{g ?? "undefined"}&quot;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
