"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileCode2,
  Upload,
  Download,
  Copy,
  Check,
  Eye,
  Settings2,
  Sparkles,
  Maximize2,
  RefreshCw,
  Layers,
  Palette,
  ZoomIn,
  ZoomOut,
  FolderArchive,
  AlertCircle,
} from "lucide-react";
import {
  getSvgDimensions,
  svgToPngBlob,
  svgToJpgBlob,
  svgToEpsBlob,
  downloadBlob,
  ExportOptions,
} from "@/lib/svg-engine-converter";
import { formatBytes } from "@/lib/image-utils";

// Curated High-Quality Vector Presets
const SAMPLE_PRESETS: Record<string, { name: string; icon: string; svg: string }> = {
  rocket: {
    name: "Orbit Rocket",
    icon: "🚀",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3cff5f" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
  </defs>
  <circle cx="200" cy="200" r="180" fill="#08140d" stroke="#213026" stroke-width="6" />
  <!-- Left Wing -->
  <path d="M 140 250 L 90 310 L 150 290 Z" fill="url(#wingGrad)" />
  <!-- Right Wing -->
  <path d="M 260 250 L 310 310 L 250 290 Z" fill="url(#wingGrad)" />
  <!-- Rocket Body -->
  <path d="M 200 80 C 150 140 150 270 200 300 C 250 270 250 140 200 80 Z" fill="url(#rocketGrad)" stroke="#ffffff" stroke-width="4" />
  <!-- Window -->
  <circle cx="200" cy="180" r="30" fill="#0c1f13" stroke="#ffffff" stroke-width="4" />
  <circle cx="200" cy="180" r="18" fill="#38bdf8" />
  <!-- Thruster Flame -->
  <polygon points="180,300 220,300 200,350" fill="#f59e0b" />
</svg>`,
  },
  shield: {
    name: "Cyber Shield",
    icon: "🛡️",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <path d="M 200 50 L 320 90 L 320 230 C 320 300 200 360 200 360 C 200 360 80 300 80 230 L 80 90 Z" fill="#0c1f13" stroke="#3cff5f" stroke-width="8" stroke-linejoin="round" />
  <path d="M 200 85 L 290 120 L 290 225 C 290 280 200 325 200 325 C 200 325 110 280 110 225 L 110 120 Z" fill="#14301d" stroke="#22c55e" stroke-width="4" />
  <path d="M 175 195 L 195 215 L 235 175" fill="none" stroke="#3cff5f" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
  },
  bolt: {
    name: "Neon Bolt",
    icon: "⚡",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <circle cx="200" cy="200" r="170" fill="#08100c" stroke="#eab308" stroke-width="6" />
  <polygon points="215,60 115,220 195,220 175,340 285,175 205,175" fill="#facc15" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" />
</svg>`,
  },
  badge: {
    name: "Empire Crown",
    icon: "👑",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <path d="M 70 280 L 100 130 L 160 210 L 200 110 L 240 210 L 300 130 L 330 280 Z" fill="#ca8a04" stroke="#fef08a" stroke-width="6" stroke-linejoin="round" />
  <rect x="70" y="280" width="260" height="30" rx="6" fill="#854d0e" stroke="#fef08a" stroke-width="4" />
  <circle cx="100" cy="130" r="14" fill="#3cff5f" stroke="#ffffff" stroke-width="3" />
  <circle cx="200" cy="110" r="16" fill="#ef4444" stroke="#ffffff" stroke-width="3" />
  <circle cx="300" cy="130" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="3" />
</svg>`,
  },
};

export default function SvgEngineTool() {
  const [svgCode, setSvgCode] = useState<string>(SAMPLE_PRESETS.rocket.svg);
  const [inputTab, setInputTab] = useState<"preview" | "code">("preview");
  const [previewBg, setPreviewBg] = useState<"checker" | "dark" | "light" | "emerald" | "custom">("checker");
  const [customBgColor, setCustomBgColor] = useState<string>("#102a16");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Export Configuration
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2); // 1x, 2x, 4x, 8x
  const [jpgQuality, setJpgQuality] = useState<number>(92);
  const [epsMode, setEpsMode] = useState<"vector" | "hires">("vector");
  const [fileName, setFileName] = useState<string>("vector-export");

  // Status & Feedback
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [svgDimensions, setSvgDimensions] = useState({ width: 400, height: 400, viewBox: "0 0 400 400" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate dimensions on SVG update
  useEffect(() => {
    const dims = getSvgDimensions(svgCode);
    setSvgDimensions(dims);
  }, [svgCode]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(baseName || "vector-export");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setSvgCode(content);
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.includes("svg")) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(baseName || "vector-export");

      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setSvgCode(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  // Export: PNG
  const handleExportPng = async () => {
    setIsExporting("png");
    try {
      const opts: ExportOptions = {
        scale: scaleMultiplier,
        bgColor: previewBg === "checker" ? "transparent" : previewBg === "dark" ? "#06100a" : previewBg === "light" ? "#ffffff" : customBgColor,
      };
      const blob = await svgToPngBlob(svgCode, opts);
      downloadBlob(blob, `${fileName}@${scaleMultiplier}x.png`);
    } catch (err) {
      alert("PNG Export Error: " + String(err));
    } finally {
      setIsExporting(null);
    }
  };

  // Export: JPG
  const handleExportJpg = async () => {
    setIsExporting("jpg");
    try {
      const bg = previewBg === "checker" ? "#ffffff" : previewBg === "dark" ? "#06100a" : previewBg === "light" ? "#ffffff" : customBgColor;
      const opts: ExportOptions = {
        scale: scaleMultiplier,
        bgColor: bg,
        quality: jpgQuality / 100,
      };
      const blob = await svgToJpgBlob(svgCode, opts);
      downloadBlob(blob, `${fileName}@${scaleMultiplier}x.jpg`);
    } catch (err) {
      alert("JPG Export Error: " + String(err));
    } finally {
      setIsExporting(null);
    }
  };

  // Export: EPS
  const handleExportEps = async () => {
    setIsExporting("eps");
    try {
      const opts: ExportOptions = {
        title: fileName,
        epsMode,
        bgColor: previewBg === "checker" ? "#ffffff" : customBgColor,
      };
      const blob = await svgToEpsBlob(svgCode, opts);
      downloadBlob(blob, `${fileName}.eps`);
    } catch (err) {
      alert("EPS Export Error: " + String(err));
    } finally {
      setIsExporting(null);
    }
  };

  // Export: SVG
  const handleExportSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${fileName}.svg`);
  };

  // Export All Formats in One Go
  const handleExportAll = async () => {
    setIsExporting("all");
    try {
      await handleExportEps();
      await handleExportPng();
      await handleExportJpg();
    } finally {
      setIsExporting(null);
    }
  };

  // Copy SVG Code
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(svgCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const fileSize = new Blob([svgCode]).size;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Preset Vector Selector */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#e7eee9]">
                CompX SVG Vector Engine & Multi-Format Exporter
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8da194]">
              Convert SVG vectors to Illustrator-compatible <b>.EPS</b>, high-DPI <b>.PNG</b> (up to 8K), and <b>.JPG</b> with full quality control.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8da194] mr-1">
              Sample Vectors:
            </span>
            {Object.entries(SAMPLE_PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSvgCode(item.svg)}
                className="flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-bold text-[#e7eee9] hover:bg-[#14231b] hover:border-[#3cff5f]/50 hover:text-[#3cff5f] transition-all cursor-pointer"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Input/Code) & Right (Canvas & Exporter) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: Input, Code Editor & File Drop (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-xl">
            {/* Tab switch: Upload / Code */}
            <div className="flex items-center justify-between border-b border-[#1d2a21] pb-3 mb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setInputTab("preview")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    inputTab === "preview"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload & Specs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab("code")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    inputTab === "code"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>SVG XML Code</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#3cff5f] bg-[#102a16] px-2 py-0.5 rounded-md border border-[#2a5234]">
                {formatBytes(fileSize)}
              </div>
            </div>

            {inputTab === "preview" ? (
              <div className="space-y-4">
                {/* Drag & Drop Box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#213026] bg-[#080e0b] p-8 text-center hover:border-[#3cff5f]/50 hover:bg-[#0c1c12] transition-all cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-xs sm:text-sm font-bold text-[#e7eee9]">
                    Drop your .SVG vector file here
                  </h4>
                  <p className="mt-1 text-[11px] text-[#8da194]">
                    or click to browse from your device
                  </p>
                </div>

                {/* Metadata & Vector Specs */}
                <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3cff5f] block">
                    Vector Dimensions & Metadata
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-[#213026] bg-[#0c1510] p-2.5">
                      <span className="text-[10px] text-[#8da194] block">Width × Height</span>
                      <span className="font-mono font-bold text-[#e7eee9]">
                        {svgDimensions.width} × {svgDimensions.height} px
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#213026] bg-[#0c1510] p-2.5">
                      <span className="text-[10px] text-[#8da194] block">File Size</span>
                      <span className="font-mono font-bold text-[#3cff5f]">
                        {formatBytes(fileSize)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#213026] bg-[#0c1510] p-2.5">
                    <span className="text-[10px] text-[#8da194] block">SVG ViewBox</span>
                    <span className="font-mono text-xs text-[#e7eee9] truncate block">
                      {svgDimensions.viewBox}
                    </span>
                  </div>

                  {/* Export Filename Input */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8da194] block mb-1">
                      Output Filename
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                        placeholder="my-vector-graphic"
                        className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 font-mono text-xs text-white focus:border-[#3cff5f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#8da194]">
                    Edit Raw SVG Markup:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#3cff5f] hover:underline cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCode ? "Copied! ✓" : "Copy Code"}</span>
                  </button>
                </div>
                <textarea
                  value={svgCode}
                  onChange={(e) => setSvgCode(e.target.value)}
                  rows={14}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] p-3 font-mono text-xs text-[#3cff5f] leading-relaxed focus:border-[#3cff5f] focus:outline-none custom-scrollbar"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Canvas & Conversion Hub (7 cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visual Canvas Viewer */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl">
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d2a21] pb-3 mb-4">
              {/* Background Color Switchers */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] font-bold text-[#8da194] mr-1 hidden sm:inline">
                  Canvas Bg:
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewBg("checker")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    previewBg === "checker"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                  title="Transparent Checkerboard"
                >
                  🏁 Alpha
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("dark")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    previewBg === "dark"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                >
                  ⬛ Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("light")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    previewBg === "light"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                >
                  ⬜ Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg("custom")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    previewBg === "custom"
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      : "text-[#8da194] hover:text-white"
                  }`}
                >
                  <Palette className="h-3 w-3" />
                  <span>Color</span>
                </button>
                {previewBg === "custom" && (
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="h-6 w-6 rounded-md cursor-pointer border border-[#213026] bg-transparent"
                  />
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                  className="rounded-lg p-1.5 text-[#8da194] hover:bg-[#14231b] hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-xs text-[#3cff5f] font-bold w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="rounded-lg p-1.5 text-[#8da194] hover:bg-[#14231b] hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="rounded-lg p-1.5 text-[#8da194] hover:bg-[#14231b] hover:text-white cursor-pointer"
                  title="Reset Zoom"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Surface with Real SVG Injection */}
            <div
              className={`relative flex min-h-[340px] sm:min-h-[380px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#213026] transition-all p-4 ${
                previewBg === "checker"
                  ? "bg-[linear-gradient(45deg,#121815_25%,transparent_25%),linear-gradient(-45deg,#121815_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#121815_75%),linear-gradient(-45deg,transparent_75%,#121815_75%)] bg-[size:20px_20px] bg-[#090e0b]"
                  : previewBg === "dark"
                  ? "bg-[#06100a]"
                  : previewBg === "light"
                  ? "bg-[#ffffff]"
                  : ""
              }`}
              style={{
                backgroundColor: previewBg === "custom" ? customBgColor : undefined,
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease",
                }}
                className="max-h-[320px] max-w-full drop-shadow-2xl flex items-center justify-center select-none"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
            </div>
          </div>

          {/* ── MULTI-FORMAT EXPORT ENGINE PANEL ── */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1d2a21] pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-[#3cff5f]" />
                <h3 className="font-bold text-sm text-[#e7eee9]">
                  Export Engine Configuration
                </h3>
              </div>
              <span className="font-mono text-xs text-[#3cff5f]">
                {svgDimensions.width * scaleMultiplier} × {svgDimensions.height * scaleMultiplier} px Output
              </span>
            </div>

            {/* Export Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Resolution Multiplier */}
              <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-3.5 space-y-2">
                <label className="text-[11px] font-bold text-[#e7eee9] block">
                  PNG / JPG Resolution:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 4, 8].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScaleMultiplier(s)}
                      className={`rounded-xl py-2 font-black transition-all cursor-pointer ${
                        scaleMultiplier === s
                          ? "bg-[#3cff5f] text-black shadow-md shadow-[#3cff5f]/20"
                          : "border border-[#213026] bg-[#0c1510] text-[#8da194] hover:text-white"
                      }`}
                    >
                      {s}x {s === 1 ? "(Std)" : s === 2 ? "(2K)" : s === 4 ? "(4K)" : "(8K)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* JPG Quality & EPS Mode */}
              <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#e7eee9]">
                    JPG Quality: {jpgQuality}%
                  </label>
                  <span className="text-[10px] font-bold text-[#3cff5f]">
                    {jpgQuality >= 90 ? "Maximum" : "High"}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(Number(e.target.value))}
                  className="w-full accent-[#3cff5f] h-2 bg-[#122218] rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#8da194]">EPS Mode:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEpsMode("vector")}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        epsMode === "vector"
                          ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                          : "text-[#8da194]"
                      }`}
                      title="Native PostScript vector paths for Illustrator"
                    >
                      Pure Vector
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpsMode("hires")}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        epsMode === "hires"
                          ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                          : "text-[#8da194]"
                      }`}
                      title="Hi-Res 300 DPI PostScript for complex filters & gradients"
                    >
                      Hi-Res Print
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Dedicated Format Action Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* EPS Button */}
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={handleExportEps}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#3cff5f]/50 bg-[#102a16] hover:bg-[#16381e] p-3 text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#3cff5f]/15"
              >
                <span className="text-xl mb-1">📐</span>
                <span className="text-xs font-black text-[#3cff5f]">Save .EPS</span>
                <span className="text-[10px] text-[#8da194] mt-0.5">Illustrator Vector</span>
              </button>

              {/* PNG Button */}
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={handleExportPng}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#213026] bg-[#080e0b] hover:bg-[#14231b] hover:border-[#38bdf8]/50 p-3 text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span className="text-xl mb-1">🖼️</span>
                <span className="text-xs font-black text-[#38bdf8]">Save .PNG</span>
                <span className="text-[10px] text-[#8da194] mt-0.5">
                  {scaleMultiplier}x Transparent
                </span>
              </button>

              {/* JPG Button */}
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={handleExportJpg}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#213026] bg-[#080e0b] hover:bg-[#14231b] hover:border-amber-400/50 p-3 text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span className="text-xl mb-1">📷</span>
                <span className="text-xs font-black text-amber-400">Save .JPG</span>
                <span className="text-[10px] text-[#8da194] mt-0.5">
                  {jpgQuality}% Quality
                </span>
              </button>

              {/* SVG Button */}
              <button
                type="button"
                disabled={isExporting !== null}
                onClick={handleExportSvg}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#213026] bg-[#080e0b] hover:bg-[#14231b] hover:border-purple-400/50 p-3 text-center transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span className="text-xl mb-1">⚡</span>
                <span className="text-xs font-black text-purple-400">Save .SVG</span>
                <span className="text-[10px] text-[#8da194] mt-0.5">Source Vector</span>
              </button>
            </div>

            {/* Master Batch Action: Export All */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={handleExportAll}
              className="w-full py-4 rounded-2xl bg-[#3cff5f] text-sm font-black text-[#050a08] shadow-[0_0_30px_rgba(60,255,95,0.35)] hover:bg-[#52ff71] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>
                {isExporting ? "Converting & Exporting..." : "Export All Formats (.EPS + .PNG + .JPG)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
