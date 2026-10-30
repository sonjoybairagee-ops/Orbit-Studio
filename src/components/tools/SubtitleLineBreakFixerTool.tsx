"use client";

import { useState } from "react";
import { parseSrt, fixSubtitleLineBreaks, stringifySrt, SubtitleCue } from "@/lib/subtitle-utils";
import { 
  Type, 
  UploadCloud, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Sliders 
} from "lucide-react";

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,500
This is an extremely long subtitle line that easily exceeds standard broadcast and streaming limits for readability on mobile screens.

2
00:00:05,000 --> 00:00:08,200
Our intelligent subtitle line break fixer automatically balances dialogue into readable two-line subtitles!`;

export default function SubtitleLineBreakFixerTool() {
  const [rawText, setRawText] = useState<string>("");
  const [maxCpl, setMaxCpl] = useState<number>(42);
  const [copied, setCopied] = useState<boolean>(false);

  const cues: SubtitleCue[] = rawText.trim() ? parseSrt(rawText) : [];
  const fixedCues: SubtitleCue[] = cues.length > 0 ? fixSubtitleLineBreaks(cues, maxCpl) : [];
  const fixedSrt = fixedCues.length > 0 ? stringifySrt(fixedCues) : "";

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setRawText(e.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    if (!fixedSrt) return;
    navigator.clipboard.writeText(fixedSrt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!fixedSrt) return;
    const blob = new Blob([fixedSrt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rebalanced-subtitles-max${maxCpl}cpl.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Control Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept=".srt,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="h-4 w-4 text-sky-600" />
            <span>Upload .SRT File</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Max Chars Per Line:</span>
            <div className="flex items-center gap-1">
              {[37, 40, 42, 45].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMaxCpl(val)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                    maxCpl === val
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {val} {val === 42 ? "(Netflix Std)" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!rawText && (
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_SRT)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span>Load Sample</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!fixedSrt}
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
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!fixedSrt}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-30 shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .SRT</span>
          </button>

          {rawText && (
            <button
              type="button"
              onClick={() => setRawText("")}
              className="rounded-xl border border-slate-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors"
              title="Clear"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-700">Original Subtitles</span>
            <span className="text-[11px] text-slate-400">{cues.length} cues</span>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your SRT subtitle with unwieldy or overly long lines here..."
            className="w-full resize-y font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
          />
        </div>

        <div className="rounded-3xl border border-sky-200/80 bg-sky-50/30 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 mb-3">
            <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              <span>Rebalanced 2-Line Output</span>
            </span>
            <span className="text-[11px] font-bold text-sky-700">Max {maxCpl} CPL</span>
          </div>

          <div className="min-h-[200px] font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[300px]">
            {fixedSrt || (
              <span className="text-slate-400 text-xs italic font-sans">
                Subtitles with balanced line breaks will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
