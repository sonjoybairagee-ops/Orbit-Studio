"use client";

import { useState, useRef } from "react";
import { normalizeAudio, formatFileSize, formatDuration, getAudioDuration } from "@/lib/audio-file-utils";
import { Upload, Volume2, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AudioVolumeNormalizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [targetDb, setTargetDb] = useState(-1);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [result, setResult] = useState<{ blob: Blob; originalPeak: number; normalizedPeak: number; gainApplied: number } | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setStatus("idle");
    setResult(null);
    try {
      const dur = await getAudioDuration(f);
      setDuration(dur);
    } catch {
      setDuration(0);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus("analyzing");
    setError("");
    try {
      const res = await normalizeAudio(file, targetDb);
      setResult(res);
      setStatus("done");
    } catch (e: any) {
      setError(e?.message || "Failed to process audio.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `normalized_${file?.name?.replace(/\.[^.]+$/, "")}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const peakToDb = (peak: number) => peak > 0 ? (20 * Math.log10(peak)).toFixed(1) : "-∞";

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-violet-200 rounded-2xl p-10 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all group"
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <Volume2 className="w-10 h-10 mx-auto text-violet-300 group-hover:text-violet-500 transition-colors mb-3" />
        {file ? (
          <div className="space-y-1">
            <p className="font-semibold text-violet-800">{file.name}</p>
            <p className="text-sm text-slate-500">{formatFileSize(file.size)} · {formatDuration(duration)}</p>
          </div>
        ) : (
          <>
            <p className="font-semibold text-slate-700">Drop audio file here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">Supports MP3, WAV, OGG, AAC, FLAC</p>
          </>
        )}
      </div>

      {file && (
        <>
          {/* Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <label className="text-slate-700">Target Peak Level</label>
                <span className="text-violet-700 font-bold">{targetDb} dBFS</span>
              </div>
              <input
                type="range"
                min={-20}
                max={0}
                step={0.5}
                value={targetDb}
                onChange={(e) => setTargetDb(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>-20 dBFS (quiet)</span>
                <span>0 dBFS (max)</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5">
              💡 <strong>Recommended:</strong> -1 dBFS for broadcast-safe normalization. Use -3 dBFS for music mastering headroom.
            </div>
          </div>

          <button
            onClick={handleProcess}
            disabled={status === "analyzing"}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "analyzing" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Normalizing Audio...</>
            ) : (
              <><Volume2 className="w-4 h-4" /> Normalize Audio</>
            )}
          </button>
        </>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-4">
              <CheckCircle2 className="w-5 h-5" />
              Normalization Complete
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Original Peak", value: `${peakToDb(result.originalPeak)} dBFS` },
                { label: "Normalized Peak", value: `${peakToDb(result.normalizedPeak)} dBFS` },
                { label: "Gain Applied", value: `${(20 * Math.log10(result.gainApplied)).toFixed(2)} dB` },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Normalized WAV ({formatFileSize(result.blob.size)})
          </button>
        </div>
      )}
    </div>
  );
}
