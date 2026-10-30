"use client";

import { useState } from "react";
import { convertCase, CaseType, getWordStats } from "@/lib/text-utils";
import { 
  Repeat, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles 
} from "lucide-react";

const SAMPLE_TEXT = `hello world! this is a quick case conversion demonstration for iformat tools.`;

export default function CaseConverterTool() {
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const applyCase = (caseType: CaseType) => {
    if (!text) return;
    const converted = convertCase(text, caseType);
    setText(converted);
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = getWordStats(text);

  const caseButtons: Array<{ id: CaseType; label: string; example: string }> = [
    { id: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
    { id: "lower", label: "lowercase", example: "hello world" },
    { id: "title", label: "Title Case", example: "Hello World" },
    { id: "sentence", label: "Sentence case", example: "Hello world" },
    { id: "camel", label: "camelCase", example: "helloWorld" },
    { id: "pascal", label: "PascalCase", example: "HelloWorld" },
    { id: "snake", label: "snake_case", example: "hello_world" },
    { id: "kebab", label: "kebab-case", example: "hello-world" },
    { id: "alternating", label: "aLtErNaTiNg", example: "hElLo WoRlD" },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        {/* Case Action Buttons */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2.5">
            Click to Transform Text Case Instantly:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {caseButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => applyCase(btn.id)}
                disabled={!text}
                className="flex flex-col text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 disabled:opacity-40 transition-all"
              >
                <span className="text-xs font-bold text-slate-800">{btn.label}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {btn.example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between pb-3 mb-2">
            <span className="text-xs font-bold text-slate-700">Enter or Converted Text</span>
            <div className="flex items-center gap-2">
              {!text && (
                <button
                  type="button"
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Load Sample</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                disabled={!text}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 shadow-2xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setText("")}
                disabled={!text}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here, then choose a case format above..."
            className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
          />

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span>{stats.words} Words • {stats.characters} Characters</span>
            <span>Instant Conversion • 100% Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}
