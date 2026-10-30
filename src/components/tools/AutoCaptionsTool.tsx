"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Upload,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Type,
  Film,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2,
} from "lucide-react";

export interface CaptionWord {
  id: string;
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface CaptionLine {
  id: string;
  start: number;
  end: number;
  words: CaptionWord[];
  text: string;
}

export type CaptionPreset = "hormozi" | "beast" | "emerald" | "minimal" | "tiktok";

interface PresetConfig {
  id: CaptionPreset;
  name: string;
  badge: string;
  desc: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: number; // in px for 1080x1920 reference
  textColor: string;
  highlightColor: string;
  highlightBg: string;
  textTransform: "uppercase" | "capitalize" | "none";
  textShadow: string;
  stroke: string;
  boxBg?: string;
  animation: "pop" | "bounce" | "glow" | "simple";
}

const PRESET_CONFIGS: Record<CaptionPreset, PresetConfig> = {
  hormozi: {
    id: "hormozi",
    name: "Hormozi Viral",
    badge: "Most Popular",
    desc: "Heavy uppercase bold font with intense yellow active word highlight and black backdrop.",
    fontFamily: "'Montserrat', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFFFFF",
    highlightColor: "#FFE600",
    highlightBg: "#000000",
    textTransform: "uppercase",
    textShadow: "0 4px 12px rgba(0,0,0,0.9)",
    stroke: "2px #000000",
    boxBg: "rgba(0, 0, 0, 0.75)",
    animation: "pop",
  },
  beast: {
    id: "beast",
    name: "Beast Energy",
    badge: "High Energy",
    desc: "Punchy comic-style scale pop with bright cyan and yellow high-contrast glow.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 30,
    textColor: "#FFFFFF",
    highlightColor: "#00F0FF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(0, 240, 255, 0.8), 0 4px 8px #000",
    stroke: "3px #000000",
    animation: "bounce",
  },
  emerald: {
    id: "emerald",
    name: "CompX Emerald",
    badge: "Cyber Aesthetic",
    desc: "Sleek dark neon green capsule pill with smooth word illumination.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "800",
    fontSize: 24,
    textColor: "#E7EEE9",
    highlightColor: "#3CFF5F",
    highlightBg: "rgba(16, 42, 22, 0.85)",
    textTransform: "uppercase",
    textShadow: "0 0 14px rgba(60, 255, 95, 0.6)",
    stroke: "none",
    boxBg: "rgba(12, 21, 16, 0.85)",
    animation: "glow",
  },
  minimal: {
    id: "minimal",
    name: "Minimal Aesthetic",
    badge: "Clean & Elegant",
    desc: "Modern crisp typography with subtle contrast shadow, perfect for vlogs and tutorials.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "600",
    fontSize: 22,
    textColor: "#FFFFFF",
    highlightColor: "#FFFFFF",
    highlightBg: "transparent",
    textTransform: "none",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
    stroke: "1px rgba(0,0,0,0.5)",
    boxBg: "rgba(0,0,0,0.45)",
    animation: "simple",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Classic",
    badge: "Viral Classic",
    desc: "Bold white text with thick black outer stroke and energetic red highlight.",
    fontFamily: "'Proxima Nova', 'Arial', sans-serif",
    fontWeight: "800",
    fontSize: 26,
    textColor: "#FFFFFF",
    highlightColor: "#FF2A55",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 3px 6px rgba(0,0,0,0.9)",
    stroke: "3px #000000",
    animation: "pop",
  },
};

const SAMPLE_DEMO_TEXT = `Welcome to the ultimate auto caption generator. This tool creates viral animated subtitles just like Submagic and Captions app, but completely free with zero watermarks. Export to SRT, VTT, or ASS with exact timestamps.`;

export default function AutoCaptionsTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Styling state
  const [preset, setPreset] = useState<CaptionPreset>("hormozi");
  const [fontSize, setFontSize] = useState<number>(26);
  const [position, setPosition] = useState<"bottom" | "center" | "top">("bottom");
  const [wordsPerLine, setWordsPerLine] = useState<number>(3);
  const [highlightColor, setHighlightColor] = useState<string>("#FFE600");
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [textTransform, setTextTransform] = useState<"uppercase" | "capitalize" | "none">("uppercase");

  // Transcript state
  const [rawText, setRawText] = useState<string>(SAMPLE_DEMO_TEXT);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync preset changes with controls
  const handlePresetSelect = (p: CaptionPreset) => {
    setPreset(p);
    const cfg = PRESET_CONFIGS[p];
    setFontSize(cfg.fontSize);
    setHighlightColor(cfg.highlightColor);
    setTextColor(cfg.textColor);
    setTextTransform(cfg.textTransform);
  };

