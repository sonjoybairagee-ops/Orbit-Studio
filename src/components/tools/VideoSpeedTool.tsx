"use client";

import { useState, useRef, useEffect } from "react";
import {
  FastForward,
  Play,
  Pause,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  CheckCircle2,
  Clock,
  Film,
  Zap,
} from "lucide-react";

const SPEED_PRESETS = [
  { label: "0.25x (Super Slow)", value: 0.25 },
  { label: "0.5x (Slow-Mo)", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "1.0x (Normal)", value: 1.0 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2.0x (Fast Forward)", value: 2.0 },
  { label: "3.0x (Time-Lapse)", value: 3.0 },
  { label: "4.0x (Hyperlapse)", value: 4.0 },
];

export default function VideoSpeedTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelExportRef = useRef<boolean>(false);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    };
  }, [videoSrc, exportedUrl]);

  // Apply playback speed to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      videoRef.current.preservesPitch = preservePitch;
      // @ts-expect-error vendor prefixes
      videoRef.current.mozPreservesPitch = preservePitch;
      // @ts-expect-error vendor prefixes
      videoRef.current.webkitPreservesPitch = preservePitch;
    }
  }, [speed, preservePitch]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (exportedUrl) {
      URL.revokeObjectURL(exportedUrl);
      setExportedUrl(null);
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
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

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Fast In-Browser Video Re-encoding with Speed Modification
  const exportSpeedVideo = async () => {
    if (!videoFile || !videoSrc) return;

    setIsExporting(true);
    setExportProgress(0);
    cancelExportRef.current = false;

    try {
      const hiddenVideo = document.createElement("video");
      hiddenVideo.src = videoSrc;
      hiddenVideo.muted = isMuted;
      hiddenVideo.playbackRate = speed;
      hiddenVideo.preservesPitch = preservePitch;

      await new Promise<void>((resolve, reject) => {
        hiddenVideo.onloadedmetadata = () => resolve();
        hiddenVideo.onerror = (e) => reject(e);
      });

      const width = hiddenVideo.videoWidth || 1280;
      const height = hiddenVideo.videoHeight || 720;
      const originalDuration = hiddenVideo.duration;
      const newDuration = originalDuration / speed;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not create canvas context");

      // Capture canvas stream at 30fps
      const canvasStream = canvas.captureStream(30);

      // Add audio track if not muted
      let combinedStream = canvasStream;
      if (!isMuted) {
        try {
          // @ts-expect-error captureStream on video
          const videoAudioStream = hiddenVideo.captureStream
            // @ts-expect-error captureStream
            ? hiddenVideo.captureStream()
            // @ts-expect-error mozCaptureStream
            : hiddenVideo.mozCaptureStream
            // @ts-expect-error mozCaptureStream
            ? hiddenVideo.mozCaptureStream()
            : null;

          if (videoAudioStream && videoAudioStream.getAudioTracks().length > 0) {
            const audioTrack = videoAudioStream.getAudioTracks()[0];
            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              audioTrack,
            ]);
          }
        } catch {
          // Audio capture might be blocked or unavailable, video stream proceeds
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000, // 6 Mbps high quality
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start(100);

      // Play hidden video from 0
      hiddenVideo.currentTime = 0;
      await hiddenVideo.play();

      // Render loop
      const renderFrame = () => {
        if (cancelExportRef.current || hiddenVideo.ended || hiddenVideo.currentTime >= originalDuration - 0.05) {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
          hiddenVideo.pause();
          return;
        }

        ctx.drawImage(hiddenVideo, 0, 0, width, height);

        const currentProg = Math.min(99, Math.round((hiddenVideo.currentTime / originalDuration) * 100));
        setExportProgress(currentProg);

        requestAnimationFrame(renderFrame);
      };

      requestAnimationFrame(renderFrame);

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          if (exportedUrl) URL.revokeObjectURL(exportedUrl);
          const url = URL.createObjectURL(blob);
          setExportedUrl(url);
          setExportProgress(100);
          setIsExporting(false);
          resolve();
        };
      });
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export video. Please try again with a standard MP4 or WebM video.");
      setIsExporting(false);
    }
  };

  const cancelExport = () => {
    cancelExportRef.current = true;
    setIsExporting(false);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const newEstDuration = duration ? (duration / speed).toFixed(1) : "0";

  return (
    <div className="w-full space-y-8">
      {/* Upload Zone (If no video yet) */}
      {!videoSrc && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510] p-12 text-center transition-all hover:border-[#3cff5f] hover:bg-[#102016] cursor-pointer shadow-2xl"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] transition-transform duration-300 group-hover:scale-110 mb-5">
            <Upload className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[#e7eee9] group-hover:text-white">
            Upload Video to Change Speed
          </h2>
          <p className="mt-2 text-sm text-[#9baaa1] max-w-md">
            Drag & drop any MP4, WebM, or MOV video. Create smooth slow motion or fast-paced time-lapses with zero watermark.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-6 py-3 text-xs font-bold text-[#050a08] transition-all group-hover:bg-[#52ff71]">
            <Film className="h-4 w-4" />
            <span>Select Video File</span>
          </div>
        </div>
      )}

      {/* Main Interactive Editor */}
      {videoSrc && (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#213026] pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
                <FastForward className="h-5 w-5 text-[#3cff5f]" />
                <span>{videoFile?.name || "Video Loaded"}</span>
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#9baaa1] mt-1">
                <span>Original: {formatSeconds(duration)}</span>
                <span>•</span>
                <span className="text-[#3cff5f] font-semibold">
                  New Duration: {newEstDuration}s ({speed}x)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setVideoSrc(null);
                setExportedUrl(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-semibold text-[#9baaa1] hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Change Video</span>
            </button>
          </div>

          {/* Video Player Preview */}
          <div className="relative aspect-video max-h-[460px] w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center border border-[#213026]">
            <video
              ref={videoRef}
              src={videoSrc}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
              className="h-full w-full object-contain"
            />

            {/* Play/Pause Overlay Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3cff5f] text-[#050a08] shadow-2xl">
                {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current translate-x-0.5" />}
              </div>
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#9baaa1]">
              <span>{formatSeconds(currentTime)}</span>
              <span>{formatSeconds(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
          </div>

          {/* Speed Presets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#e7eee9] uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-[#3cff5f]" />
                Select Speed Preset:
              </span>
              <span className="font-mono text-sm font-bold text-[#3cff5f]">
                {speed.toFixed(2)}x Playback
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {SPEED_PRESETS.map((p) => {
                const isActive = Math.abs(speed - p.value) < 0.01;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setSpeed(p.value)}
                    className={`rounded-xl py-2 px-1 text-xs font-bold transition-all cursor-pointer text-center ${
                      isActive
                        ? "bg-[#3cff5f] text-[#050a08] shadow-lg shadow-[#3cff5f]/20 font-black"
                        : "border border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:border-[#3cff5f] hover:text-[#e7eee9]"
                    }`}
                  >
                    {p.value}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Speed Slider */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e7eee9] flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-[#3cff5f]" />
                Custom Speed Slider (0.2x to 5.0x)
              </span>
              <span className="font-mono text-base font-bold text-[#3cff5f]">{speed.toFixed(2)}x</span>
            </div>

            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />

            {/* Audio Options: Pitch preservation & Mute */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#213026] text-xs text-[#9baaa1]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#e7eee9]">
                <input
                  type="checkbox"
                  checked={preservePitch}
                  onChange={(e) => setPreservePitch(e.target.checked)}
                  className="rounded border-[#213026] bg-[#0c1510] accent-[#3cff5f] cursor-pointer"
                />
                <span>Preserve Normal Audio Pitch (No Chipmunk effect)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-[#e7eee9]">
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                  className="rounded border-[#213026] bg-[#0c1510] accent-[#3cff5f] cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#3cff5f]" />}
                  Mute Audio in Export
                </span>
              </label>
            </div>
          </div>

          {/* Export Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#213026]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#080e0b] border border-[#213026] hover:border-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#e7eee9] hover:text-[#3cff5f] transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? "Pause Preview" : "Preview at " + speed + "x"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {!isExporting ? (
                <button
                  type="button"
                  onClick={exportSpeedVideo}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-8 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all shadow-xl shadow-[#3cff5f]/20 cursor-pointer w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Video ({speed}x)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={cancelExport}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-red-500 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <span>Cancel Export ({exportProgress}%)</span>
                </button>
              )}

              {exportedUrl && (
                <a
                  href={exportedUrl}
                  download={`speed_${speed}x_${videoFile?.name || "video.webm"}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all shadow-xl shadow-[#3cff5f]/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Sped Video</span>
                </a>
              )}
            </div>
          </div>

          {/* Export Progress Bar */}
          {isExporting && (
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e7eee9] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3cff5f] animate-ping" />
                  Processing Video at {speed}x Speed...
                </span>
                <span className="font-mono text-[#3cff5f] font-bold">{exportProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#101813] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3cff5f] to-[#77ff90] transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
