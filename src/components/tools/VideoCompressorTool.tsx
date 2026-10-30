"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileVideo,
  Play,
  Pause,
  Upload,
  Download,
  Sliders,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Zap,
} from "lucide-react";

type PresetType = "discord" | "whatsapp" | "reduce50" | "reduce75" | "custom";

interface PresetConfig {
  id: PresetType;
  name: string;
  badge: string;
  desc: string;
  targetMb?: number;
  percentage?: number;
  scaleResolution?: number; // e.g. 720, 1080
}

const PRESETS: Record<PresetType, PresetConfig> = {
  discord: {
    id: "discord",
    name: "Discord & Email Cap",
    badge: "< 25 MB",
    desc: "Compresses file to fit under Discord and Gmail 25MB attachment limits.",
    targetMb: 24,
    scaleResolution: 720,
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Attachment",
    badge: "< 16 MB",
    desc: "Optimized for WhatsApp message and status video transfer.",
    targetMb: 15.5,
    scaleResolution: 720,
  },
  reduce50: {
    id: "reduce50",
    name: "50% Balanced Reduction",
    badge: "High Quality",
    desc: "Cuts file size in half while maintaining crisp 1080p resolution.",
    percentage: 50,
  },
  reduce75: {
    id: "reduce75",
    name: "75% Extreme Compression",
    badge: "Smallest Size",
    desc: "Maximum space saving for quick sharing and previews.",
    percentage: 25,
    scaleResolution: 720,
  },
  custom: {
    id: "custom",
    name: "Custom Target Size",
    badge: "Manual",
    desc: "Set an exact target file size in megabytes.",
    targetMb: 25,
  },
};

