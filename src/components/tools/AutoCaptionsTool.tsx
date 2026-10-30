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
  FileCode,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";

export interface CaptionWord {
  id: string;
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface CaptionCue {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
  words: CaptionWord[];
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

// Initial Demo Cues
const INITIAL_DEMO_CUES: CaptionCue[] = [
  {
    id: "cue-1",
    start: 0.5,
    end: 2.8,
    text: "Welcome to the ultimate auto caption generator",
    words: [
      { id: "c1-w0", word: "Welcome", start: 0.5, end: 0.9 },
      { id: "c1-w1", word: "to", start: 0.9, end: 1.1 },
      { id: "c1-w2", word: "the", start: 1.1, end: 1.3 },
      { id: "c1-w3", word: "ultimate", start: 1.3, end: 1.8 },
      { id: "c1-w4", word: "auto", start: 1.8, end: 2.2 },
      { id: "c1-w5", word: "caption", start: 2.2, end: 2.5 },
      { id: "c1-w6", word: "generator", start: 2.5, end: 2.8 },
    ],
  },
  {
    id: "cue-2",
    start: 3.2,
    end: 5.8,
    text: "Create viral animated subtitles in seconds",
    words: [
      { id: "c2-w0", word: "Create", start: 3.2, end: 3.6 },
      { id: "c2-w1", word: "viral", start: 3.6, end: 4.1 },
      { id: "c2-w2", word: "animated", start: 4.1, end: 4.7 },
      { id: "c2-w3", word: "subtitles", start: 4.7, end: 5.3 },
      { id: "c2-w4", word: "in", start: 5.3, end: 5.5 },
      { id: "c2-w5", word: "seconds", start: 5.5, end: 5.8 },
    ],
  },
  {
    id: "cue-3",
    start: 6.2,
    end: 9.5,
    text: "Upload your SRT file or auto-transcribe directly",
    words: [
      { id: "c3-w0", word: "Upload", start: 6.2, end: 6.7 },
      { id: "c3-w1", word: "your", start: 6.7, end: 7.0 },
      { id: "c3-w2", word: "SRT", start: 7.0, end: 7.6 },
      { id: "c3-w3", word: "file", start: 7.6, end: 8.0 },
      { id: "c3-w4", word: "or", start: 8.0, end: 8.2 },
      { id: "c3-w5", word: "auto-transcribe", start: 8.2, end: 8.9 },
      { id: "c3-w6", word: "directly", start: 8.9, end: 9.5 },
    ],
  },
];

// Helper: Parse raw SRT text into CaptionCue array
export function parseSRTToCues(srtContent: string): CaptionCue[] {
  const normalized = srtContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const blocks = normalized.split(/\n\s*\n/);
  const cues: CaptionCue[] = [];

  const parseTime = (t: string) => {
    const parts = t.replace(",", ".").split(":");
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return 0;
  };

  for (let idx = 0; idx < blocks.length; idx++) {
    const lines = blocks[idx].split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const timeIndex = lines.findIndex((l) => l.includes("-->"));
    if (timeIndex === -1) continue;

    const [startStr, endStr] = lines[timeIndex].split("-->").map((s) => s.trim());
    const textLines = lines.slice(timeIndex + 1);
    const cleanText = textLines.join(" ").replace(/<[^>]+>/g, "").trim();

    const start = parseTime(startStr);
    const end = parseTime(endStr);

    if (end > start && cleanText) {
      const words = cleanText.split(/\s+/).filter(Boolean);
      const duration = end - start;
      const wordDur = words.length > 0 ? duration / words.length : 0;

      const wordsList: CaptionWord[] = words.map((w, wIdx) => ({
        id: `cue-${idx}-w${wIdx}`,
        word: w,
        start: start + wIdx * wordDur,
        end: start + (wIdx + 1) * wordDur,
      }));

      cues.push({
        id: `cue-${idx}`,
        start,
        end,
        text: cleanText,
        words: wordsList,
      });
    }
  }

  return cues;
}

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

  // Caption Cues State
  const [cues, setCues] = useState<CaptionCue[]>(INITIAL_DEMO_CUES);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeStatus, setTranscribeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cues" | "raw">("cues");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const srtInputRef = useRef<HTMLInputElement | null>(null);

  // Sync preset changes with controls
  const handlePresetSelect = (p: CaptionPreset) => {
    setPreset(p);
    const cfg = PRESET_CONFIGS[p];
    setFontSize(cfg.fontSize);
    setHighlightColor(cfg.highlightColor);
    setTextColor(cfg.textColor);
    setTextTransform(cfg.textTransform);
  };

  // Find currently active cue and active word based on currentTime
  const activeCue = useMemo(() => {
    return cues.find((c) => currentTime >= c.start && currentTime <= c.end);
  }, [cues, currentTime]);

  const activeWordId = useMemo(() => {
    if (!activeCue) return null;
    const match = activeCue.words.find(
      (w) => currentTime >= w.start && currentTime <= w.end
    );
    return match ? match.id : activeCue.words[0]?.id;
  }, [activeCue, currentTime]);

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

    // Auto-transcribe media
    triggerAutoTranscribe(file);
  };

