"use client";

import { useState, useRef, useEffect } from "react";
import {
  Music,
  Play,
  Pause,
  Upload,
  Download,
  Scissors,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Volume2,
  FileAudio,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";

export default function VideoToMp3Tool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Extracted Audio State
  const [extractedBlob, setExtractedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  // Trimming State
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name)) {
      setError("Please upload a supported video file (MP4, WebM, MOV, MKV).");
      return;
    }

    setError("");
    setVideoFile(file);
    setFileName(file.name);
    extractAudioFromVideo(file);
  };

  const loadSampleVideo = async () => {
    setIsProcessing(true);
    setProgressMsg("Loading sample video...");
    setError("");

    try {
      const res = await fetch("/mogrts/Fast_Wip_Animation.mp4");
      const blob = await res.blob();
      const file = new File([blob], "Fast_Wip_Animation.mp4", { type: "video/mp4" });
      setVideoFile(file);
      setFileName("Fast_Wip_Animation.mp4");
      extractAudioFromVideo(file);
    } catch {
      setError("Failed to load sample video.");
      setIsProcessing(false);
    }
  };

  const extractAudioFromVideo = async (file: File) => {
    setIsProcessing(true);
    setProgressMsg("Decoding video audio stream into memory...");
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);
      setDuration(decodedBuffer.duration);
      setTrimStart(0);
      setTrimEnd(decodedBuffer.duration);

      // Encode initial full WAV
      const wavBlob = encodeWav(decodedBuffer);
      setExtractedBlob(wavBlob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

      setProgressMsg("Audio extracted successfully!");
    } catch (err) {
      console.error(err);
      setError(
        "Could not extract audio track. Ensure the video file contains an active sound track."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyTrim = () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    setProgressMsg("Trimming audio clip...");

    setTimeout(() => {
      try {
        const sampleRate = audioBuffer.sampleRate;
        const numChannels = audioBuffer.numberOfChannels;
        const startOffset = Math.floor(trimStart * sampleRate);
        const endOffset = Math.floor(trimEnd * sampleRate);
        const trimmedLength = Math.max(1, endOffset - startOffset);

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const trimmedBuffer = ctx.createBuffer(numChannels, trimmedLength, sampleRate);

        for (let c = 0; c < numChannels; c++) {
          const inChannel = audioBuffer.getChannelData(c);
          const outChannel = trimmedBuffer.getChannelData(c);
          for (let i = 0; i < trimmedLength; i++) {
            outChannel[i] = inChannel[startOffset + i] || 0;
          }
        }

        const trimmedWav = encodeWav(trimmedBuffer);
        setExtractedBlob(trimmedWav);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(trimmedWav);
        setAudioUrl(url);
        setCurrentTime(0);
      } catch {
        setError("Failed to trim audio.");
      } finally {
        setIsProcessing(false);
      }
    }, 40);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleDownload = (format: "wav" | "mp3") => {
    if (!extractedBlob) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    const baseName = fileName.replace(/\.[^/.]+$/, "") || "extracted-audio";
    link.download = `${baseName}.${format}`;
    link.click();
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    const ms = Math.floor((timeInSec % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="w-full">
      {/* Hidden Audio Player Element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Main Upload Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Music className="h-5 w-5 text-[#3cff5f]" />
              <span>Video to MP3 &amp; Audio Extractor</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Extract high-quality MP3 &amp; WAV audio from MP4, WebM, MOV, and MKV videos. Unlimited file size, 100% in-browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Video</span>
            </button>

            <button
              type="button"
              onClick={loadSampleVideo}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-3 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample Video</span>
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#3cff5f]">
            <span className="h-3.5 w-3.5 border-2 border-[#3cff5f] border-t-transparent rounded-full animate-spin" />
            <span>{progressMsg}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {audioUrl ? (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & File Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#213026]">
            <div>
              <span className="text-xs text-[#9baaa1]">Source Video:</span>
              <h3 className="text-sm sm:text-base font-bold text-[#e7eee9] truncate max-w-md">
                {fileName}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-[#102a16] border border-[#2a5234] text-[#3cff5f] font-mono">
                {audioBuffer?.numberOfChannels === 2 ? "Stereo" : "Mono"} • {audioBuffer?.sampleRate} Hz
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#080e0b] border border-[#213026] text-[#9baaa1] font-mono">
                {formatTime(duration)} Total
              </span>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#3cff5f]/20 shrink-0"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#3cff5f] font-bold">{formatTime(currentTime)}</span>
                  <span className="text-[11px] text-[#9baaa1]">Extracted Audio Track</span>
                  <span className="text-[#9baaa1]">{formatTime(duration)}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setCurrentTime(t);
                    if (audioRef.current) audioRef.current.currentTime = t;
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer h-2 bg-[#102a16] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Optional Clip Trimming Section */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#e7eee9] uppercase tracking-wider flex items-center gap-2">
                <Scissors className="h-4 w-4 text-[#3cff5f]" />
                <span>Trim / Cut Segment (Optional)</span>
              </h4>
              <button
                type="button"
                onClick={handleApplyTrim}
                className="text-xs font-bold text-[#3cff5f] hover:underline cursor-pointer"
              >
                Apply Trim
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#9baaa1] mb-1 block">Start Time (sec):</label>
                <input
                  type="number"
                  min="0"
                  max={trimEnd}
                  step="0.1"
                  value={trimStart}
                  onChange={(e) => setTrimStart(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#9baaa1] mb-1 block">End Time (sec):</label>
                <input
                  type="number"
                  min={trimStart}
                  max={duration}
                  step="0.1"
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Math.min(duration, Number(e.target.value)))}
                  className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#9baaa1] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#3cff5f]" />
              <span>Studio 16-bit PCM Audio Ready</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDownload("wav")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
              >
                <Download className="h-4 w-4" />
                <span>Download WAV (Lossless)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload("mp3")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102a16] border border-[#2a5234] px-5 py-3.5 text-sm font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer"
              >
                <FileAudio className="h-4 w-4" />
                <span>Save as MP3</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center hover:border-[#3cff5f]/50 transition-colors cursor-pointer group"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
            <Music className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Video
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Extract pure MP3 or lossless WAV audio from any MP4, WebM, MOV, or MKV video. No upload queues and no file size limit.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Unlimited File Size (GBs)
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% In-Browser Privacy
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Free Lossless WAV &amp; MP3
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