export default function VideoCompressorTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [originalSizeMb, setOriginalSizeMb] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Compression Settings
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("discord");
  const [customTargetMb, setCustomTargetMb] = useState<number>(24);
  const [targetRes, setTargetRes] = useState<number>(720); // 0 = original, 1080, 720, 480

  // Compression Execution State
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [compressedSizeMb, setCompressedSizeMb] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [videoSrc, compressedUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
      setError("Please select a supported video file (MP4, WebM, MOV, MKV).");
      return;
    }

    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedBlob(null);
    setCompressedUrl("");

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setFileName(file.name);
    setVideoSrc(url);
    setOriginalSizeMb(Number((file.size / (1024 * 1024)).toFixed(2)));
  };

  const loadSampleVideo = async () => {
    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedBlob(null);
    setCompressedUrl("");

    try {
      const res = await fetch("/mogrts/Fast_Wip_Animation.mp4");
      const blob = await res.blob();
      const file = new File([blob], "Fast_Wip_Animation.mp4", { type: "video/mp4" });
      const url = URL.createObjectURL(file);

      setVideoFile(file);
      setFileName("Fast_Wip_Animation.mp4");
      setVideoSrc(url);
      setOriginalSizeMb(Number((file.size / (1024 * 1024)).toFixed(2)));
    } catch {
      setError("Failed to load sample video.");
    }
  };

  const applyPreset = (pid: PresetType) => {
    setSelectedPreset(pid);
    const p = PRESETS[pid];
    if (p.targetMb) setCustomTargetMb(p.targetMb);
    if (p.percentage && originalSizeMb > 0) {
      setCustomTargetMb(Number(((originalSizeMb * p.percentage) / 100).toFixed(1)));
    }
    if (p.scaleResolution) setTargetRes(p.scaleResolution);
  };

  const startCompression = async () => {
    const video = videoRef.current;
    if (!video || !duration || duration <= 0) return;

    setIsCompressing(true);
    setCompressProgress(0);
    setError("");

    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedBlob(null);
    setCompressedUrl("");

    try {
      // 1. Calculate Target Bitrate
      let targetSize = customTargetMb;
      if (selectedPreset === "reduce50" && originalSizeMb > 0) {
        targetSize = originalSizeMb * 0.5;
      } else if (selectedPreset === "reduce75" && originalSizeMb > 0) {
        targetSize = originalSizeMb * 0.25;
      }

      // Safety buffer: 5% lower than target to ensure it lands strictly below limits
      const safeTargetBits = targetSize * 0.95 * 8 * 1024 * 1024;
      const targetBps = Math.max(300000, Math.floor(safeTargetBits / duration)); // minimum 300 kbps

      // 2. Setup Destination Resolution
      let targetW = video.videoWidth || 1280;
      let targetH = video.videoHeight || 720;
      const aspect = targetW / targetH;

      if (targetRes > 0 && targetH > targetRes) {
        targetH = targetRes;
        targetW = Math.round(targetH * aspect);
        // Ensure even dimensions for video codecs
        if (targetW % 2 !== 0) targetW += 1;
        if (targetH % 2 !== 0) targetH += 1;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // 3. Setup Stream & MediaRecorder
      const fps = 30;
      const stream = canvas.captureStream(fps);

      // Attempt to route audio
      try {
        const audioCtx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch {
        // Continue if audio is already routed or blocked
      }

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? "video/mp4;codecs=avc1"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: targetBps,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const sizeMb = Number((blob.size / (1024 * 1024)).toFixed(2));
        setCompressedBlob(blob);
        setCompressedUrl(url);
        setCompressedSizeMb(sizeMb);
        setIsCompressing(false);
        setCompressProgress(100);
      };

      mediaRecorderRef.current = recorder;

      // 4. Render loop through canvas
      let animId: number;
      const renderFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, targetW, targetH);
          animId = requestAnimationFrame(renderFrame);
        }
      };

      // Reset to beginning and play
      video.currentTime = 0;
      await new Promise((r) => setTimeout(r, 80));

      recorder.start(100);
      video.play();
      renderFrame();

      const progressInterval = setInterval(() => {
        if (!video || video.ended || video.paused) {
          clearInterval(progressInterval);
          cancelAnimationFrame(animId);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        } else {
          const prog = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
          setCompressProgress(prog);
        }
      }, 100);

      video.onended = () => {
        clearInterval(progressInterval);
        cancelAnimationFrame(animId);
        if (recorder.state === "recording") {
          recorder.stop();
        }
      };
    } catch (err: unknown) {
      console.error(err);
      setError("Compression failed. Please try a different video format.");
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `compressed-${fileName.replace(/\.[^/.]+$/, "")}.mp4`;
    link.click();
  };

  return (
    <div className="w-full">
      {/* Upload and Sample Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-[#3cff5f]" />
              <span>Online Video Compressor</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Compress MP4, WebM, and MOV videos to fit Discord 25MB, WhatsApp, or Email limits. 100% in-browser, no watermarks.
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
          {/* Hidden video element for rendering */}
          <video
            ref={videoRef}
            src={videoSrc}
            preload="auto"
            muted
            playsInline
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                setVideoDimensions({
                  w: videoRef.current.videoWidth,
                  h: videoRef.current.videoHeight,
                });
              }
            }}
            className="hidden"
          />

          {/* Compression Configuration Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Video File Information Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#213026]">
              <div>
                <span className="text-xs text-[#9baaa1]">Source Video:</span>
                <h3 className="text-sm sm:text-base font-bold text-[#e7eee9] truncate max-w-md">
                  {fileName}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                  Original: {originalSizeMb} MB
                </span>
                {videoDimensions.w > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-[#080e0b] border border-[#213026] text-[#9baaa1]">
                    {videoDimensions.w}×{videoDimensions.h} • {Math.round(duration)}s
                  </span>
                )}
              </div>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block text-xs font-semibold text-[#9baaa1] uppercase tracking-wider mb-3">
                Compression Targets:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(["discord", "whatsapp", "reduce50", "reduce75"] as PresetType[]).map((pid) => {
                  const p = PRESETS[pid];
                  const isActive = selectedPreset === pid;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => applyPreset(pid)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#102a16] border-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                          : "bg-[#080e0b] border-[#213026] hover:border-[#3cff5f]/50 hover:bg-[#0c1510]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#e7eee9]">{p.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#3cff5f]/20 text-[#3cff5f]"
                              : "bg-[#15231c] text-[#9baaa1]"
                          }`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9baaa1] leading-relaxed line-clamp-2">
                        {p.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Sliders & Resolution Controls */}
            <div className="pt-4 border-t border-[#213026] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#9baaa1]">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Target Max File Size:</span>
                  <span className="font-mono text-[#3cff5f]">{customTargetMb} MB</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max={Math.max(50, Math.floor(originalSizeMb * 0.95))}
                  step="1"
                  value={customTargetMb}
                  onChange={(e) => {
                    setCustomTargetMb(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Resolution Scaling:</span>
                  <span className="font-mono text-[#3cff5f]">
                    {targetRes === 0 ? "Original" : `${targetRes}p`}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "Original", val: 0 },
                    { label: "1080p", val: 1080 },
                    { label: "720p (Fast)", val: 720 },
                    { label: "480p", val: 480 },
                  ].map((res) => (
                    <button
                      key={res.label}
                      type="button"
                      onClick={() => setTargetRes(res.val)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                        targetRes === res.val
                          ? "bg-[#3cff5f] text-[#050a08] font-bold border-[#3cff5f]"
                          : "bg-[#080e0b] border-[#213026] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Compression Action & Progress */}
            <div className="pt-4 border-t border-[#213026]">
              {isCompressing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#3cff5f]">
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 border-2 border-[#3cff5f] border-t-transparent rounded-full animate-spin" />
                      <span>Compressing video in browser...</span>
                    </span>
                    <span>{compressProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#102a16] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3cff5f] transition-all duration-150"
                      style={{ width: `${compressProgress}%` }}
                    />
                  </div>
                </div>
              ) : compressedUrl ? (
                <div className="space-y-4">
                  {/* Before & After Size Pill */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#102a16] border border-[#2a5234]">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-[#3cff5f] shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-[#e7eee9] block">
                          Compression Complete!
                        </span>
                        <span className="text-[11px] text-[#9baaa1]">
                          Reduced from <strong>{originalSizeMb} MB</strong> down to{" "}
                          <strong className="text-[#3cff5f]">{compressedSizeMb} MB</strong> (
                          {Math.round(((originalSizeMb - compressedSizeMb) / originalSizeMb) * 100)}% smaller)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Compressed Video</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCompressedUrl("");
                      setCompressedBlob(null);
                    }}
                    className="text-xs text-[#9baaa1] hover:text-[#e7eee9] transition-colors cursor-pointer block text-center w-full"
                  >
                    Compress again with different settings
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startCompression}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-4 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 active:scale-95"
                >
                  <Zap className="h-4 w-4" />
                  <span>Start Video Compression</span>
                </button>
              )}
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
            <FileVideo className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Video
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Compress large MP4, WebM, and MOV video files directly in your web browser. Hit exact Discord (25MB) or WhatsApp (16MB) upload caps with no watermarks.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Discord 25MB Presets
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Zero Watermarks
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% In-Browser &amp; Free
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

