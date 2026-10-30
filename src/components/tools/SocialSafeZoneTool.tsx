"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Upload,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Volume2,
  VolumeX,
  Film,
  Image as ImageIcon,
} from "lucide-react";

type Platform = "tiktok" | "reels" | "shorts";

interface PlatformConfig {
  id: Platform;
  name: string;
  badge: string;
  dimensions: string;
  safeMarginTop: number;
  safeMarginBottom: number;
  safeMarginRight: number;
  safeMarginLeft: number;
  description: string;
}

const PLATFORMS: Record<Platform, PlatformConfig> = {
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    badge: "9:16 (1080 × 1920)",
    dimensions: "1080 × 1920 px",
    safeMarginTop: 12,
    safeMarginBottom: 22,
    safeMarginRight: 18,
    safeMarginLeft: 4,
    description: "TikTok 9:16 safe area. Keeps text clear of right-side action buttons and bottom captions.",
  },
  reels: {
    id: "reels",
    name: "Instagram Reels",
    badge: "9:16 (1080 × 1920)",
    dimensions: "1080 × 1920 px",
    safeMarginTop: 10,
    safeMarginBottom: 20,
    safeMarginRight: 16,
    safeMarginLeft: 4,
    description: "Instagram Reels 9:16 safe area. Avoids feed grid crop (4:5) and right side action buttons.",
  },
  shorts: {
    id: "shorts",
    name: "YouTube Shorts",
    badge: "9:16 (1080 × 1920)",
    dimensions: "1080 × 1920 px",
    safeMarginTop: 8,
    safeMarginBottom: 18,
    safeMarginRight: 16,
    safeMarginLeft: 4,
    description: "YouTube Shorts 9:16 safe area. Keeps titles safe from bottom subscribe pill and right-side buttons.",
  },
};

const DEFAULT_SAMPLE_VIDEO = "/mogrts/Fast_Wip_Animation.mp4";