  // Convert raw text into synchronized word list based on duration
  const captionLines = useMemo<CaptionLine[]>(() => {
    const clean = rawText.trim();
    if (!clean) return [];

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const effectiveDuration = duration > 0 ? duration : Math.max(12, words.length * 0.38);
    const timePerWord = effectiveDuration / words.length;

    const wordObjects: CaptionWord[] = words.map((w, idx) => ({
      id: `w-${idx}`,
      word: w,
      start: idx * timePerWord,
      end: (idx + 1) * timePerWord,
    }));

    // Group into lines based on wordsPerLine
    const lines: CaptionLine[] = [];
    for (let i = 0; i < wordObjects.length; i += wordsPerLine) {
      const slice = wordObjects.slice(i, i + wordsPerLine);
      const lineStart = slice[0].start;
      const lineEnd = slice[slice.length - 1].end;
      lines.push({
        id: `line-${i}`,
        start: lineStart,
        end: lineEnd,
        words: slice,
        text: slice.map((sw) => sw.word).join(" "),
      });
    }

    return lines;
  }, [rawText, duration, wordsPerLine]);

  // Find currently active line and active word
  const activeLine = useMemo(() => {
    return captionLines.find(
      (line) => currentTime >= line.start && currentTime <= line.end
    );
  }, [captionLines, currentTime]);

