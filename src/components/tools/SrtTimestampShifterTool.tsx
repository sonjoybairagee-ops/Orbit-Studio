"use client";

import { useState } from "react";
import { parseSrt, shiftSrtTimestamps, stringifySrt, SubtitleCue } from "@/lib/subtitle-utils";
import { 
  Repeat, 
  UploadCloud, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Plus,
  Minus 
} from "lucide-react";

const SAMPLE_SRT = `1
00:00:02,000 --> 00:00:05,000
The video audio is delayed by 1.5 seconds.

2
00:00:06,000 --> 00:00:09,500
Use the timestamp shifter to synchronize all subtitle cues.`;

export default function SrtTimestampShifterTool() {
  const [rawText, setRawText] = useState<string>("");
  const [offsetSec, setOffsetSec] = useState<number>(1.5);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [copied, setCopied] = useState<boolean>(false);

  const cues: SubtitleCue[] = rawText.trim() ? parseSrt(rawText) : [];
  const totalOffsetMs = (direction === "forward" ? 1 : -1) * Math.round(offsetSec * 1000);
  const shiftedCues: SubtitleCue[] = cues.length > 0 ? shiftSrtTimestamps(cues, totalOffsetMs) : [];
  const shiftedSrt = shiftedCues.length > 0 ? stringifySrt(shiftedCues) : "";

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

  const applyQuickOffset = (sec: number) => {
    if (sec >= 0) {
      setDirection("forward");
      setOffsetSec(sec);
    } else {
      setDirection("backward");
      setOffsetSec(Math.abs(sec));
    }
  };

  const handleCopy = () => {
    if (!shiftedSrt) return;
    navigator.clipboard.writeText(shiftedSrt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!shiftedSrt) return;
    const blob = new Blob([shiftedSrt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shifted-${direction === "forward" ? "plus" : "minus"}${offsetSec}s.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Shift Controller Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept=".srt,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="h-4 w-4 text-cyan-600" />
            <span>Upload .SRT File</span>
          </label>

          <div className="flex items-center gap-2">
            {!rawText && (
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_SRT)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Load Sample</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={!shiftedSrt}
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
              disabled={!shiftedSrt}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-30 shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Shifted .SRT</span>
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

        {/* Shifting Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Shift Direction:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("forward")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  direction === "forward"
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Plus className="h-3.5 w-3.5 text-cyan-600" />
                <span>Shift Forward (Delay)</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection("backward")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  direction === "backward"
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Minus className="h-3.5 w-3.5 text-cyan-600" />
                <span>Shift Backward (Earlier)</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Offset Duration:</span>
              <span className="font-mono text-xs font-bold text-cyan-700">
                {direction === "forward" ? "+" : "-"}{offsetSec} seconds ({totalOffsetMs} ms)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0.05"
                value={offsetSec}
                onChange={(e) => setOffsetSec(Math.max(0.01, Number(e.target.value)))}
                className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20"
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                {[0.5, 1.0, 2.0, -0.5, -1.0, -2.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => applyQuickOffset(val)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {val > 0 ? `+${val}s` : `${val}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
            placeholder="Paste your original SRT subtitle file here..."
            className="w-full resize-y font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
          />
        </div>

        <div className="rounded-3xl border border-cyan-200/80 bg-cyan-50/30 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-200/60 mb-3">
            <span className="text-xs font-bold text-cyan-900">
              Shifted Result ({shiftedCues.length} cues)
            </span>
            <span className="text-[11px] font-bold text-cyan-700">
              Offset: {direction === "forward" ? "+" : "-"}{offsetSec}s
            </span>
          </div>

          <div className="min-h-[200px] font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[300px]">
            {shiftedSrt || (
              <span className="text-slate-400 text-xs italic font-sans">
                Shifted subtitle cues with recalculated timecodes will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
