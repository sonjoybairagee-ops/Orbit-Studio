"use client";

import { useState } from "react";
import { cleanExtraSpaces, CleanSpaceOptions } from "@/lib/text-utils";
import { 
  Minimize2, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square,
  ArrowDownRight 
} from "lucide-react";

const SAMPLE_TEXT = `   This is    an example text   with    unnecessary    spaces.

   
It has multiple     spaces, trailing spaces,     and


blank lines that need to be     cleaned.   `;

export default function RemoveExtraSpacesTool() {
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [options, setOptions] = useState<CleanSpaceOptions>({
    collapseSpaces: true,
    trimLines: true,
    removeBlankLines: true,
    stripTabs: true,
  });

  const cleanedText = cleanExtraSpaces(text, options);
  const originalChars = text.length;
  const cleanedChars = cleanedText.length;
  const savedChars = Math.max(0, originalChars - cleanedChars);

  const toggleOption = (key: keyof CleanSpaceOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    if (!cleanedText) return;
    navigator.clipboard.writeText(cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToInput = () => {
    setText(cleanedText);
  };

  return (
    <div className="w-full space-y-6">
      {/* Options Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 mb-3">
          Cleaning Rules & Options:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "collapseSpaces", label: "Collapse Multi-Spaces", desc: "Turn '    ' into ' '" },
            { key: "trimLines", label: "Trim Line Edges", desc: "Remove start & end spaces" },
            { key: "removeBlankLines", label: "Remove Empty Lines", desc: "Strip blank line breaks" },
            { key: "stripTabs", label: "Convert Tabs to Spaces", desc: "Normalize tab indentations" },
          ].map((item) => {
            const isChecked = options[item.key as keyof CleanSpaceOptions];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleOption(item.key as keyof CleanSpaceOptions)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  isChecked
                    ? "border-amber-400 bg-amber-50/50 text-amber-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text Input */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700">Original Text</span>
              <div className="flex items-center gap-2">
                {!text && (
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_TEXT)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Sample</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setText("")}
                  disabled={!text}
                  className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                  title="Clear"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text with excessive spaces, tabs, or blank lines here..."
              className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
            />
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
            {originalChars} Characters
          </div>
        </div>

        {/* Cleaned Result Preview */}
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/30 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900">Cleaned Result</span>
                {savedChars > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>-{savedChars} chars</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyToInput}
                  disabled={!cleanedText || text === cleanedText}
                  className="rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-30 transition-colors"
                >
                  Replace Input
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!cleanedText}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-amber-700 shadow-2xs disabled:opacity-30 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="min-h-[180px] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {cleanedText || <span className="text-slate-400 text-xs italic">Cleaned text will appear here automatically...</span>}
            </div>
          </div>

          <div className="mt-3 border-t border-amber-200/60 pt-3 text-xs text-amber-800 font-medium">
            {cleanedChars} Characters ({savedChars} characters removed)
          </div>
        </div>
      </div>
    </div>
  );
}
