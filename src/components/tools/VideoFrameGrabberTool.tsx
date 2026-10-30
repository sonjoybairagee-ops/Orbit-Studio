"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Play,
  Pause,
  Upload,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  AlertCircle,
  Trash2,
  Film,
} from "lucide-react";

interface CapturedFrame {
  id: string;
  dataUrl: string;
  blob: Blob;
  timeSec: number;
  width: number;
  height: number;
}

export default function VideoFrameGrabberTool() {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [fps, setFps] = useState<number>(30);
  const [copiedId, setCopiedId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name)) {
      setError("Please select a supported video file (MP4, WebM, MOV, MKV).");
      return;
    }

    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setFileName(file.name);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const loadSampleVideo = () => {
    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    setVideoSrc("/mogrts/Fast_Wip_Animation.mp4");
    setFileName("Fast_Wip_Animation.mp4");
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const stepFrames = (framesCount: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);

    const frameDuration = 1 / fps;
    const nextTime = Math.max(0, Math.min(video.duration, video.currentTime + framesCount * frameDuration));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const stepSeconds = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);

    const nextTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const captureCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const dataUrl = canvas.toDataURL("image/png");
        const newFrame: CapturedFrame = {
          id: Math.random().toString(36).substring(2, 9),
          dataUrl,
          blob,
          timeSec: video.currentTime,
          width: video.videoWidth,
          height: video.videoHeight,
        };
        setCapturedFrames((prev) => [newFrame, ...prev]);
      },
      "image/png",
      1.0
    );
  }, []);

  const copyToClipboard = async (frame: CapturedFrame) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": frame.blob,
        }),
      ]);
      setCopiedId(frame.id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch {
      // Fallback
      setError("Clipboard access denied. Please use Download button.");
    }
  };

  const downloadFrame = (frame: CapturedFrame) => {
    const link = document.createElement("a");
    link.href = frame.dataUrl;
    const timeFormatted = frame.timeSec.toFixed(2).replace(".", "_");
    link.download = `frame-${fileName.replace(/\.[^/.]+$/, "")}-${timeFormatted}s-${frame.width}x${frame.height}.png`;
    link.click();
  };

  const deleteFrame = (id: string) => {
    setCapturedFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    const ms = Math.floor((timeInSec % 1) * 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Upload and Sample Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#3cff5f]" />
              <span>4K Ultra-HD Video Frame Grabber</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Extract exact full-resolution 4K or 1080p PNG frames from any video for YouTube thumbnails with zero compression.
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

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {videoSrc ? (
        <div className="space-y-6">
          {/* Main Video Viewport & Player Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
            {/* Resolution & Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#213026]">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#e7eee9] truncate max-w-xs">{fileName}</span>
                {videoDimensions.w > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[#102a16] border border-[#2a5234] text-[#3cff5f] font-mono text-[11px]">
                    {videoDimensions.w} × {videoDimensions.h} ({videoDimensions.w >= 3840 ? "4K UHD" : videoDimensions.w >= 1920 ? "1080p FHD" : "SD"})
                  </span>
                )}
              </div>

              {/* Framerate Selection */}
              <div className="flex items-center gap-2 text-xs text-[#9baaa1]">
                <span>Frame Rate:</span>
                <div className="inline-flex rounded-xl bg-[#080e0b] border border-[#213026] p-0.5">
                  {[24, 25, 30, 60].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFps(rate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        fps === rate ? "bg-[#3cff5f] text-[#050a08]" : "text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-video max-h-[500px] w-full rounded-2xl overflow-hidden bg-black mt-6 border border-[#213026] flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrc}
                preload="auto"
                playsInline
                muted
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    setVideoDimensions({
                      w: videoRef.current.videoWidth,
                      h: videoRef.current.videoHeight,
                    });
                    videoRef.current.currentTime = 0.05;
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Precision Timeline & Stepper Controls */}
            <div className="mt-6 space-y-4">
              {/* Scrubber Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#3cff5f] font-bold">{formatTime(currentTime)}</span>
                  <span className="text-[11px] text-[#9baaa1]">
                    Frame #{Math.round(currentTime * fps)}
                  </span>
                  <span className="text-[#9baaa1]">{formatTime(duration)}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step={1 / fps}
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setCurrentTime(t);
                    if (videoRef.current) videoRef.current.currentTime = t;
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer h-2 bg-[#102a16] rounded-lg"
                />
              </div>

              {/* Stepper Buttons & Capture Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepSeconds(-5)}
                    className="px-2.5 py-2 rounded-xl bg-[#080e0b] border border-[#213026] text-xs font-semibold text-[#9baaa1] hover:text-[#e7eee9] hover:bg-[#101813] cursor-pointer"
                  >
                    -5s
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSeconds(-1)}
                    className="px-2.5 py-2 rounded-xl bg-[#080e0b] border border-[#213026] text-xs font-semibold text-[#9baaa1] hover:text-[#e7eee9] hover:bg-[#101813] cursor-pointer"
                  >
                    -1s
                  </button>

                  <button
                    type="button"
                    onClick={() => stepFrames(-1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                    title="Previous 1 Frame"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>-1 Frame</span>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#3cff5f]/20 shrink-0 mx-1"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => stepFrames(1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                    title="Next 1 Frame"
                  >
                    <span>+1 Frame</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => stepSeconds(1)}
                    className="px-2.5 py-2 rounded-xl bg-[#080e0b] border border-[#213026] text-xs font-semibold text-[#9baaa1] hover:text-[#e7eee9] hover:bg-[#101813] cursor-pointer"
                  >
                    +1s
                  </button>
                  <button
                    type="button"
                    onClick={() => stepSeconds(5)}
                    className="px-2.5 py-2 rounded-xl bg-[#080e0b] border border-[#213026] text-xs font-semibold text-[#9baaa1] hover:text-[#e7eee9] hover:bg-[#101813] cursor-pointer"
                  >
                    +5s
                  </button>
                </div>

                {/* Main Capture Frame Button */}
                <button
                  type="button"
                  onClick={captureCurrentFrame}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture Full-Res Frame</span>
                </button>
              </div>
            </div>
          </div>

          {/* Captured Frames Gallery */}
          {capturedFrames.length > 0 && (
            <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#213026] mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                    <Film className="h-4 w-4 text-[#3cff5f]" />
                    <span>Captured Frames ({capturedFrames.length})</span>
                  </h3>
                  <p className="text-xs text-[#9baaa1] mt-0.5">
                    Full uncompressed PNG captures ready for thumbnail design.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCapturedFrames([])}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {capturedFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className="group rounded-2xl border border-[#213026] bg-[#080e0b] overflow-hidden flex flex-col hover:border-[#3cff5f]/50 transition-all shadow-lg"
                  >
                    <div className="relative aspect-video w-full bg-black">
                      <Image
                        src={frame.dataUrl}
                        alt="Captured frame"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        className="object-contain"
                        unoptimized
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[10px] text-[#3cff5f]">
                        {formatTime(frame.timeSec)}
                      </span>
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 font-mono text-[10px] text-[#9baaa1]">
                        {frame.width}×{frame.height}
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between gap-2 border-t border-[#213026]">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(frame)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-[#102a16] text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] cursor-pointer transition-colors"
                      >
                        {copiedId === frame.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
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
                        onClick={() => downloadFrame(frame)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] cursor-pointer transition-colors shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFrame(frame.id)}
                        className="p-2 rounded-xl text-[#9baaa1] hover:text-red-400 hover:bg-red-950/20 cursor-pointer transition-colors"
                        title="Delete Frame"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center hover:border-[#3cff5f]/50 transition-colors cursor-pointer group"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
            <Camera className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Video
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Upload MP4, WebM, MOV, or MKV videos of any resolution (1080p, 4K, 8K). Extract crisp original resolution frames without compression artifacts.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <Film className="h-4 w-4" /> Frame-by-Frame Precision Stepping
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-4 w-4" /> Original 4K/1080p Resolution
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> 100% Free &amp; Unlimited
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

