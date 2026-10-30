"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Smartphone,
  Play,
  Pause,
  Upload,
  Download,
  Sliders,
  Sparkles,
  AlertCircle,
  Video,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function LandscapeToPortraitTool() {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Customization controls
  const [blurAmount, setBlurAmount] = useState<number>(25);
  const [darkOverlay, setDarkOverlay] = useState<number>(35); // percentage
  const [fgScale, setFgScale] = useState<number>(100); // 70% to 100%
  const [fgRadius, setFgRadius] = useState<number>(16); // 0 to 32px

  // Export & Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [videoSrc, downloadUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
      setError("Please upload a valid MP4 or WebM video.");
      return;
    }

    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setFileName(file.name);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const loadSampleVideo = () => {
    setError("");
    if (videoSrc && videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");

    setVideoSrc("/mogrts/Fast_Wip_Animation.mp4");
    setFileName("Fast_Wip_Animation.mp4");
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Render loop to canvas
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width; // 1080
    const ch = canvas.height; // 1920

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
      return;
    }

    // 1. Draw Blurred Scaled Background
    ctx.save();
    ctx.filter = `blur(${blurAmount}px)`;
    // Scale background to cover entire canvas
    const vAspect = video.videoWidth / video.videoHeight;
    const cAspect = cw / ch;

    let bgW = cw;
    let bgH = ch;
    let bgX = 0;
    let bgY = 0;

    if (vAspect > cAspect) {
      // Video is wider than canvas
      bgH = ch;
      bgW = ch * vAspect;
      bgX = (cw - bgW) / 2;
    } else {
      bgW = cw;
      bgH = cw / vAspect;
      bgY = (ch - bgH) / 2;
    }

    // Expand bounds slightly to prevent blur edge bleeding
    const pad = blurAmount * 2;
    ctx.drawImage(video, bgX - pad, bgY - pad, bgW + pad * 2, bgH + pad * 2);
    ctx.restore();

    // 2. Dark Tint Overlay
    if (darkOverlay > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${darkOverlay / 100})`;
      ctx.fillRect(0, 0, cw, ch);
    }

    // 3. Draw Centered Foreground 16:9 Video
    const fgWidth = cw * (fgScale / 100);
    const fgHeight = fgWidth / vAspect;
    const fgX = (cw - fgWidth) / 2;
    const fgY = (ch - fgHeight) / 2;

    ctx.save();
    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;

    // Rounded rectangle clipping path
    if (fgRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(fgX, fgY, fgWidth, fgHeight, fgRadius);
      ctx.clip();
    }

    ctx.drawImage(video, fgX, fgY, fgWidth, fgHeight);
    ctx.restore();

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    }
  }, [blurAmount, darkOverlay, fgScale, fgRadius, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    } else {
      drawFrame();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, drawFrame]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => setIsPlaying(false));
    }
  };

  // Export Still Image Frame
  const exportStillFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `shorts-frame-${fileName.replace(/\.[^/.]+$/, "")}.png`;
    a.click();
  };

  // Render & Export 9:16 Video in Browser
  const startVideoExport = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsRecording(true);
    setRecordProgress(0);
    setError("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");

    // Setup canvas stream
    const fps = 30;
    const stream = canvas.captureStream(fps);

    // Capture audio from video if present
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    } catch {
      // Audio might be cross-origin or already hooked, continue with video-only
    }

    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
      ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8000000, // 8 Mbps
    });

    recordedChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRecording(false);
      setRecordProgress(100);
      setIsPlaying(false);
    };

    mediaRecorderRef.current = recorder;

    // Reset video to start and record
    video.currentTime = 0;
    await new Promise((r) => setTimeout(r, 100));

    recorder.start(100);
    video.play();
    setIsPlaying(true);

    const updateInterval = setInterval(() => {
      if (!video || video.ended || video.paused) {
        clearInterval(updateInterval);
        if (recorder.state === "recording") {
          recorder.stop();
        }
      } else {
        const prog = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
        setRecordProgress(prog);
      }
    }, 150);

    video.onended = () => {
      clearInterval(updateInterval);
      if (recorder.state === "recording") {
        recorder.stop();
      }
    };
  };

  return (
    <div className="w-full">
      {/* Upload and Sample Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#3cff5f]" />
              <span>16:9 to 9:16 Shorts &amp; Reels Converter</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Convert landscape YouTube videos to vertical TikTok &amp; Shorts with aesthetic blurred background padding. No watermarks.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: 9:16 Portrait Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-[36px] p-2 bg-[#121c16] border-4 border-[#26332d] shadow-2xl shadow-[#3cff5f]/10 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full rounded-[28px] object-cover bg-black"
              />

              {/* Hidden Video Source Element */}
              <video
                ref={videoRef}
                src={videoSrc}
                preload="auto"
                playsInline
                loop={!isRecording}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                    videoRef.current.currentTime = 0.01;
                    drawFrame();
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                className="hidden"
              />
            </div>

            {/* Playback Scrubber & Play Bar */}
            <div className="w-full max-w-[340px] mt-4 rounded-2xl bg-[#0c1510] border border-[#213026] p-4 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                disabled={isRecording}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-md shrink-0 disabled:opacity-50"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.05"
                  value={currentTime}
                  disabled={isRecording}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    setCurrentTime(t);
                    if (videoRef.current) {
                      videoRef.current.currentTime = t;
                      drawFrame();
                    }
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer h-1.5 bg-[#102a16] rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#9baaa1]">
                  <span>{currentTime.toFixed(1)}s</span>
                  <span>{duration.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customization Controls & Export Hub */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-2xl space-y-5">
              <h3 className="text-sm font-bold text-[#e7eee9] flex items-center gap-2 border-b border-[#213026] pb-3">
                <Sliders className="h-4 w-4 text-[#3cff5f]" />
                <span>Padding &amp; Blur Styling</span>
              </h3>

              {/* Blur Intensity Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Background Blur:</span>
                  <span className="font-mono text-[#3cff5f]">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={blurAmount}
                  onChange={(e) => {
                    setBlurAmount(Number(e.target.value));
                    drawFrame();
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Dark Overlay Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Background Darkening:</span>
                  <span className="font-mono text-[#3cff5f]">{darkOverlay}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75"
                  value={darkOverlay}
                  onChange={(e) => {
                    setDarkOverlay(Number(e.target.value));
                    drawFrame();
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Foreground Video Scale */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Video Frame Width:</span>
                  <span className="font-mono text-[#3cff5f]">{fgScale}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={fgScale}
                  onChange={(e) => {
                    setFgScale(Number(e.target.value));
                    drawFrame();
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Foreground Corner Radius */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e7eee9]">Rounded Corners:</span>
                  <span className="font-mono text-[#3cff5f]">{fgRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={fgRadius}
                  onChange={(e) => {
                    setFgRadius(Number(e.target.value));
                    drawFrame();
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>
            </div>

            {/* Export Action Card */}
            <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#e7eee9] flex items-center gap-2">
                <Video className="h-4 w-4 text-[#3cff5f]" />
                <span>Export Vertical Video (9:16)</span>
              </h3>

              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Renders a clean 1080×1920 portrait MP4/WebM video without watermarks or time limits directly inside your browser.
              </p>

              {isRecording ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#3cff5f]">
                    <span>Rendering Vertical Video...</span>
                    <span>{recordProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#102a16] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3cff5f] transition-all duration-150"
                      style={{ width: `${recordProgress}%` }}
                    />
                  </div>
                </div>
              ) : downloadUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#3cff5f] bg-[#102a16] border border-[#2a5234] p-3 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Video rendered successfully at 1080×1920!</span>
                  </div>

                  <a
                    href={downloadUrl}
                    download={`shorts-portrait-${fileName.replace(/\.[^/.]+$/, "")}.mp4`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download 9:16 Video</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setDownloadUrl("")}
                    className="w-full text-center text-xs text-[#9baaa1] hover:text-[#e7eee9] transition-colors cursor-pointer"
                  >
                    Render again with different styling
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={startVideoExport}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
                  >
                    <Video className="h-4 w-4" />
                    <span>Render &amp; Export 9:16 Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportStillFrame}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102a16] border border-[#2a5234] px-4 py-3 text-xs font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save 9:16 Poster / Still PNG</span>
                  </button>
                </div>
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
            <Smartphone className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Landscape Video
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Convert widescreen 16:9 videos into 9:16 portrait format for TikTok, Instagram Reels, and YouTube Shorts with beautiful blurred background padding.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Zero Watermark
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 1080×1920 Full HD Export
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