  // Handle SRT / VTT File Upload
  const handleSRTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseSRTToCues(content);
        if (parsed.length > 0) {
          setCues(parsed);
          setTranscribeStatus(`Successfully loaded ${parsed.length} subtitle cues from ${file.name}`);
          setTimeout(() => setTranscribeStatus(null), 4000);
        } else {
          alert("Could not parse valid SRT/VTT timestamps from this file. Please verify the subtitle format.");
        }
      }
    };
    reader.readAsText(file);
  };

  // Automatic Speech-to-Text via Server API
  const triggerAutoTranscribe = async (targetFile?: File) => {
    const fileToTranscribe = targetFile || videoFile;
    if (!fileToTranscribe) {
      alert("Please upload a video or audio file first.");
      return;
    }

    setIsTranscribing(true);
    setTranscribeStatus("Extracting audio & transcribing speech with AI...");

    try {
      const formData = new FormData();
      formData.append("file", fileToTranscribe);
      formData.append("filename", fileToTranscribe.name);

      const res = await fetch("/api/tools/transcribe-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.snippets && data.snippets.length > 0) {
        // Convert API snippets into CaptionCue
        const newCues: CaptionCue[] = data.snippets.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (s: { start: number; duration: number; text: string }, idx: number) => {
            const start = s.start;
            const end = s.start + (s.duration || 3);
            const cleanText = s.text.trim();
            const words = cleanText.split(/\s+/).filter(Boolean);
            const dur = end - start;
            const wordDur = words.length > 0 ? dur / words.length : 0;

            const wordsList: CaptionWord[] = words.map((w: string, wIdx: number) => ({
              id: `api-cue-${idx}-w${wIdx}`,
              word: w,
              start: start + wIdx * wordDur,
              end: start + (wIdx + 1) * wordDur,
            }));

            return {
              id: `api-cue-${idx}`,
              start,
              end,
              text: cleanText,
              words: wordsList,
            };
          }
        );

        setCues(newCues);
        setTranscribeStatus(`AI Speech-to-Text completed: ${newCues.length} lines ready!`);
        setTimeout(() => setTranscribeStatus(null), 4000);
        setIsTranscribing(false);
        return;
      } else if (res.ok && data.srt) {
        const parsed = parseSRTToCues(data.srt);
        if (parsed.length > 0) {
          setCues(parsed);
          setTranscribeStatus(`AI Speech-to-Text completed: ${parsed.length} lines ready!`);
          setTimeout(() => setTranscribeStatus(null), 4000);
          setIsTranscribing(false);
          return;
        }
      }

      setTranscribeStatus("Could not extract speech automatically. You can upload an .SRT file or edit dialogue below.");
    } catch (err: unknown) {
      console.warn("Transcribe error:", err);
      setTranscribeStatus("Auto-transcribe service busy. Please upload an .SRT file or type your dialogue below.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Video Time Update
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

  // Seek video to specific cue timestamp
  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Virtual playback loop when no video uploaded
  useEffect(() => {
    if (!videoSrc && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          const max = duration > 0 ? duration : cues[cues.length - 1]?.end + 1 || 12;
          if (prev >= max) {
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [videoSrc, isPlaying, duration, cues]);

  // Export Formats
  const generateSRT = useCallback(() => {
    const formatTime = (sec: number) => {
      const ms = Math.floor((sec % 1) * 1000);
      const totalSec = Math.floor(sec);
      const s = totalSec % 60;
      const m = Math.floor(totalSec / 60) % 60;
      const h = Math.floor(totalSec / 3600);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
    };

    return cues
      .map((c, idx) => {
        return `${idx + 1}\n${formatTime(c.start)} --> ${formatTime(c.end)}\n${c.text}\n`;
      })
      .join("\n");
  }, [cues]);

  const generateVTT = useCallback(() => {
    const srt = generateSRT();
    return `WEBVTT\n\n${srt.replace(/,/g, ".")}`;
  }, [generateSRT]);

  // ASS format for Premiere Pro / After Effects / CapCut
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
${cues
  .map((c) => {
    const fmt = (sec: number) => {
      const cs = Math.floor((sec % 1) * 100);
      const totalSec = Math.floor(sec);
      const s = totalSec % 60;
      const m = Math.floor(totalSec / 60) % 60;
      const h = Math.floor(totalSec / 3600);
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    };
    return `Dialogue: 0,${fmt(c.start)},${fmt(c.end)},Default,,0,0,0,,${c.text.toUpperCase()}`;
  })
  .join("\n")}
`;
  }, [cues, preset]);

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
      {/* Top Banner & Upload Toolbar */}
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
            Upload your video and auto-transcribe speech, or upload an existing .SRT subtitle file for instant animated styling.
          </p>
        </div>

        {/* Dual Upload Buttons: Video + SRT */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Upload Video Button */}
          <label className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/15">
            <Upload className="h-4 w-4" />
            <span>Upload Video / Audio</span>
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>

          {/* Upload SRT / VTT Button */}
          <button
            type="button"
            onClick={() => srtInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#2a5234] bg-[#102a16] px-5 py-3 text-xs sm:text-sm font-bold text-[#3cff5f] hover:bg-[#16381e] transition-all cursor-pointer shadow-md"
          >
            <FileCode className="h-4 w-4" />
            <span>Upload .SRT / .VTT</span>
            <input
              ref={srtInputRef}
              type="file"
              accept=".srt,.vtt,text/plain"
              onChange={handleSRTUpload}
              className="hidden"
            />
          </button>
        </div>
      </div>

      {/* Status Alert Banner if transcribing or loaded */}
      {transcribeStatus && (
        <div className="rounded-2xl border border-[#2a5234] bg-[#102a16] p-4 text-xs font-semibold text-[#3cff5f] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>{transcribeStatus}</span>
          </div>
          {videoFile && !isTranscribing && (
            <button
              type="button"
              onClick={() => triggerAutoTranscribe()}
              className="underline hover:text-white"
            >
              Re-run AI Transcribe
            </button>
          )}
        </div>
      )}

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
                    Upload any video or .SRT file to preview live on your clip.
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
              {activeCue ? (
                <div
                  className="rounded-2xl px-4 py-2.5 text-center flex flex-wrap items-center justify-center gap-1.5 transition-all max-w-[92%]"
                  style={{
                    backgroundColor: currentCfg.boxBg || "transparent",
                    backdropFilter: currentCfg.boxBg ? "blur(8px)" : "none",
                  }}
                >
                  {activeCue.words.map((word) => {
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
                  {(duration > 0 ? duration : cues[cues.length - 1]?.end || 12).toFixed(1)}s
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

          {videoFile && (
            <button
              type="button"
              onClick={() => triggerAutoTranscribe()}
              disabled={isTranscribing}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-4 py-2 text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isTranscribing ? "Transcribing Speech..." : "Re-Transcribe Video with AI"}</span>
            </button>
          )}

          <p className="text-[11px] text-[#62776a] font-mono mt-2">
            Scaled for 9:16 TikTok / Instagram Reels
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

          {/* Typography & Position Customizer */}
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

              {/* Color Customizer */}
              <div className="space-y-2">
                <label className="text-xs text-[#9baaa1]">Colors:</label>
                <div className="flex items-center gap-4 text-xs text-[#9baaa1]">
                  <div className="flex items-center gap-2">
                    <span>Active:</span>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="h-8 w-8 rounded border border-[#213026] bg-transparent cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Base:</span>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-8 w-8 rounded border border-[#213026] bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Dialogue & Timeline Editor */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3cff5f]" />
                <span>3. Subtitle Cues &amp; Timestamps</span>
              </h3>

              {/* View Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-[#080e0b] p-1 border border-[#213026]">
                <button
                  type="button"
                  onClick={() => setActiveTab("cues")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    activeTab === "cues"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#9baaa1] hover:text-[#e7eee9]"
                  }`}
                >
                  Timeline Cues ({cues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("raw")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    activeTab === "raw"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#9baaa1] hover:text-[#e7eee9]"
                  }`}
                >
                  Raw SRT
                </button>
              </div>
            </div>

            {/* Tab 1: Timeline Cue Cards with Click-to-Seek */}
            {activeTab === "cues" ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cues.map((cue, idx) => {
                  const isCurrent = activeCue?.id === cue.id;
                  return (
                    <div
                      key={cue.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all ${
                        isCurrent
                          ? "border-[#3cff5f] bg-[#102a16]/90 shadow-sm"
                          : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/40"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => seekTo(cue.start)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#17221b] px-2 py-1 text-[11px] font-mono text-[#3cff5f] hover:bg-[#3cff5f] hover:text-[#050a08] transition-all cursor-pointer shrink-0"
                        title="Seek video to this cue"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{cue.start.toFixed(1)}s - {cue.end.toFixed(1)}s</span>
                      </button>

                      <input
                        type="text"
                        value={cue.text}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setCues((prev) =>
                            prev.map((c) => {
                              if (c.id !== cue.id) return c;
                              const words = newText.split(/\s+/).filter(Boolean);
                              const dur = c.end - c.start;
                              const wDur = words.length > 0 ? dur / words.length : 0;
                              return {
                                ...c,
                                text: newText,
                                words: words.map((w, wIdx) => ({
                                  id: `${c.id}-w${wIdx}`,
                                  word: w,
                                  start: c.start + wIdx * wDur,
                                  end: c.start + (wIdx + 1) * wDur,
                                })),
                              };
                            })
                          );
                        }}
                        className="flex-1 bg-transparent text-xs text-[#e7eee9] focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setCues((prev) => prev.filter((c) => c.id !== cue.id));
                        }}
                        className="p-1 text-[#62776a] hover:text-red-400"
                        title="Delete cue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tab 2: Raw SRT Editor */
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={generateSRT()}
                  onChange={(e) => {
                    const parsed = parseSRTToCues(e.target.value);
                    if (parsed.length > 0) {
                      setCues(parsed);
                    }
                  }}
                  placeholder="Paste standard SRT code with timecodes here..."
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] p-4 font-mono text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>
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

            {/* Quick Copy */}
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
                onClick={() => copyToClipboard(cues.map((c) => c.text).join(" "), "text")}
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
