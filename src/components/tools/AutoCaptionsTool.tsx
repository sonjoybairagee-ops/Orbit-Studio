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
  Trash2,
  Search,
  Flame,
  Zap,
  Eye,
  EyeOff,
  Layers,
  Compass,
  AlignLeft,
  AlignCenter,
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

export interface CaptionChunk {
  id: string;
  cueId: string;
  start: number;
  end: number;
  words: CaptionWord[];
}

export type PresetCategory = "all" | "creators" | "social" | "cinematic" | "gaming";
export type AnimationType = "pop" | "bounce" | "glow" | "glitch" | "float" | "shake" | "simple";
export type BgMode = "none" | "pill" | "highlight-only" | "card";
export type WordsPerScreenOption = "1" | "2" | "3" | "4" | "5" | "6" | "all";
export type MaxLinesOption = "1" | "2" | "auto";

export interface PresetConfig {
  id: string;
  name: string;
  category: "creators" | "social" | "cinematic" | "gaming";
  badge: string;
  desc: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  highlightBg: string;
  textTransform: "uppercase" | "capitalize" | "none";
  textShadow: string;
  stroke: string;
  boxBg: string;
  bgMode: BgMode;
  animation: AnimationType;
}

// 36 Comprehensive Viral Animation Presets
export const PRESET_CONFIGS: Record<string, PresetConfig> = {
  // 1. Creator Icons (10 Presets)
  hormozi: {
    id: "hormozi",
    name: "Hormozi Classic",
    category: "creators",
    badge: "Most Viral",
    desc: "Heavy bold uppercase with intense yellow active word and high-contrast backdrop.",
    fontFamily: "'Montserrat', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFFFFF",
    highlightColor: "#FFE600",
    highlightBg: "#000000",
    textTransform: "uppercase",
    textShadow: "0 4px 14px rgba(0,0,0,0.95)",
    stroke: "2px #000000",
    boxBg: "rgba(0, 0, 0, 0.75)",
    bgMode: "pill",
    animation: "pop",
  },
  "hormozi-red": {
    id: "hormozi-red",
    name: "Hormozi Red Punch",
    category: "creators",
    badge: "High Impact",
    desc: "Punchy bold font with bright crimson red highlight for urgency and retention.",
    fontFamily: "'Montserrat', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFFFFF",
    highlightColor: "#FF2244",
    highlightBg: "#000000",
    textTransform: "uppercase",
    textShadow: "0 4px 12px rgba(0,0,0,0.9)",
    stroke: "2px #000000",
    boxBg: "rgba(0, 0, 0, 0.75)",
    bgMode: "pill",
    animation: "pop",
  },
  beast: {
    id: "beast",
    name: "MrBeast Comic Pop",
    category: "creators",
    badge: "High Energy",
    desc: "Iconic scale-bouncing cyan and yellow comic typography with heavy black outer stroke.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 30,
    textColor: "#FFFFFF",
    highlightColor: "#00F0FF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 18px rgba(0, 240, 255, 0.85), 0 4px 10px #000000",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
  "beast-gold": {
    id: "beast-gold",
    name: "MrBeast Electric Gold",
    category: "creators",
    badge: "Challenge",
    desc: "Electrifying golden yellow bounce font tailored for challenge and giveaway shorts.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 30,
    textColor: "#FFFFFF",
    highlightColor: "#FFD700",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 20px rgba(255, 215, 0, 0.9), 0 4px 12px #000",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
  "ali-abdaal": {
    id: "ali-abdaal",
    name: "Ali Abdaal Clean",
    category: "creators",
    badge: "Productivity",
    desc: "Clean minimal Inter font with an authentic neon yellow marker highlighter box.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "700",
    fontSize: 23,
    textColor: "#FFFFFF",
    highlightColor: "#000000",
    highlightBg: "#FFE500",
    textTransform: "none",
    textShadow: "0 2px 8px rgba(0,0,0,0.7)",
    stroke: "none",
    boxBg: "rgba(0, 0, 0, 0.5)",
    bgMode: "highlight-only",
    animation: "simple",
  },
  goggins: {
    id: "goggins",
    name: "David Goggins Grit",
    category: "creators",
    badge: "Motivation",
    desc: "Aggressive condensed bold typography with stark blood-orange word pop.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 29,
    textColor: "#F0F0F0",
    highlightColor: "#FF3B30",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 4px 14px #000000",
    stroke: "2px #000000",
    boxBg: "rgba(10, 10, 10, 0.8)",
    bgMode: "pill",
    animation: "shake",
  },
  "iman-gadzhi": {
    id: "iman-gadzhi",
    name: "Iman Gadzhi Luxury",
    category: "creators",
    badge: "Aesthetic",
    desc: "Cinematic elegant serif styling with warm champagne gold active word glow.",
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontWeight: "700",
    fontSize: 24,
    textColor: "#EAEAEA",
    highlightColor: "#F3E5AB",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 0 16px rgba(243, 229, 171, 0.75), 0 2px 8px #000",
    stroke: "none",
    boxBg: "rgba(15, 12, 10, 0.7)",
    bgMode: "pill",
    animation: "glow",
  },
  cattoni: {
    id: "cattoni",
    name: "Alex Cattoni Punch",
    category: "creators",
    badge: "Copywriting",
    desc: "Modern punchy sans font with hot electric magenta highlight.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: 25,
    textColor: "#FFFFFF",
    highlightColor: "#FF007F",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(255, 0, 127, 0.8), 0 3px 8px #000",
    stroke: "2px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "pop",
  },
  "logan-paul": {
    id: "logan-paul",
    name: "Logan Paul Energy",
    category: "creators",
    badge: "Vlog Punch",
    desc: "Vibrant neon orange uppercase text with comic drop shadow and spring scale.",
    fontFamily: "'Impact', sans-serif",
    fontWeight: "900",
    fontSize: 29,
    textColor: "#FFFFFF",
    highlightColor: "#FF6B00",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 4px 10px #000000, 0 0 16px rgba(255, 107, 0, 0.7)",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
  "sam-sulek": {
    id: "sam-sulek",
    name: "Sam Sulek Raw",
    category: "creators",
    badge: "Brutalist",
    desc: "Raw heavy brutalist sans typography with stark yellow accent and zero box distractions.",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 27,
    textColor: "#FFFFFF",
    highlightColor: "#FFF500",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 3px 6px #000000",
    stroke: "2px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "pop",
  },

  // 2. TikTok & Reels Trends (10 Presets)
  tiktok: {
    id: "tiktok",
    name: "TikTok Classic",
    category: "social",
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
    boxBg: "transparent",
    bgMode: "none",
    animation: "pop",
  },
  emerald: {
    id: "emerald",
    name: "CompX Emerald Glow",
    category: "social",
    badge: "Cyber Aesthetic",
    desc: "Sleek dark neon green capsule pill with smooth laser word illumination.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "800",
    fontSize: 24,
    textColor: "#E7EEE9",
    highlightColor: "#3CFF5F",
    highlightBg: "rgba(16, 42, 22, 0.85)",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(60, 255, 95, 0.75)",
    stroke: "none",
    boxBg: "rgba(12, 21, 16, 0.85)",
    bgMode: "pill",
    animation: "glow",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    category: "social",
    badge: "Sci-Fi Glitch",
    desc: "High-voltage neon yellow and cyan text with subtle chromatic glitch pop.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFEE00",
    highlightColor: "#00FFFF",
    highlightBg: "rgba(0,0,0,0.9)",
    textTransform: "uppercase",
    textShadow: "0 0 16px #00ffff, 0 0 30px #ffee00",
    stroke: "2px #000000",
    boxBg: "rgba(10, 10, 15, 0.85)",
    bgMode: "pill",
    animation: "glitch",
  },
  "y2k-pop": {
    id: "y2k-pop",
    name: "Y2K Retro Pop",
    category: "social",
    badge: "Gen Z Aesthetic",
    desc: "Hot pink and candy violet bouncing scale font with playful shadow.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: 27,
    textColor: "#FFFFFF",
    highlightColor: "#FF1493",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(255, 20, 147, 0.8), 0 4px 8px #000",
    stroke: "2px #3A003A",
    boxBg: "rgba(40, 0, 30, 0.6)",
    bgMode: "pill",
    animation: "bounce",
  },
  karaoke: {
    id: "karaoke",
    name: "Karaoke Word Fill",
    category: "social",
    badge: "Sing-Along",
    desc: "Smooth color transition that illuminates words precisely in sync with vocal cadence.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "800",
    fontSize: 25,
    textColor: "rgba(255,255,255,0.6)",
    highlightColor: "#FFE600",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    stroke: "1px #000000",
    boxBg: "rgba(0,0,0,0.65)",
    bgMode: "pill",
    animation: "pop",
  },
  bouncy: {
    id: "bouncy",
    name: "Bouncy Ball Pop",
    category: "social",
    badge: "Playful Spring",
    desc: "Elastic physics-based bouncing spring scale that jumps dynamically on spoken keywords.",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "800",
    fontSize: 26,
    textColor: "#FFFFFF",
    highlightColor: "#FFDE59",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 4px 10px rgba(0,0,0,0.85)",
    stroke: "2px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
  "submagic-lime": {
    id: "submagic-lime",
    name: "Submagic Viral Lime",
    category: "social",
    badge: "Submagic Style",
    desc: "Vivid neon lime green highlight with dark rounded backdrop, popular across 2026 Shorts.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: 27,
    textColor: "#FFFFFF",
    highlightColor: "#A6FF00",
    highlightBg: "rgba(10, 20, 10, 0.9)",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(166, 255, 0, 0.75)",
    stroke: "2px #000000",
    boxBg: "rgba(0, 0, 0, 0.75)",
    bgMode: "pill",
    animation: "pop",
  },
  "capcut-fire": {
    id: "capcut-fire",
    name: "CapCut Fire Flame",
    category: "social",
    badge: "Trending Flame",
    desc: "Fiery hot ember gradient glow with bold impact stroke, famous on CapCut templates.",
    fontFamily: "'Impact', sans-serif",
    fontWeight: "900",
    fontSize: 29,
    textColor: "#FFFFFF",
    highlightColor: "#FF4500",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 20px #ff4500, 0 4px 8px #000",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "pop",
  },
  "glitch-wave": {
    id: "glitch-wave",
    name: "Glitch RGB Split",
    category: "social",
    badge: "Cyber Glitch",
    desc: "Cyan and red RGB optical aberration that flickers on high-intensity words.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: 26,
    textColor: "#FFFFFF",
    highlightColor: "#00F0FF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "-2px 0 #ff0055, 2px 0 #00ffff",
    stroke: "1px #000",
    boxBg: "rgba(0,0,0,0.6)",
    bgMode: "pill",
    animation: "glitch",
  },
  "floating-words": {
    id: "floating-words",
    name: "Floating Motion",
    category: "social",
    badge: "Smooth Wave",
    desc: "Gentle vertical floating wave that lifts words gracefully as they are voiced.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "800",
    fontSize: 24,
    textColor: "#FFFFFF",
    highlightColor: "#7000FF",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 0 14px rgba(112, 0, 255, 0.8), 0 3px 6px #000",
    stroke: "1px #000",
    boxBg: "rgba(0,0,0,0.5)",
    bgMode: "pill",
    animation: "float",
  },

  // 3. Cinematic, Documentary & Minimal (8 Presets)
  documentary: {
    id: "documentary",
    name: "Documentary Vox",
    category: "cinematic",
    badge: "Explainer",
    desc: "Classic yellow news & explainer subtitle typography with clean drop shadow.",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    fontWeight: "700",
    fontSize: 24,
    textColor: "#FFFFFF",
    highlightColor: "#FFE600",
    highlightBg: "transparent",
    textTransform: "none",
    textShadow: "0 2px 8px rgba(0,0,0,0.9)",
    stroke: "1px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "simple",
  },
  netflix: {
    id: "netflix",
    name: "Netflix Original",
    category: "cinematic",
    badge: "Cinema Standard",
    desc: "Crisp off-white Helvetica with genuine theatrical drop shadow and zero borders.",
    fontFamily: "'Arial', 'Helvetica', sans-serif",
    fontWeight: "600",
    fontSize: 23,
    textColor: "#F5F5F5",
    highlightColor: "#FFFFFF",
    highlightBg: "transparent",
    textTransform: "none",
    textShadow: "0 2px 6px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.8)",
    stroke: "none",
    boxBg: "transparent",
    bgMode: "none",
    animation: "simple",
  },
  "minimal-white": {
    id: "minimal-white",
    name: "Minimalist Studio",
    category: "cinematic",
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
    bgMode: "pill",
    animation: "simple",
  },
  "vlog-casual": {
    id: "vlog-casual",
    name: "Cozy Vlog Pastel",
    category: "cinematic",
    badge: "Casual Lifestyle",
    desc: "Rounded friendly font with soft peach highlight for daily vlogs and travel shorts.",
    fontFamily: "'Nunito', 'Poppins', sans-serif",
    fontWeight: "700",
    fontSize: 24,
    textColor: "#FFFFFF",
    highlightColor: "#FFA07A",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 3px 8px rgba(0,0,0,0.7)",
    stroke: "none",
    boxBg: "rgba(20, 15, 15, 0.65)",
    bgMode: "pill",
    animation: "pop",
  },
  podcast: {
    id: "podcast",
    name: "Studio Podcast Blue",
    category: "cinematic",
    badge: "Audio & Talk",
    desc: "Sleek podcast interview captioning with calming ice-blue active word accent.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "700",
    fontSize: 23,
    textColor: "#E2E8F0",
    highlightColor: "#60A5FA",
    highlightBg: "transparent",
    textTransform: "none",
    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
    stroke: "none",
    boxBg: "rgba(15, 23, 42, 0.8)",
    bgMode: "pill",
    animation: "glow",
  },
  highlighter: {
    id: "highlighter",
    name: "Highlighter Marker Bar",
    category: "cinematic",
    badge: "Study & Book",
    desc: "Black text against a fluorescent yellow highlighter box strip, perfect for book summaries.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: 24,
    textColor: "#FFFFFF",
    highlightColor: "#050505",
    highlightBg: "#FFFF00",
    textTransform: "none",
    textShadow: "none",
    stroke: "none",
    boxBg: "rgba(0, 0, 0, 0.7)",
    bgMode: "highlight-only",
    animation: "pop",
  },
  nordic: {
    id: "nordic",
    name: "Nordic Monochrome",
    category: "cinematic",
    badge: "Architectural",
    desc: "Stark minimalist pitch-black capsule with ultra-bright pristine white text.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "900",
    fontSize: 23,
    textColor: "#888888",
    highlightColor: "#FFFFFF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "none",
    stroke: "none",
    boxBg: "#000000",
    bgMode: "pill",
    animation: "pop",
  },
  "cinematic-gold": {
    id: "cinematic-gold",
    name: "35mm Film Gold",
    category: "cinematic",
    badge: "Vintage Film",
    desc: "Warm filmic golden subtitle font with soft theatrical letterboxing.",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "700",
    fontSize: 24,
    textColor: "#FAF3E0",
    highlightColor: "#E6C280",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 3px 10px rgba(0,0,0,0.9)",
    stroke: "none",
    boxBg: "rgba(0,0,0,0.5)",
    bgMode: "none",
    animation: "glow",
  },

  // 4. Gaming, Motion Graphics & Visual FX (8 Presets)
  matrix: {
    id: "matrix",
    name: "Matrix Terminal Green",
    category: "gaming",
    badge: "Code & Hacker",
    desc: "Monospaced terminal phosphor glow with green CRT scanline ambiance.",
    fontFamily: "'Courier New', monospace",
    fontWeight: "700",
    fontSize: 23,
    textColor: "#00FF66",
    highlightColor: "#FFFFFF",
    highlightBg: "#003311",
    textTransform: "uppercase",
    textShadow: "0 0 14px #00ff66, 0 0 25px #00ff66",
    stroke: "none",
    boxBg: "rgba(0, 15, 5, 0.85)",
    bgMode: "pill",
    animation: "glow",
  },
  valorant: {
    id: "valorant",
    name: "Valorant Radiant",
    category: "gaming",
    badge: "FPS Gaming",
    desc: "Aggressive sharp angular esports typography with radiant laser cyan.",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFFFFF",
    highlightColor: "#00FFFF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 18px #00ffff, 0 4px 8px #000",
    stroke: "2px #000000",
    boxBg: "rgba(10, 20, 25, 0.75)",
    bgMode: "pill",
    animation: "pop",
  },
  "apex-red": {
    id: "apex-red",
    name: "Apex Legends Red",
    category: "gaming",
    badge: "Battle Royale",
    desc: "Industrial combat red highlight with heavy dark outline, built for gaming highlights.",
    fontFamily: "'Impact', sans-serif",
    fontWeight: "900",
    fontSize: 28,
    textColor: "#FFFFFF",
    highlightColor: "#FF2E4C",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 16px rgba(255, 46, 76, 0.8), 0 3px 8px #000",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "shake",
  },
  "anime-speed": {
    id: "anime-speed",
    name: "Anime Manga Action",
    category: "gaming",
    badge: "Waifu2x Style",
    desc: "High-contrast action comic styling with double outline for anime edits and AMVs.",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: "900",
    fontSize: 27,
    textColor: "#FFFFFF",
    highlightColor: "#FFE600",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 12px rgba(255,230,0,0.8), 0 4px 8px #000",
    stroke: "3px #000000",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
  "electric-violet": {
    id: "electric-violet",
    name: "Neon Violet Wave",
    category: "gaming",
    badge: "Synthwave",
    desc: "Deep ultraviolet neon glow that radiates with smooth pulsing animations.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: 26,
    textColor: "#FFFFFF",
    highlightColor: "#B026FF",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 20px #b026ff, 0 4px 10px #000",
    stroke: "2px #000",
    boxBg: "rgba(20, 5, 30, 0.75)",
    bgMode: "pill",
    animation: "glow",
  },
  "golden-trophy": {
    id: "golden-trophy",
    name: "24K Gold Champion",
    category: "gaming",
    badge: "Victory Royale",
    desc: "Metallic shimmering gold gradient text shadow for clutch plays and winning moments.",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: 27,
    textColor: "#FFF9E6",
    highlightColor: "#FFCC00",
    highlightBg: "transparent",
    textTransform: "uppercase",
    textShadow: "0 0 18px rgba(255, 204, 0, 0.9), 0 4px 10px #000",
    stroke: "2px #4A3B00",
    boxBg: "rgba(25, 20, 5, 0.7)",
    bgMode: "pill",
    animation: "pop",
  },
  "sunset-coral": {
    id: "sunset-coral",
    name: "Sunset Horizon",
    category: "gaming",
    badge: "Warm Coral",
    desc: "Vibrant coral-orange with dusk magenta shadow, great for aesthetic edits.",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "800",
    fontSize: 25,
    textColor: "#FFFFFF",
    highlightColor: "#FF6F61",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 0 16px rgba(255, 111, 97, 0.8), 0 3px 8px #000",
    stroke: "1px #000",
    boxBg: "rgba(30, 10, 15, 0.65)",
    bgMode: "pill",
    animation: "pop",
  },
  bubblegum: {
    id: "bubblegum",
    name: "Bubblegum Sugar",
    category: "gaming",
    badge: "Pastel Pop",
    desc: "Playful bubble pastel pink and sky blue bounce font for cute and wholesome clips.",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "800",
    fontSize: 26,
    textColor: "#FFFFFF",
    highlightColor: "#FF66B2",
    highlightBg: "transparent",
    textTransform: "capitalize",
    textShadow: "0 0 14px rgba(255, 102, 178, 0.8), 0 3px 6px #000",
    stroke: "2px #4A0033",
    boxBg: "transparent",
    bgMode: "none",
    animation: "bounce",
  },
};

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
  const [preset, setPreset] = useState<string>("hormozi");
  const [presetCategory, setPresetCategory] = useState<PresetCategory>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pacing & Chunking Controls
  const [wordsPerScreen, setWordsPerScreen] = useState<WordsPerScreenOption>("3");
  const [maxLines, setMaxLines] = useState<MaxLinesOption>("2");

  // Background Customization Controls
  const [bgMode, setBgMode] = useState<BgMode>("pill");
  const [boxBgColor, setBoxBgColor] = useState<string>("#000000");
  const [boxBgOpacity, setBoxBgOpacity] = useState<number>(75);

  // Typography controls
  const [fontSize, setFontSize] = useState<number>(26);
  const [position, setPosition] = useState<"bottom" | "center" | "top">("bottom");
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
  const handlePresetSelect = (presetId: string) => {
    setPreset(presetId);
    const cfg = PRESET_CONFIGS[presetId];
    if (!cfg) return;

    setFontSize(cfg.fontSize);
    setHighlightColor(cfg.highlightColor);
    setTextColor(cfg.textColor);
    setTextTransform(cfg.textTransform);
    setBgMode(cfg.bgMode);

    // Parse boxBg if present
    if (cfg.boxBg.startsWith("rgba(")) {
      setBoxBgColor("#000000");
      setBoxBgOpacity(75);
    } else if (cfg.boxBg === "transparent") {
      setBoxBgOpacity(0);
    }
  };

  // Find currently active cue based on currentTime
  const activeCue = useMemo(() => {
    return cues.find((c) => currentTime >= c.start && currentTime <= c.end);
  }, [cues, currentTime]);

  // Find currently active word within active cue
  const activeWordId = useMemo(() => {
    if (!activeCue) return null;
    const match = activeCue.words.find(
      (w) => currentTime >= w.start && currentTime <= w.end
    );
    return match ? match.id : activeCue.words[0]?.id;
  }, [activeCue, currentTime]);

  // Chunking Logic: Slice cue words into chunk intervals based on wordsPerScreen
  const activeChunk = useMemo<CaptionChunk | null>(() => {
    if (!activeCue) return null;

    if (wordsPerScreen === "all") {
      return {
        id: `${activeCue.id}-all`,
        cueId: activeCue.id,
        start: activeCue.start,
        end: activeCue.end,
        words: activeCue.words,
      };
    }

    const wCount = parseInt(wordsPerScreen, 10) || 3;
    const chunks: CaptionChunk[] = [];

    for (let i = 0; i < activeCue.words.length; i += wCount) {
      const chunkWords = activeCue.words.slice(i, i + wCount);
      if (chunkWords.length > 0) {
        chunks.push({
          id: `${activeCue.id}-chk-${i}`,
          cueId: activeCue.id,
          start: chunkWords[0].start,
          end: chunkWords[chunkWords.length - 1].end,
          words: chunkWords,
        });
      }
    }

    // Return the chunk containing currentTime
    const currentChunk = chunks.find(
      (chk) => currentTime >= chk.start && currentTime <= chk.end
    );
    if (currentChunk) return currentChunk;

    // Fallback: chunk containing activeWordId, or first chunk
    const chunkWithActiveWord = chunks.find((chk) =>
      chk.words.some((w) => w.id === activeWordId)
    );
    return chunkWithActiveWord || chunks[0] || null;
  }, [activeCue, currentTime, wordsPerScreen, activeWordId]);

  // Filtered preset list based on category and search query
  const filteredPresets = useMemo(() => {
    const list = Object.values(PRESET_CONFIGS);
    return list.filter((p) => {
      const matchesCategory = presetCategory === "all" || p.category === presetCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [presetCategory, searchQuery]);

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
    const cfg = PRESET_CONFIGS[preset] || PRESET_CONFIGS.hormozi;
    return `[Script Info]
Title: CompX Orbit Auto Captions
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${cfg.fontFamily.split(",")[0].replace(/'/g, "")},${cfg.fontSize * 1.5},&H00FFFFFF,&H0000E6FF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,${bgMode === "none" ? "1" : "3"},3,2,2,10,10,60,1

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
  }, [cues, preset, bgMode]);

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

  const currentCfg = PRESET_CONFIGS[preset] || PRESET_CONFIGS.hormozi;

  // Resolve background color with opacity
  const resolvedBoxBg = useMemo(() => {
    if (bgMode === "none") return "transparent";
    // Convert hex to rgb
    const hex = boxBgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${boxBgOpacity / 100})`;
  }, [bgMode, boxBgColor, boxBgOpacity]);

  return (
    <div className="w-full space-y-8">
      {/* Dynamic Keyframes for Animations */}
      <style jsx global>{`
        @keyframes captionPopAnim {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18);
          }
          100% {
            transform: scale(1.1);
          }
        }
        @keyframes captionBounceAnim {
          0% {
            transform: translateY(0) scale(1);
          }
          35% {
            transform: translateY(-6px) scale(1.22);
          }
          70% {
            transform: translateY(1px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1.14);
          }
        }
        @keyframes captionGlowPulseAnim {
          0%,
          100% {
            filter: drop-shadow(0 0 6px currentColor);
            transform: scale(1.08);
          }
          50% {
            filter: drop-shadow(0 0 18px currentColor);
            transform: scale(1.14);
          }
        }
        @keyframes captionGlitchAnim {
          0% {
            transform: translate(0) scale(1.08);
            text-shadow: -2px 0 #00ffff, 2px 0 #ff0055;
          }
          25% {
            transform: translate(-1.5px, 1px) scale(1.12);
          }
          50% {
            transform: translate(1.5px, -1px) scale(1.14);
            text-shadow: 2px 0 #00ffff, -2px 0 #ff0055;
          }
          75% {
            transform: translate(-1px, -1px) scale(1.1);
          }
          100% {
            transform: translate(0) scale(1.08);
            text-shadow: -1px 0 #00ffff, 1px 0 #ff0055;
          }
        }
        @keyframes captionFloatAnim {
          0%,
          100% {
            transform: translateY(0) scale(1.06);
          }
          50% {
            transform: translateY(-4px) scale(1.12);
          }
        }
        @keyframes captionShakeAnim {
          0%,
          100% {
            transform: rotate(0deg) scale(1.12);
          }
          25% {
            transform: rotate(-3deg) scale(1.16);
          }
          75% {
            transform: rotate(3deg) scale(1.16);
          }
        }
        .anim-pop {
          animation: captionPopAnim 0.22s ease-out forwards;
        }
        .anim-bounce {
          animation: captionBounceAnim 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .anim-glow {
          animation: captionGlowPulseAnim 0.8s infinite alternate ease-in-out;
        }
        .anim-glitch {
          animation: captionGlitchAnim 0.3s infinite steps(2, start);
        }
        .anim-float {
          animation: captionFloatAnim 0.6s infinite alternate ease-in-out;
        }
        .anim-shake {
          animation: captionShakeAnim 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        .anim-simple {
          transform: scale(1.08);
        }
      `}</style>

      {/* Top Banner & Upload Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-0.5 text-xs font-semibold text-[#3cff5f]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Auto-Captions Engine • 36 Viral Presets</span>
            <span>•</span>
            <span className="text-[#9baaa1]">Free Submagic &amp; Captions Alternative</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Reels &amp; Shorts Animated Captions Studio
          </h2>
          <p className="text-xs text-[#9baaa1]">
            Custom lines, words per screen, transparent background options, and 36+ viral creator animations.
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

            {/* Live Synchronized Caption Overlay with Chunking & MaxLines */}
            <div
              className={`absolute inset-x-4 z-10 flex flex-col items-center pointer-events-none transition-all duration-300 ${
                position === "bottom"
                  ? "bottom-14"
                  : position === "center"
                  ? "top-1/2 -translate-y-1/2"
                  : "top-16"
              }`}
            >
              {activeChunk ? (
                <div
                  className={`text-center transition-all ${
                    bgMode === "pill"
                      ? "rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md"
                      : bgMode === "card"
                      ? "rounded-3xl px-5 py-3.5 border border-white/10 shadow-2xl backdrop-blur-md"
                      : "px-2 py-1"
                  } ${
                    maxLines === "1"
                      ? "max-w-[94%] flex flex-nowrap justify-center overflow-hidden"
                      : "max-w-[92%] flex flex-wrap justify-center gap-1.5"
                  }`}
                  style={{
                    backgroundColor: bgMode === "none" || bgMode === "highlight-only" ? "transparent" : resolvedBoxBg,
                  }}
                >
                  {activeChunk.words.map((word) => {
                    const isHighlighted = word.id === activeWordId;
                    const animClass = isHighlighted
                      ? `anim-${currentCfg.animation || "pop"}`
                      : "opacity-95";

                    return (
                      <span
                        key={word.id}
                        className={`inline-block transition-all duration-150 ${animClass}`}
                        style={{
                          fontFamily: currentCfg.fontFamily,
                          fontWeight: currentCfg.fontWeight,
                          fontSize: `${fontSize}px`,
                          color: isHighlighted ? highlightColor : textColor,
                          backgroundColor:
                            isHighlighted && (bgMode === "highlight-only" || currentCfg.highlightBg !== "transparent")
                              ? currentCfg.highlightBg
                              : "transparent",
                          padding:
                            isHighlighted && (bgMode === "highlight-only" || currentCfg.highlightBg !== "transparent")
                              ? "2px 8px"
                              : "0",
                          borderRadius: "8px",
                          textTransform: textTransform,
                          textShadow: isHighlighted
                            ? `0 0 16px ${highlightColor}88, ${currentCfg.textShadow}`
                            : currentCfg.textShadow,
                          WebkitTextStroke: currentCfg.stroke,
                          margin: "0 2px",
                          whiteSpace: maxLines === "1" ? "nowrap" : "normal",
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
          {/* 1. Viral Animation Presets Library (36 Presets) */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#3cff5f]" />
                <span>1. Select Animation Preset (36 Available)</span>
              </h3>
              <span className="text-xs text-[#3cff5f] font-mono font-semibold">
                {currentCfg.name}
              </span>
            </div>

            {/* Category Filter Pills & Search Bar */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All (36)", icon: Compass },
                  { id: "creators", label: "🔥 Creator Icons (10)", icon: Flame },
                  { id: "social", label: "📱 TikTok & Reels (10)", icon: Zap },
                  { id: "cinematic", label: "🎬 Cinematic & Docu (8)", icon: Film },
                  { id: "gaming", label: "⚡ Gaming & VFX (8)", icon: Sparkles },
                ].map((cat) => {
                  const isActive = presetCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPresetCategory(cat.id as PresetCategory)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234] shadow-sm"
                          : "bg-[#080e0b] text-[#9baaa1] border border-[#213026] hover:text-[#e7eee9] hover:border-[#3cff5f]/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62776a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search presets by creator, style (e.g. Hormozi, Beast, Cyberpunk, Glow, Vox)..."
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] pl-10 pr-4 py-2 text-xs text-[#e7eee9] placeholder-[#62776a] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredPresets.map((p) => {
                const isActive = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id)}
                    className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#3cff5f] bg-[#102a16] shadow-[0_0_15px_rgba(60,255,95,0.15)]"
                        : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50 hover:bg-[#0c1510]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[#e7eee9] truncate">{p.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1 py-0.5 rounded shrink-0 ${
                          isActive
                            ? "bg-[#3cff5f] text-[#050a08] font-bold"
                            : "bg-[#17221b] text-[#9baaa1]"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9baaa1] line-clamp-2 leading-tight">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pacing, Line Breaks & Background Customizer */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#3cff5f]" />
              <span>2. Caption Pacing, Lines &amp; Background Box</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Words Per Screen (Pacing) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#9baaa1]">
                  <span>Words Per Screen:</span>
                  <span className="text-[#3cff5f] font-mono font-bold">
                    {wordsPerScreen === "all" ? "All Words" : `${wordsPerScreen} Words`}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                  {(["1", "2", "3", "4", "5", "6", "all"] as WordsPerScreenOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setWordsPerScreen(opt)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                        wordsPerScreen === opt
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {opt === "all" ? "All" : `${opt}W`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#62776a]">
                  1W: 1-word pop (Hormozi), 3W: Viral Sweet Spot, All: Full sentence.
                </p>
              </div>

              {/* Max Lines Per Screen */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#9baaa1]">
                  <span>Lines Per Screen:</span>
                  <span className="text-[#3cff5f] font-mono font-bold">
                    {maxLines === "1" ? "1 Line" : maxLines === "2" ? "2 Lines" : "Auto"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["1", "2", "auto"] as MaxLinesOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMaxLines(opt)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                        maxLines === opt
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {opt === "1" ? "1 Line" : opt === "2" ? "2 Lines" : "Auto Wrap"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#62776a]">
                  Limit text height so subtitles never block the speaker&apos;s face.
                </p>
              </div>

              {/* Background Box Mode (None / Pill / Highlight / Card) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#9baaa1]">
                  <span>Text Background Box:</span>
                  <span className="text-[#3cff5f] font-mono font-bold capitalize">
                    {bgMode}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "none", label: "None", icon: EyeOff },
                    { id: "pill", label: "Pill Box", icon: Eye },
                    { id: "highlight-only", label: "Word Only", icon: Sparkles },
                    { id: "card", label: "Full Card", icon: Layers },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBgMode(b.id as BgMode)}
                      className={`rounded-xl border py-2 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        bgMode === b.id
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      <b.icon className="h-3.5 w-3.5" />
                      <span className="text-[10px]">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color & Opacity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#9baaa1]">
                  <span>Box Color &amp; Opacity:</span>
                  <strong className="text-[#3cff5f] font-mono">
                    {bgMode === "none" ? "Transparent" : `${boxBgOpacity}%`}
                  </strong>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={boxBgColor}
                    disabled={bgMode === "none"}
                    onChange={(e) => setBoxBgColor(e.target.value)}
                    className="h-8 w-8 rounded border border-[#213026] bg-transparent cursor-pointer disabled:opacity-40"
                    title="Change background box color"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={boxBgOpacity}
                    disabled={bgMode === "none"}
                    onChange={(e) => setBoxBgOpacity(Number(e.target.value))}
                    className="flex-1 accent-[#3cff5f] cursor-pointer disabled:opacity-40"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {["#000000", "#0c1510", "#101827", "#1e102d", "#2d1010"].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      disabled={bgMode === "none"}
                      onClick={() => setBoxBgColor(hex)}
                      className="w-5 h-5 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-all disabled:opacity-40"
                      style={{ backgroundColor: hex }}
                      title={`Set ${hex}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Typography & Alignment Customizer */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <Type className="h-4 w-4 text-[#3cff5f]" />
              <span>3. Typography, Alignment &amp; Colors</span>
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
                  max="42"
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
                <label className="text-xs text-[#9baaa1]">Colors (Active &amp; Base):</label>
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

          {/* 4. Subtitle Dialogue & Timeline Editor */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3cff5f]" />
                <span>4. Subtitle Cues &amp; Timestamps</span>
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
                {cues.map((cue) => {
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

          {/* 5. Export & Download Hub */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <Download className="h-4 w-4 text-[#3cff5f]" />
              <span>5. Export Subtitles &amp; Animations (100% Free)</span>
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