export default function SocialSafeZoneTool() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("tiktok");
  const [mediaUrl, setMediaUrl] = useState<string>(DEFAULT_SAMPLE_VIDEO);
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [mediaName, setMediaName] = useState<string>("Sample Motion Graphics (Compx Orbit)");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");

  // Overlays
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [showUiOverlay, setShowUiOverlay] = useState<boolean>(true);
  const [showDangerZones, setShowDangerZones] = useState<boolean>(false);
  const [showCenterGuide, setShowCenterGuide] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(85);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlatform = PLATFORMS[selectedPlatform];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaUrl.startsWith("blob:")) {
      URL.revokeObjectURL(mediaUrl);
    }

    const isVid = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const newUrl = URL.createObjectURL(file);

    setMediaType(isVid ? "video" : "image");
    setMediaName(file.name);
    setMediaUrl(newUrl);

    if (isVid) {
      setIsPlaying(true);
      setIsMuted(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0.01;
          videoRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        }
      }, 100);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.currentTime = 0.01;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const loadSampleVideo = () => {
    setMediaType("video");
    setMediaName("Sample Motion Graphics (Compx Orbit)");
    setMediaUrl(DEFAULT_SAMPLE_VIDEO);
    setIsPlaying(true);
    setIsMuted(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0.01;
        videoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const loadSampleGraphic = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Vibrant gradient background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, "#0e1a2f");
    grad.addColorStop(0.35, "#153323");
    grad.addColorStop(0.7, "#1c142b");
    grad.addColorStop(1, "#0a1310");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative glowing spheres
    ctx.fillStyle = "rgba(60, 255, 95, 0.15)";
    ctx.beginPath();
    ctx.arc(540, 700, 320, 0, Math.PI * 2);
    ctx.fill();

    // Centered Title Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ATTENTION GRABBER", 540, 840);

    ctx.fillStyle = "#3cff5f";
    ctx.font = "bold 84px Inter, sans-serif";
    ctx.fillText("VIRAL REELS HOOK #1", 540, 940);

    ctx.fillStyle = "#a3b899";
    ctx.font = "36px Inter, sans-serif";
    ctx.fillText("Notice how this text is 100% inside the safe zone", 540, 1020);

    const dataUrl = canvas.toDataURL("image/png");
    setMediaType("image");
    setMediaName("Sample-Graphic-Template.png");
    setMediaUrl(dataUrl);
    setIsPlaying(false);
  };

  // Generate and download transparent PNG safe-zone overlay grid for After Effects & Premiere Pro
  const downloadSafeZoneOverlayPng = () => {
    setIsGeneratingPng(true);
    try {
      const width = 1080;
      const height = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const topPx = (currentPlatform.safeMarginTop / 100) * height;
      const bottomPx = height - (currentPlatform.safeMarginBottom / 100) * height;
      const leftPx = (currentPlatform.safeMarginLeft / 100) * width;
      const rightPx = width - (currentPlatform.safeMarginRight / 100) * width;

      // Draw Danger Zones (Red tinted boxes)
      ctx.fillStyle = "rgba(255, 50, 50, 0.22)";
      ctx.fillRect(0, 0, width, topPx);
      ctx.fillRect(0, bottomPx, width, height - bottomPx);
      ctx.fillRect(rightPx, topPx, width - rightPx, bottomPx - topPx);

      // Safe Zone Border
      ctx.strokeStyle = "#3cff5f";
      ctx.lineWidth = 6;
      ctx.strokeRect(leftPx, topPx, rightPx - leftPx, bottomPx - topPx);

      // Label text
      ctx.fillStyle = "#3cff5f";
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${currentPlatform.name} 1080x1920 SAFE ZONE (COMPX ORBIT)`, leftPx + 20, topPx + 45);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${currentPlatform.id}-safe-zone-overlay-1080x1920.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0.01;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="w-full">
      {/* Control Toolbar */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 mb-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Platform Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#9baaa1] uppercase tracking-wider mb-2">
              Select Social Platform:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(PLATFORMS) as Platform[]).map((pid) => {
                const p = PLATFORMS[pid];
                const isActive = selectedPlatform === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => setSelectedPlatform(pid)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[#102a16] text-[#3cff5f] border-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                        : "bg-[#080e0b] text-[#9baaa1] border-[#213026] hover:border-[#3cff5f]/50 hover:text-[#e7eee9]"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">9:16</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload & Sample Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Video / Image</span>
            </button>

            <button
              type="button"
              onClick={loadSampleVideo}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-2.5 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
              title="Play Motion Graphics Sample Video"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Sample Video</span>
            </button>

            <button
              type="button"
              onClick={loadSampleGraphic}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#080e0b] px-3.5 py-2.5 text-xs font-semibold text-[#9baaa1] border border-[#213026] hover:text-[#e7eee9] hover:border-[#3cff5f]/50 transition-colors cursor-pointer"
              title="Load Static Test Graphic"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Test Graphic</span>
            </button>
          </div>
        </div>

        {/* Toggles Bar */}
        <div className="mt-6 pt-5 border-t border-[#213026] grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-medium text-[#e7eee9] cursor-pointer">
            <input
              type="checkbox"
              checked={showSafeZone}
              onChange={(e) => setShowSafeZone(e.target.checked)}
              className="rounded-sm border-[#213026] bg-[#080e0b] text-[#3cff5f] focus:ring-[#3cff5f]"
            />
            <span>Safe Zone Box (Green)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-[#e7eee9] cursor-pointer">
            <input
              type="checkbox"
              checked={showUiOverlay}
              onChange={(e) => setShowUiOverlay(e.target.checked)}
              className="rounded-sm border-[#213026] bg-[#080e0b] text-[#3cff5f] focus:ring-[#3cff5f]"
            />
            <span>Simulated App UI</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-[#e7eee9] cursor-pointer">
            <input
              type="checkbox"
              checked={showDangerZones}
              onChange={(e) => setShowDangerZones(e.target.checked)}
              className="rounded-sm border-[#213026] bg-[#080e0b] text-[#3cff5f] focus:ring-[#3cff5f]"
            />
            <span>Blocked Zones (Red)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-[#e7eee9] cursor-pointer">
            <input
              type="checkbox"
              checked={showCenterGuide}
              onChange={(e) => setShowCenterGuide(e.target.checked)}
              className="rounded-sm border-[#213026] bg-[#080e0b] text-[#3cff5f] focus:ring-[#3cff5f]"
            />
            <span>Center Crosshair</span>
          </label>
        </div>

        {/* Sliders and Fit controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#9baaa1]">
          <div className="flex items-center gap-3">
            <Sliders className="h-3.5 w-3.5 text-[#3cff5f]" />
            <span>UI Overlay Opacity:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-28 accent-[#3cff5f] cursor-pointer"
            />
            <span className="font-mono text-[#e7eee9]">{overlayOpacity}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Video Scaling:</span>
            <button
              type="button"
              onClick={() => setObjectFit(objectFit === "cover" ? "contain" : "cover")}
              className="rounded-lg bg-[#080e0b] border border-[#213026] px-2.5 py-1 text-xs text-[#3cff5f] hover:border-[#3cff5f] cursor-pointer font-mono"
            >
              {objectFit === "cover" ? "Crop to Fill (Cover)" : "Fit Entire Video (Contain)"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Phone Mockup & Dedicated Video Player Controls */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          {/* Phone Frame Container */}
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-[44px] border-[10px] border-[#18261f] bg-[#050a08] shadow-2xl overflow-hidden ring-1 ring-[#3cff5f]/30 select-none">
            {/* Phone Speaker Pill */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 h-3.5 w-24 bg-[#18261f] rounded-full flex items-center justify-center pointer-events-none">
              <div className="h-1 w-8 bg-[#080e0b] rounded-full" />
            </div>

            {/* Video or Image Element */}
            <div className="absolute inset-0 w-full h-full bg-[#030605] flex items-center justify-center overflow-hidden">
              {mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain bg-black"}`}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={mediaUrl}
                  alt="Uploaded media preview"
                  className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain bg-black"}`}
                />
              )}
            </div>

            {/* Red Danger Zones (Cutoffs) - Default Off to prevent darkening */}
            {showDangerZones && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div
                  className="absolute top-0 left-0 right-0 bg-red-600/30 border-b border-red-500/50 backdrop-blur-[1px]"
                  style={{ height: `${currentPlatform.safeMarginTop}%` }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-600/30 border-t border-red-500/50 backdrop-blur-[1px]"
                  style={{ height: `${currentPlatform.safeMarginBottom}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 right-0 bg-red-600/30 border-l border-red-500/50 backdrop-blur-[1px]"
                  style={{
                    width: `${currentPlatform.safeMarginRight}%`,
                    top: `${currentPlatform.safeMarginTop}%`,
                    bottom: `${currentPlatform.safeMarginBottom}%`,
                  }}
                />
              </div>
            )}

            {/* Safe Zone Boundary Box (Green Outline) */}
            {showSafeZone && (
              <div
                className="absolute pointer-events-none z-30 border-2 border-dashed border-[#3cff5f] shadow-[0_0_20px_rgba(60,255,95,0.35)] transition-all"
                style={{
                  top: `${currentPlatform.safeMarginTop}%`,
                  bottom: `${currentPlatform.safeMarginBottom}%`,
                  left: `${currentPlatform.safeMarginLeft}%`,
                  right: `${currentPlatform.safeMarginRight}%`,
                }}
              >
                <span className="absolute top-1.5 left-2 text-[9px] font-extrabold text-[#3cff5f] bg-black/80 px-1.5 py-0.5 rounded-sm backdrop-blur-xs tracking-wider">
                  SAFE ZONE
                </span>
              </div>
            )}

            {/* Center Crosshair Guide */}
            {showCenterGuide && (
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <div className="w-full h-px bg-[#3cff5f]/50 border-t border-dashed border-[#3cff5f]" />
                <div className="h-full w-px bg-[#3cff5f]/50 border-l border-dashed border-[#3cff5f] absolute" />
              </div>
            )}

            {/* Simulated UI Overlays for TikTok / Reels / Shorts */}
            {showUiOverlay && (
              <div
                className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-3.5 text-white transition-opacity select-none"
                style={{ opacity: overlayOpacity / 100 }}
              >
                {/* Top Header */}
                <div className="pt-6 flex items-center justify-between text-[11px] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {selectedPlatform === "tiktok" && (
                    <div className="flex items-center justify-center gap-4 w-full">
                      <span className="opacity-70">Following</span>
                      <span className="border-b-2 border-white pb-0.5">For You</span>
                    </div>
                  )}
                  {selectedPlatform === "reels" && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-extrabold tracking-tight">Reels</span>
                      <div className="h-4 w-4 rounded-full border border-white/80" />
                    </div>
                  )}
                  {selectedPlatform === "shorts" && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-extrabold tracking-tight">Shorts</span>
                      <div className="h-4 w-4 rounded-full border border-white/80" />
                    </div>
                  )}
                </div>

                {/* Bottom and Right Container */}
                <div className="flex items-end justify-between gap-2 pb-2">
                  {/* Bottom Left Caption & Metadata */}
                  <div className="flex-1 space-y-1 text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pr-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>@creator_handle</span>
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full">Follow</span>
                    </div>
                    <p className="text-[10px] leading-tight line-clamp-2 text-white/90">
                      Check your video safe zones! Keep all subtitles inside the green box 🚀 #motiondesign #compx
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-white/80">
                      <span>♫ Trending Sound • Original Audio</span>
                    </div>
                  </div>

                  {/* Right Side Action Buttons */}
                  <div className="flex flex-col items-center gap-3 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    <div className="h-7 w-7 rounded-full bg-white/30 border border-white flex items-center justify-center text-[9px] font-bold">
                      AE
                    </div>
                    <div className="flex flex-col items-center text-[9px]">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">♥</div>
                      <span className="font-semibold mt-0.5">24K</span>
                    </div>
                    <div className="flex flex-col items-center text-[9px]">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">💬</div>
                      <span className="font-semibold mt-0.5">840</span>
                    </div>
                    <div className="flex flex-col items-center text-[9px]">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">↗</div>
                      <span className="font-semibold mt-0.5">Share</span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-black/70 border border-white/40 flex items-center justify-center text-[9px]">
                      💿
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Video Controls Bar */}
          {mediaType === "video" && (
            <div className="w-[280px] sm:w-[320px] mt-4 rounded-2xl bg-[#0c1510] border border-[#213026] p-3 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-3 py-1.5 text-xs font-bold text-[#050a08] hover:bg-[#48ff69] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                  <span>{isPlaying ? "Pause" : "Play"}</span>
                </button>

                <div className="text-[11px] font-mono text-[#9baaa1]">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </div>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`rounded-xl p-1.5 border transition-colors cursor-pointer ${
                    isMuted
                      ? "bg-[#080e0b] border-[#213026] text-[#9baaa1]"
                      : "bg-[#102a16] border-[#2a5234] text-[#3cff5f]"
                  }`}
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={duration || 10}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-[#3cff5f] cursor-pointer h-1.5 bg-[#080e0b] rounded-lg"
              />
            </div>
          )}

          {/* Current File Info */}
          <div className="mt-3 text-center">
            <span className="inline-block rounded-md bg-[#080e0b] border border-[#213026] px-2.5 py-1 text-[11px] text-[#9baaa1] font-mono truncate max-w-xs">
              {mediaType === "video" ? "🎬 Video: " : "🖼️ Image: "} {mediaName}
            </span>
          </div>
        </div>

        {/* Right Column: Platform Margins & PNG Overlay Exporter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Platform Guide Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#e7eee9]">
                {currentPlatform.name} Safe Zone Specs
              </h3>
              <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-xs font-semibold text-[#3cff5f]">
                {currentPlatform.badge}
              </span>
            </div>

            <p className="text-xs text-[#9baaa1] leading-relaxed mb-6">
              {currentPlatform.description}
            </p>

            {/* Margin Metrics */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#080e0b] p-3 border border-[#213026]">
                <span className="text-[#9baaa1]">Top Cutoff (Header/Search):</span>
                <span className="text-[#ff4d4d] font-bold">~{currentPlatform.safeMarginTop}% (~230 px)</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#080e0b] p-3 border border-[#213026]">
                <span className="text-[#9baaa1]">Bottom Cutoff (Captions):</span>
                <span className="text-[#ff4d4d] font-bold">~{currentPlatform.safeMarginBottom}% (~420 px)</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#080e0b] p-3 border border-[#213026]">
                <span className="text-[#9baaa1]">Right Margin (Buttons):</span>
                <span className="text-[#ff4d4d] font-bold">~{currentPlatform.safeMarginRight}% (~190 px)</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#102a16] p-3 border border-[#2a5234]">
                <span className="text-[#3cff5f] font-sans font-bold">Recommended Text Box:</span>
                <span className="text-[#3cff5f] font-bold">900 × 1270 px</span>
              </div>
            </div>
          </div>

          {/* Export PNG Overlay for After Effects / Premiere Pro */}
          <div className="rounded-3xl border border-[#2a5234] bg-gradient-to-b from-[#0c1c13] to-[#08120c] p-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-[#e7eee9] mb-2">
              <Sparkles className="h-4 w-4 text-[#3cff5f]" />
              <span>Export Guide for After Effects / Premiere</span>
            </div>
            <p className="text-xs text-[#9baaa1] leading-relaxed mb-5">
              Download a 1080 × 1920 transparent PNG guide overlay. Drag it directly on top of your timeline inside Adobe After Effects, Premiere Pro, or DaVinci Resolve to align your typography and motion graphics perfectly.
            </p>

            <button
              type="button"
              onClick={downloadSafeZoneOverlayPng}
              disabled={isGeneratingPng}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Download 1080×1920 PNG Grid</span>
            </button>
          </div>

          {/* Tips Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 text-xs text-[#9baaa1] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#e7eee9]">
              <Info className="h-4 w-4 text-[#3cff5f]" />
              <span>Pro Video Editor Tip:</span>
            </div>
            <p className="leading-relaxed">
              Always leave a safety buffer of at least 40px inside the green border. Different smartphone screens (iPhone Dynamic Island, curved Android displays) have subtle variance in aspect ratios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
