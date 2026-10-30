"use client";

import { useState, useRef, useEffect } from "react";
import { trimAudio, formatFileSize, formatDuration, getAudioDuration } from "@/lib/audio-file-utils";
import { Scissors, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause } from "lucide-react";

export default function AudioTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [trimmedDuration, setTrimmedDuration] = useState(0);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string>("");

  const handleFile = async (f: File) => {
    setFile(f);
    setStatus("idle");
    setResultBlob(null);
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = URL.createObjectURL(f);
    if (audioRef.current) {
      audioRef.current.src = audioUrlRef.current;
      audioRef.current.load();
    }
    const dur = await getAudioDuration(f);
    setDuration(dur);
    setStartSec(0);
    setEndSec(Math.min(dur, dur));
  };

  useEffect(() => {
    return () => { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); };
  }, []);

  const handleTrim = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const res = await trimAudio(file, startSec, endSec);
      setResultBlob(res.blob);
      setTrimmedDuration(res.trimmedDuration);
      setStatus("done");
    } catch (e: any) {
      setError(e?.message || "Failed to trim audio.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trimmed_${file?.name?.replace(/\.[^.]+$/, "")}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.currentTime = startSec; audioRef.current.play(); setPlaying(true); }
  };

  const trimLength = endSec - startSec;

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-pink-200 rounded-2xl p-10 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-all group"
      >
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <Scissors className="w-10 h-10 mx-auto text-pink-300 group-hover:text-pink-500 transition-colors mb-3" />
        {file ? (
          <div className="space-y-1">
            <p className="font-semibold text-pink-800">{file.name}</p>
            <p className="text-sm text-slate-500">{formatFileSize(file.size)} · Total: {formatDuration(duration)}</p>
          </div>
        ) : (
          <>
            <p className="font-semibold text-slate-700">Drop audio file here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">Supports MP3, WAV, OGG, AAC, FLAC</p>
          </>
        )}
      </div>

      {file && duration > 0 && (
        <>
          {/* Waveform-style timeline */}
          <div className="bg-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={togglePlay} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "Pause" : "Preview"}
              </button>
              <span className="text-slate-400 text-xs font-mono">Duration: {formatDuration(duration)}</span>
            </div>

            {/* Start Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Start</span>
                <span className="text-pink-400 font-bold">{formatDuration(startSec)}</span>
              </div>
              <input
                type="range" min={0} max={duration} step={0.01} value={startSec}
                onChange={(e) => { const v = Number(e.target.value); setStartSec(Math.min(v, endSec - 0.1)); }}
                className="w-full accent-pink-500"
              />
            </div>

            {/* End Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>End</span>
                <span className="text-pink-400 font-bold">{formatDuration(endSec)}</span>
              </div>
              <input
                type="range" min={0} max={duration} step={0.01} value={endSec}
                onChange={(e) => { const v = Number(e.target.value); setEndSec(Math.max(v, startSec + 0.1)); }}
                className="w-full accent-pink-500"
              />
            </div>

            {/* Visual range bar */}
            <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                style={{ left: `${(startSec / duration) * 100}%`, width: `${(trimLength / duration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-400">
              <span>Trim length: <span className="text-white font-mono font-bold">{formatDuration(trimLength)}</span></span>
              <span>Cut: <span className="text-slate-300">{formatDuration(duration - trimLength)}</span></span>
            </div>
          </div>

          <button
            onClick={handleTrim}
            disabled={status === "processing" || trimLength <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {status === "processing" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Trimming...</>
            ) : (
              <><Scissors className="w-4 h-4" /> Trim & Export WAV</>
            )}
          </button>
        </>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {status === "done" && resultBlob && (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">Trim complete!</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Duration: {formatDuration(trimmedDuration)} · Size: {formatFileSize(resultBlob.size)}
              </p>
            </div>
          </div>
          <button onClick={handleDownload} className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Trimmed WAV
          </button>
        </div>
      )}
    </div>
  );
}
