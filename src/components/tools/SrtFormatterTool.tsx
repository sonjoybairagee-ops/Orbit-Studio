"use client";

import { useState } from "react";
import { formatSrt, parseSrt } from "@/lib/subtitle-utils";
import { 
  FileText, 
  UploadCloud, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Sliders,
  CheckCircle2 
} from "lucide-react";

const SAMPLE_SRT = `1
0:0:1.500 --> 0:0:4.200
<i>Welcome to iformat.io</i> subtitle formatter!

4
00:00:05,000 --> 00:00:08,100
This broken SRT has non-consecutive indexes and irregular timecodes.

8
00:00:09.300 --> 00:00:12.800
Our tool fixes timestamps, cleans tags, and standardizes everything!`;

export default function SrtFormatterTool() {
  const [rawText, setRawText] = useState<string>("");
  const [removeHtml, setRemoveHtml] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedSrt = rawText.trim() ? formatSrt(rawText, { removeHtmlTags: removeHtml }) : "";
  const cuesCount = rawText.trim() ? parseSrt(rawText).length : 0;

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
    if (!formattedSrt) return;
    navigator.clipboard.writeText(formattedSrt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!formattedSrt) return;
    const blob = new Blob([formattedSrt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted-subtitles.srt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Options */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="file"
              accept=".srt,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <UploadCloud className="h-4 w-4 text-teal-600" />
            <span>Upload .SRT File</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={removeHtml}
              onChange={(e) => setRemoveHtml(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Strip HTML / Font Tags</span>
          </label>
        </div>

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
            disabled={!formattedSrt}
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
            disabled={!formattedSrt}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-30 shadow-2xs transition-colors"
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

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700">Raw / Original SRT</span>
              <span className="text-[11px] text-slate-400">Paste or drag file</span>
            </div>

            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw SRT subtitles with broken numbering or timecodes here..."
              className="w-full resize-y font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-teal-200/80 bg-teal-50/30 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-teal-200/60 mb-3">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>Standardized SRT Output ({cuesCount} Cues)</span>
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Repaired & Re-Indexed</span>
            </div>

            <div className="min-h-[240px] font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[350px]">
              {formattedSrt || (
                <span className="text-slate-400 text-xs italic font-sans">
                  Formatted, standard SubRip subtitle text will appear here automatically...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
