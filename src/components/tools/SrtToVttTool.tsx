"use client";

import { useState } from "react";
import { srtToVtt, parseSrt } from "@/lib/subtitle-utils";
import { 
  Subtitles, 
  UploadCloud, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
This is a standard SubRip (.SRT) subtitle file.

2
00:00:05,250 --> 00:00:09,750
Notice the comma separator in the timestamps.

3
00:00:10,000 --> 00:00:14,000
Converting to WebVTT (.VTT) enables native HTML5 video player playback!`;

export default function SrtToVttTool() {
  const [rawText, setRawText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const cuesCount = rawText.trim() ? parseSrt(rawText).length : 0;
  const vttText = rawText.trim() ? srtToVtt(rawText) : "";

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
    if (!vttText) return;
    navigator.clipboard.writeText(vttText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!vttText) return;
    const blob = new Blob([vttText], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.vtt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Action Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept=".srt,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="h-4 w-4 text-emerald-600" />
            <span>Upload .SRT File</span>
          </label>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
            <span>SRT (Comma)</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-emerald-700">WebVTT (Period)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!rawText && (
            <button
              type="button"
              onClick={() => setRawText(SAMPLE_SRT)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>Load Sample</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!vttText}
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
                <span>Copy VTT</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!vttText}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-30 shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .VTT</span>
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

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-700">SubRip (.SRT) Source</span>
            <span className="text-[11px] text-slate-400">{cuesCount} cues</span>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your .SRT subtitles here..."
            className="w-full resize-y font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
          />
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/30 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 mb-3">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>WebVTT (.VTT) Ready</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">HTML5 Video Standard</span>
          </div>

          <div className="min-h-[200px] font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[300px]">
            {vttText || (
              <span className="text-slate-400 text-xs italic font-sans">
                Converted WebVTT subtitles with WEBVTT header will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
