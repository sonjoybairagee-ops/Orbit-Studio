"use client";

import { useState } from "react";
import { parseSrt, analyzeSubtitles, SubtitleCue, SubtitleAnalysisStats } from "@/lib/subtitle-utils";
import { 
  BarChart2, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Type, 
  Trash2 
} from "lucide-react";

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:01,500
This line is displayed for only half a second and has far too many characters to read comfortably!

2
00:00:02,000 --> 00:00:06,000
This is a perfectly timed subtitle with comfortable reading speed and reasonable line length.

3
00:00:07,000 --> 00:00:10,000
Here is an excessively long single line of dialogue that stretches all the way across the display screen and exceeds standard streaming limits.`;

export default function SubtitleCharacterCounterTool() {
  const [rawText, setRawText] = useState<string>("");

  const cues: SubtitleCue[] = rawText.trim() ? parseSrt(rawText) : [];
  const stats: SubtitleAnalysisStats = analyzeSubtitles(cues);

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

  return (
    <div className="w-full space-y-6">
      {/* Top action and file upload */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
          <input
            type="file"
            accept=".srt,.txt,.vtt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <UploadCloud className="h-4 w-4 text-indigo-600" />
          <span>Upload Subtitle File (.SRT)</span>
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

      {/* Metrics Cards */}
      {cues.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Total Cues</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.totalCues}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Total Words</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.totalWords}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
            <span className="text-xs font-semibold text-slate-500">Avg Duration</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.avgDurationSec}s</div>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-center">
            <span className="text-xs font-semibold text-indigo-700">Average CPS</span>
            <div className="text-2xl font-black text-indigo-900 mt-1">{stats.avgCps}</div>
            <span className="text-[10px] text-indigo-600 font-medium">Chars / Sec</span>
          </div>

          <div className={`rounded-2xl border p-4 text-center ${stats.fastCuesCount > 0 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
            <span className={`text-xs font-semibold ${stats.fastCuesCount > 0 ? "text-amber-800" : "text-slate-500"}`}>
              Too Fast (&gt;22 CPS)
            </span>
            <div className={`text-2xl font-black mt-1 ${stats.fastCuesCount > 0 ? "text-amber-900" : "text-slate-800"}`}>
              {stats.fastCuesCount}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 text-center ${stats.longLinesCount > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
            <span className={`text-xs font-semibold ${stats.longLinesCount > 0 ? "text-rose-800" : "text-slate-500"}`}>
              Lines &gt;42 chars
            </span>
            <div className={`text-2xl font-black mt-1 ${stats.longLinesCount > 0 ? "text-rose-900" : "text-slate-800"}`}>
              {stats.longLinesCount}
            </div>
          </div>
        </div>
      )}

      {/* Editor & Flagged Cues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-700">Subtitle Content</span>
            <span className="text-[11px] text-slate-400">{cues.length} cues parsed</span>
          </div>

          <textarea
            rows={11}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your SRT subtitles to inspect characters per second (CPS) and reading speeds..."
            className="w-full resize-y font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* Audit Flagged Cues */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Flagged Readability Issues ({stats.problemCues.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Netflix & BBC Guidelines</span>
            </div>

            {stats.problemCues.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                {cues.length > 0 ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                    <span className="font-bold">All subtitle cues meet recommended readability standards!</span>
                  </div>
                ) : (
                  <span>Paste subtitles on the left to audit reading speeds and character lengths.</span>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {stats.problemCues.map((item) => (
                  <div
                    key={item.cueIndex}
                    className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1">
                      <span>Cue #{item.cueIndex} ({item.timeRange})</span>
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 text-amber-900">
                        {item.cps} CPS
                      </span>
                    </div>
                    <p className="font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 my-1">
                      {item.text}
                    </p>
                    <span className="text-[10px] text-red-600 font-medium">
                      ⚠️ {item.issue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
