"use client";

import { useState, useRef } from "react";
import { encodeGifFromCanvases, formatFileSize } from "@/lib/audio-file-utils";
import { Film, Download, Loader2, Play, Pause, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VideoToGifTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(3);
  const [fps, setFps] = useState<number>(10);
  const [targetWidth, setTargetWidth] = useState<number>(360);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [gifUrl, setGifUrl] = useState<string>("");
  const [gifSize, setGifSize] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }
    setError("");
    setVideoFile(f);
    setStatus("idle");
    setGifUrl("");
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    setStartTime(0);
    setEndTime(Math.min(5, Math.floor(dur) || 3));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleGenerateGif = async () => {
    if (!videoRef.current || !videoFile) return;
    const video = videoRef.current;
    setStatus("processing");
    setError("");

    const clipDuration = Math.max(0.5, endTime - startTime);
    const totalFrames = Math.max(2, Math.floor(clipDuration * fps));
    const delayMs = Math.round(1000 / fps);

    // Calculate aspect-ratio-scaled dimensions
    const origW = video.videoWidth || 640;
    const origH = video.videoHeight || 360;
    const scale = targetWidth / origW;
    const w = Math.round(targetWidth);
    const h = Math.round(origH * scale);

    const frameList: { canvas: HTMLCanvasElement; delayMs: number }[] = [];

    try {
      for (let i = 0; i < totalFrames; i++) {
        const time = startTime + (i / totalFrames) * clipDuration;
        setProgressMsg(`Capturing frame ${i + 1} of ${totalFrames}...`);

        // Seek to timestamp
        await new Promise<void>((resolve) => {
          const seekHandler = () => {
            video.removeEventListener("seeked", seekHandler);
            resolve();
          };
          video.addEventListener("seeked", seekHandler);
          video.currentTime = Math.min(time, duration);
        });

        // Draw frame to canvas
        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = w;
        frameCanvas.height = h;
        const ctx = frameCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          frameList.push({ canvas: frameCanvas, delayMs });
        }
      }

      setProgressMsg("Encoding GIF frames...");
      await new Promise((r) => setTimeout(r, 60)); // Yield to paint UI

      const gifBlob = encodeGifFromCanvases(frameList, w, h);
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);
      setGifSize(gifBlob.size);
      setStatus("done");
      setProgressMsg("");
    } catch (err: any) {
      setError(err?.message || "Failed to convert video to GIF.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `${videoFile?.name?.replace(/\.[^.]+$/, "") || "clip"}.gif`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!videoFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select a video to convert to GIF</h3>
            <p className="text-sm text-slate-500 mt-1">MP4, WebM, MOV supported (processed entirely in your browser)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Editor & Controls */}
      {videoFile && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[240px] md:max-w-md">
                  {videoFile.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {formatFileSize(videoFile.size)} • {duration.toFixed(1)}s duration
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setVideoFile(null);
                setVideoUrl("");
                setGifUrl("");
                setStatus("idle");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
            >
              Change Video
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex justify-center max-h-[360px]">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={onLoadedMetadata}
              className="max-h-[360px] w-auto object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <button
              onClick={togglePlay}
              className="absolute bottom-4 left-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl">
            {/* Start Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Start Time: {startTime.toFixed(1)}s
              </label>
              <input
                type="range"
                min="0"
                max={Math.max(0, duration - 0.5)}
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStartTime(val);
                  if (val >= endTime) setEndTime(Math.min(duration, val + 1));
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-rose-600"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                End Time: {endTime.toFixed(1)}s (Clip: {(endTime - startTime).toFixed(1)}s)
              </label>
              <input
                type="range"
                min={startTime + 0.5}
                max={Math.min(duration, startTime + 15)}
                step="0.1"
                value={endTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEndTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-rose-600"
              />
            </div>

            {/* Frame Rate */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Frame Rate (FPS)</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-xs font-medium rounded-xl p-2 focus:outline-rose-500"
              >
                <option value={5}>5 FPS (Smallest file size)</option>
                <option value={8}>8 FPS (Standard web clip)</option>
                <option value={10}>10 FPS (Recommended balance)</option>
                <option value={15}>15 FPS (Smooth playback)</option>
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">GIF Width</label>
              <select
                value={targetWidth}
                onChange={(e) => setTargetWidth(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-xs font-medium rounded-xl p-2 focus:outline-rose-500"
              >
                <option value={240}>240px (Compact)</option>
                <option value={360}>360px (Standard / Medium)</option>
                <option value={480}>480px (High Quality)</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleGenerateGif}
              disabled={status === "processing"}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progressMsg || "Converting..."}
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Convert Video to GIF
                </>
              )}
            </button>

            {status === "processing" && (
              <span className="text-xs font-medium text-slate-500 animate-pulse">{progressMsg}</span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result GIF Display */}
          {status === "done" && gifUrl && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-rose-600" />
                  GIF Generated Successfully!
                </div>
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full">
                  {formatFileSize(gifSize)}
                </span>
              </div>

              {/* Loop preview */}
              <div className="flex justify-center bg-slate-900/5 rounded-xl p-4">
                <img
                  src={gifUrl}
                  alt="Converted GIF Animation"
                  className="rounded-lg shadow-sm max-h-[300px] object-contain"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download Animated GIF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