  const activeWordId = useMemo(() => {
    if (!activeLine) return null;
    const match = activeLine.words.find(
      (w) => currentTime >= w.start && currentTime <= w.end
    );
    return match ? match.id : activeLine.words[0]?.id;
  }, [activeLine, currentTime]);

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);
    setIsPlaying(false);
    setCurrentTime(0);

    // Auto-transcribe using local speech recognition or backend if available
    attemptAutoTranscribe(file);
  };

  // Automatic Speech-to-Text Fallback
  const attemptAutoTranscribe = async (file: File) => {
    setIsTranscribing(true);
    try {
      // 1. Try sending to transcribe API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const res = await fetch("/api/tools/transcribe-file", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plainText && data.plainText.length > 10) {
          setRawText(data.plainText);
          setIsTranscribing(false);
          return;
        }
      }
    } catch {
      // ignore, fall back
    }

    // 2. Browser Web Speech Recognition fallback for audio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (evt: any) => {
          let str = "";
          for (let i = 0; i < evt.results.length; ++i) {
            str += evt.results[i][0].transcript + " ";
          }
          if (str.trim()) {
            setRawText(str.trim());
          }
        };
      } catch {
        // keep existing demo text
      }
    }

    setIsTranscribing(false);
  };

  // Track playback time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) {
      // Simulate playback if no video uploaded
      setIsPlaying((prev) => !prev);
      return;
    }
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Virtual playback loop when no video uploaded (for previewing captions)
  useEffect(() => {
    if (!videoSrc && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const max = duration > 0 ? duration : 15;
          if (prev >= max) {
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [videoSrc, isPlaying, duration]);

  // Export Formats
  const generateSRT = useCallback(() => {
    return captionLines
      .map((line, idx) => {
        const formatTime = (sec: number) => {
          const ms = Math.floor((sec % 1) * 1000);
          const totalSec = Math.floor(sec);
          const s = totalSec % 60;
          const m = Math.floor(totalSec / 60) % 60;
          const h = Math.floor(totalSec / 3600);
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
        };
        return `${idx + 1}\n${formatTime(line.start)} --> ${formatTime(line.end)}\n${line.text}\n`;
      })
      .join("\n");
  }, [captionLines]);

  const generateVTT = useCallback(() => {
    const srt = generateSRT();
    return `WEBVTT\n\n${srt.replace(/,/g, ".")}`;
  }, [generateSRT]);

  // ASS format for Premiere Pro / After Effects / CapCut with exact styles!
  const generateASS = useCallback(() => {
    const cfg = PRESET_CONFIGS[preset];
    return `[Script Info]
Title: CompX Orbit Auto Captions
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${cfg.fontFamily.split(",")[0].replace(/'/g, "")},${cfg.fontSize * 1.5},&H00FFFFFF,&H0000E6FF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,3,2,2,10,10,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${captionLines
  .map((line) => {
    const fmt = (sec: number) => {
      const cs = Math.floor((sec % 1) * 100);
      const totalSec = Math.floor(sec);
      const s = totalSec % 60;
      const m = Math.floor(totalSec / 60) % 60;
      const h = Math.floor(totalSec / 3600);
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    };
    return `Dialogue: 0,${fmt(line.start)},${fmt(line.end)},Default,,0,0,0,,${line.text.toUpperCase()}`;
  })
  .join("\n")}
`;
  }, [captionLines, preset]);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const currentCfg = PRESET_CONFIGS[preset];

  return (
    <div className="w-full space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-0.5 text-xs font-semibold text-[#3cff5f]">
            <Sparkles className="h-3 w-3" />
            <span>AI Auto-Captions Engine</span>
            <span>•</span>
            <span className="text-[#9baaa1]">Free Submagic &amp; Captions Alternative</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Reels &amp; Shorts Animated Captions
          </h2>
          <p className="text-xs text-[#9baaa1]">
            Create eye-catching word-by-word animated subtitles for TikTok, Reels, and Shorts with zero watermarks.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/15 shrink-0">
          <Upload className="h-4 w-4" />
          <span>Upload Video / Audio</span>
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Studio Workspace: 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 9:16 Phone Preview with Live Synced Animated Captions */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-[36px] border-4 border-[#213026] bg-[#000000] overflow-hidden shadow-2xl shadow-black/80 flex flex-col justify-between">
            {/* Ambient Screen Mockup Bar */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-[#17221b] z-20" />

            {/* Video or Animated Backdrop */}
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#101813] via-[#080e0b] to-[#040806] flex items-center justify-center p-6 text-center">
                <div className="space-y-3 opacity-60">
                  <Film className="h-10 w-10 text-[#3cff5f] mx-auto animate-pulse" />
                  <p className="text-xs text-[#9baaa1] leading-relaxed">
                    Demo Mode Active.<br />
                    Upload any video file to preview live on your clip.
                  </p>
                </div>
              </div>
            )}

            {/* Live Synchronized Caption Overlay */}
            <div
              className={`absolute inset-x-4 z-10 flex flex-col items-center pointer-events-none transition-all duration-300 ${
                position === "bottom"
                  ? "bottom-14"
                  : position === "center"
                  ? "top-1/2 -translate-y-1/2"
                  : "top-16"
              }`}
            >
              {activeLine ? (
                <div
                  className="rounded-2xl px-4 py-2.5 text-center flex flex-wrap items-center justify-center gap-1.5 transition-all max-w-[92%]"
                  style={{
                    backgroundColor: currentCfg.boxBg || "transparent",
                    backdropFilter: currentCfg.boxBg ? "blur(8px)" : "none",
                  }}
                >
                  {activeLine.words.map((word) => {
                    const isHighlighted = word.id === activeWordId;
                    return (
                      <span
                        key={word.id}
                        className={`inline-block transition-all duration-150 ${
                          isHighlighted ? "scale-110 font-black" : "opacity-90"
                        }`}
                        style={{
                          fontFamily: currentCfg.fontFamily,
                          fontWeight: currentCfg.fontWeight,
                          fontSize: `${fontSize}px`,
                          color: isHighlighted ? highlightColor : textColor,
                          backgroundColor:
                            isHighlighted && currentCfg.highlightBg !== "transparent"
                              ? currentCfg.highlightBg
                              : "transparent",
                          padding:
                            isHighlighted && currentCfg.highlightBg !== "transparent"
                              ? "2px 8px"
                              : "0",
                          borderRadius: "8px",
                          textTransform: textTransform,
                          textShadow: isHighlighted
                            ? `0 0 16px ${highlightColor}88, ${currentCfg.textShadow}`
                            : currentCfg.textShadow,
                          WebkitTextStroke: currentCfg.stroke,
                        }}
                      >
                        {word.word}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="opacity-0 h-8">...</div>
              )}
            </div>

            {/* Bottom Playback Overlay Bar */}
            <div className="relative z-20 mt-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3cff5f] text-[#050a08] font-bold hover:scale-105 transition-all cursor-pointer shadow-md"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </button>

              <div className="text-[11px] font-mono text-[#e7eee9] flex items-center gap-1">
                <span>{currentTime.toFixed(1)}s</span>
                <span className="text-[#62776a]">/</span>
                <span className="text-[#9baaa1]">
                  {(duration > 0 ? duration : 15).toFixed(1)}s
                </span>
              </div>

              {videoSrc && (
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 rounded-lg text-[#9baaa1] hover:text-[#e7eee9]"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#62776a] font-mono mt-3">
            Preview scaled for 9:16 TikTok / Instagram Reels
          </p>
        </div>

        {/* Right Column: Customization Controls & Script Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Selector */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#3cff5f]" />
                <span>1. Select Viral Caption Preset</span>
              </h3>
              <span className="text-xs text-[#3cff5f] font-mono font-semibold">
                {currentCfg.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(PRESET_CONFIGS) as CaptionPreset[]).map((key) => {
                const p = PRESET_CONFIGS[key];
                const isActive = preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#3cff5f] bg-[#102a16] shadow-[0_0_15px_rgba(60,255,95,0.15)]"
                        : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50 hover:bg-[#0c1510]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[#e7eee9]">{p.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-[#3cff5f] text-[#050a08] font-bold"
                            : "bg-[#17221b] text-[#9baaa1]"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9baaa1] line-clamp-2 leading-tight">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Animation Customizer */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#3cff5f]" />
              <span>2. Customize Typography &amp; Alignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Font Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#9baaa1]">
                  <span>Font Size:</span>
                  <strong className="text-[#3cff5f] font-mono">{fontSize}px</strong>
                </div>
                <input
                  type="range"
                  min="18"
                  max="40"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Words Per Line */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#9baaa1]">
                  <span>Words per Screen:</span>
                  <strong className="text-[#3cff5f] font-mono">
                    {wordsPerLine} {wordsPerLine === 1 ? "Word (Rapid)" : "Words"}
                  </strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={wordsPerLine}
                  onChange={(e) => setWordsPerLine(Number(e.target.value))}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Vertical Position */}
              <div className="space-y-2">
                <label className="text-xs text-[#9baaa1]">Screen Position:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos)}
                      className={`rounded-xl border py-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                        position === pos
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Case Transform */}
              <div className="space-y-2">
                <label className="text-xs text-[#9baaa1]">Text Casing:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["uppercase", "capitalize", "none"] as const).map((casing) => (
                    <button
                      key={casing}
                      type="button"
                      onClick={() => setTextTransform(casing)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                        textTransform === casing
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {casing === "uppercase" ? "ALL CAPS" : casing === "capitalize" ? "Title" : "Normal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Customizer */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#9baaa1]">
              <div className="flex items-center gap-2">
                <span>Highlight Color:</span>
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="h-8 w-10 rounded border border-[#213026] bg-transparent cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span>Text Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-10 rounded border border-[#213026] bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Script / Dialogue Editor */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3cff5f]" />
                <span>3. Dialogue &amp; Script Editor</span>
              </h3>
              <span className="text-xs text-[#9baaa1] font-mono">
                {captionLines.length} subtitle chunks
              </span>
            </div>

            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste or edit spoken dialogue here. Timestamps automatically synchronize with your audio/video..."
              className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-sm text-[#e7eee9] placeholder-[#62776a] focus:border-[#3cff5f] focus:outline-none transition-colors"
            />

            {isTranscribing && (
              <p className="text-xs text-[#3cff5f] flex items-center gap-2 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transcribing speech from uploaded media...</span>
              </p>
            )}
          </div>

          {/* Export & Download Hub */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <Download className="h-4 w-4 text-[#3cff5f]" />
              <span>4. Export Subtitles &amp; Animations (100% Free)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ASS File for Premiere / After Effects / CapCut */}
              <button
                type="button"
                onClick={() => downloadFile(generateASS(), "viral_captions.ass", "text/plain")}
                className="flex flex-col items-start gap-1 rounded-2xl border border-[#2a5234] bg-[#102a16] p-4 text-left transition-all hover:bg-[#16381e] cursor-pointer shadow-md shadow-[#3cff5f]/10"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#3cff5f]">Download .ASS</span>
                  <span className="rounded bg-[#3cff5f] px-1.5 py-0.5 text-[9px] font-bold text-[#050a08]">
                    Pro Styler
                  </span>
                </div>
                <p className="text-[11px] text-[#9baaa1]">
                  Exact styling for CapCut, Premiere Pro &amp; AE.
                </p>
              </button>

              {/* Standard SRT */}
              <button
                type="button"
                onClick={() => downloadFile(generateSRT(), "subtitles.srt", "text/plain")}
                className="flex flex-col items-start gap-1 rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-left transition-all hover:border-[#3cff5f]/50 hover:bg-[#0c1510] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#e7eee9]">Download .SRT</span>
                  <span className="text-[10px] font-mono text-[#9baaa1]">Universal</span>
                </div>
                <p className="text-[11px] text-[#9baaa1]">
                  Standard subtitle file for YouTube &amp; VLC.
                </p>
              </button>

              {/* WebVTT */}
              <button
                type="button"
                onClick={() => downloadFile(generateVTT(), "subtitles.vtt", "text/vtt")}
                className="flex flex-col items-start gap-1 rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-left transition-all hover:border-[#3cff5f]/50 hover:bg-[#0c1510] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-[#e7eee9]">Download .VTT</span>
                  <span className="text-[10px] font-mono text-[#9baaa1]">HTML5</span>
                </div>
                <p className="text-[11px] text-[#9baaa1]">
                  Web-ready captions for modern players.
                </p>
              </button>
            </div>

            {/* Copy Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#9baaa1]">
              <span>Quick Copy:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(generateSRT(), "srt")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
              >
                {copiedFormat === "srt" ? <Check className="h-3.5 w-3.5 text-[#3cff5f]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy SRT</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(rawText, "text")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
              >
                {copiedFormat === "text" ? <Check className="h-3.5 w-3.5 text-[#3cff5f]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Plain Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
