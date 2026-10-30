"use client";

import { useState, useEffect } from "react";
import { diffWords, diffLines, Change } from "diff";
import { 
  Layers, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeftRight 
} from "lucide-react";

const SAMPLE_ORIGINAL = `React is a JavaScript library for building user interfaces.
It is maintained by Facebook and a community of developers.
React can be used to develop single-page applications.`;

const SAMPLE_MODIFIED = `React is an open-source JavaScript library for building web user interfaces.
It is actively maintained by Meta and a large community of developers.
React is widely used to develop modern web and mobile applications.`;

export default function TextDiffCheckerTool() {
  const [originalText, setOriginalText] = useState<string>("");
  const [modifiedText, setModifiedText] = useState<string>("");
  const [diffMode, setDiffMode] = useState<"words" | "lines">("words");
  const [diffResult, setDiffResult] = useState<Change[]>([]);

  useEffect(() => {
    if (!originalText && !modifiedText) {
      setDiffResult([]);
      return;
    }
    const res =
      diffMode === "words"
        ? diffWords(originalText, modifiedText)
        : diffLines(originalText, modifiedText);
    setDiffResult(res);
  }, [originalText, modifiedText, diffMode]);

  const additions = diffResult.filter((c) => c.added).length;
  const deletions = diffResult.filter((c) => c.removed).length;

  const handleSample = () => {
    setOriginalText(SAMPLE_ORIGINAL);
    setModifiedText(SAMPLE_MODIFIED);
  };

  const handleClear = () => {
    setOriginalText("");
    setModifiedText("");
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls & Mode selection */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Diff Mode:</span>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setDiffMode("words")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                diffMode === "words"
                  ? "bg-white text-purple-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Word by Word
            </button>
            <button
              type="button"
              onClick={() => setDiffMode("lines")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                diffMode === "lines"
                  ? "bg-white text-purple-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Line by Line
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(!originalText && !modifiedText) && (
            <button
              type="button"
              onClick={handleSample}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Load Sample Diff</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSwap}
            disabled={!originalText && !modifiedText}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 shadow-2xs transition-colors"
            title="Swap Original and Modified"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!originalText && !modifiedText}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Two Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-700">Original Text</span>
            <span className="text-[11px] text-slate-400">{originalText.length} chars</span>
          </div>
          <textarea
            rows={7}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your original text here..."
            className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-purple-900">Modified / New Text</span>
            <span className="text-[11px] text-purple-400">{modifiedText.length} chars</span>
          </div>
          <textarea
            rows={7}
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste your updated or modified text here..."
            className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Difference Results Visualizer */}
      {(originalText || modifiedText) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <span>Visual Comparison Differences</span>
            </h4>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                <Plus className="h-3 w-3" />
                <span>{additions} Added</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                <Minus className="h-3 w-3" />
                <span>{deletions} Removed</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto min-h-[120px]">
            {diffResult.map((part, index) => {
              if (part.added) {
                return (
                  <span
                    key={index}
                    className="rounded bg-emerald-200/80 text-emerald-950 font-semibold px-1 py-0.5"
                  >
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="rounded bg-rose-200/80 text-rose-950 line-through px-1 py-0.5 opacity-80"
                  >
                    {part.value}
                  </span>
                );
              }
              return (
                <span key={index} className="text-slate-700">
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
