"use client";

import { useState, useRef } from "react";
import { convertAudioToMp3, getAudioDuration, formatFileSize, formatDuration } from "@/lib/audio-file-utils";
import { Music, Download, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function WavToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setStatus("idle");
    setResultBlob(null);
    try {
      const dur = await getAudioDuration(f);
      setDuration(dur);
    } catch { setDuration(0); }
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus("converting");
    setError("");
    try {
      const blob = await convertAudioToMp3(file);
      setResultBlob(blob);
      setStatus("done");
    } catch (e: any) {
      setError(e?.message || "Conversion failed. Make sure the file is a valid audio file.");
      setStatus("error");
    }
  };

  const getOutputExt = () => {
    if (!resultBlob) return "webm";
    if (resultBlob.type.includes("ogg")) return "ogg";
    return "webm";
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(/\.[^.]+$/, "")}_converted.${getOutputExt()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savings = file && resultBlob ? Math.max(0, Math.round((1 - resultBlob.size / file.size) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Format Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-center gap-4 text-sm font-semibold">
        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl font-mono">WAV</span>
        <ArrowRight className="w-5 h-5 text-indigo-400" />
        <span className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-xl font-mono">WebM / OGG</span>
        <span className="text-xs text-slate-500 ml-2">(Browser-native compressed audio)</span>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
      >
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <Music className="w-10 h-10 mx-auto text-indigo-300 group-hover:text-indigo-500 transition-colors mb-3" />
        {file ? (
          <div className="space-y-1">
            <p className="font-semibold text-indigo-800">{file.name}</p>
            <p className="text-sm text-slate-500">{formatFileSize(file.size)} · {formatDuration(duration)}</p>
          </div>
        ) : (
          <>
            <p className="font-semibold text-slate-700">Drop WAV, MP3, or OGG file here</p>
            <p className="text-sm text-slate-400 mt-1">Any audio format supported</p>
          </>
        )}
      </div>

      {file && (
        <button
          onClick={handleConvert}
          disabled={status === "converting"}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {status === "converting" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Converting (real-time playback)...</>
          ) : (
            <><Music className="w-4 h-4" /> Convert to Compressed Audio</>
          )}
        </button>
      )}

      {status === "converting" && (
        <div className="text-center text-xs text-slate-500 animate-pulse">
          ⏳ The browser plays the audio internally to encode it. This takes as long as the audio duration.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {status === "done" && resultBlob && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-4">
              <CheckCircle2 className="w-5 h-5" /> Conversion Complete
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Original Size", value: formatFileSize(file!.size) },
                { label: "Converted Size", value: formatFileSize(resultBlob.size) },
                { label: "Space Saved", value: `${savings}%` },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-emerald-100 rounded-xl p-3 text-center">
                  <p className={`text-lg font-bold ${s.label === "Space Saved" ? "text-emerald-600" : "text-slate-800"}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleDownload} className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Converted File (.{getOutputExt()})
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">ℹ️ About Browser Audio Conversion</p>
        <p>Modern browsers encode audio natively using the MediaRecorder API in WebM/Opus or OGG/Opus format — both have better quality-per-byte than MP3 and are supported by all modern browsers, YouTube, and Discord.</p>
      </div>
    </div>
  );
}
