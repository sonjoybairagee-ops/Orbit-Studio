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
  Trash2,
  CheckCircle2,
  Play,
  Plus,
  Sliders,
  ArrowDownToLine,
  Loader2,
  FolderOpen,
} from "lucide-react";
import {
  getSvgDimensions,
  svgToPngBlob,
  svgToJpgBlob,
  svgToEpsBlob,
  downloadBlob,
  processBulkSvgToZip,
  ExportOptions,
  BulkSvgItem,
  BulkTargetFormats,
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
  // Navigation Mode: Bulk Auto-Processor or Single Canvas
  const [activeEngineMode, setActiveEngineMode] = useState<"bulk" | "single">("bulk");

  // ==========================================
  // BULK BATCH SYSTEM STATE
  // ==========================================
  const [bulkFiles, setBulkFiles] = useState<BulkSvgItem[]>([]);
  const [bulkTargets, setBulkTargets] = useState<BulkTargetFormats>({
    eps: true,
    png1x: true,
    png2x: true,
    png4x: true,
    png8x: false,
    jpg: true,
    includeSvg: false,
    jpgQuality: 0.92,
    bgColor: "transparent",
    epsMode: "vector",
  });
  const [autoProcessOnUpload, setAutoProcessOnUpload] = useState<boolean>(true);
  const [autoDownloadOnFinish, setAutoDownloadOnFinish] = useState<boolean>(true);
  const [zipFileName, setZipFileName] = useState<string>("orbit-svg-bundle");
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<{
    processedFiles: number;
    totalFiles: number;
    currentFileName: string;
    stage: string;
    percent: number;
  }>({
    processedFiles: 0,
    totalFiles: 0,
    currentFileName: "",
    stage: "idle",
    percent: 0,
  });
  const [bulkResultZip, setBulkResultZip] = useState<{
    blob: Blob;
    totalFiles: number;
    size: number;
  } | null>(null);

  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // SINGLE EDITOR STATE
  // ==========================================
  const [svgCode, setSvgCode] = useState<string>(SAMPLE_PRESETS.rocket.svg);
  const [inputTab, setInputTab] = useState<"preview" | "code">("preview");
  const [previewBg, setPreviewBg] = useState<"checker" | "dark" | "light" | "emerald" | "custom">("checker");
  const [customBgColor, setCustomBgColor] = useState<string>("#102a16");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Export Configuration (Single)
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2);
  const [jpgQuality, setJpgQuality] = useState<number>(92);
  const [epsMode, setEpsMode] = useState<"vector" | "hires">("vector");
  const [fileName, setFileName] = useState<string>("vector-export");

  // Status & Feedback (Single)
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [svgDimensions, setSvgDimensions] = useState({ width: 400, height: 400, viewBox: "0 0 400 400" });

  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate dimensions on SVG update (Single)
  useEffect(() => {
    const dims = getSvgDimensions(svgCode);
    setSvgDimensions(dims);
  }, [svgCode]);

  // ==========================================
  // BULK FILE HANDLERS
  // ==========================================
  const handleBulkFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(
      (f) => f.name.toLowerCase().endsWith(".svg") || f.type.includes("svg")
    );

    if (fileArray.length === 0) {
      alert("No valid .svg files detected. Please select .svg vector files.");
      return;
    }

    const loadedItems: BulkSvgItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const text = await file.text();
        const dims = getSvgDimensions(text);
        loadedItems.push({
          id: `svg_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          svgString: text,
          size: file.size,
          width: dims.width,
          height: dims.height,
          viewBox: dims.viewBox,
          status: "idle",
        });
      } catch (err) {
        console.error("Failed to parse SVG:", file.name, err);
      }
    }

    if (loadedItems.length === 0) return;

    setBulkFiles((prev) => {
      const merged = [...prev, ...loadedItems];
      if (autoProcessOnUpload) {
        setTimeout(() => {
          runBulkProcess(merged);
        }, 120);
      }
      return merged;
    });

    setBulkResultZip(null);
  };

  // Load sample bulk package (4 SVGs)
  const handleLoadSampleBulkPack = () => {
    const samples: BulkSvgItem[] = Object.entries(SAMPLE_PRESETS).map(
      ([key, preset], idx) => {
        const dims = getSvgDimensions(preset.svg);
        return {
          id: `sample_${key}_${Date.now()}_${idx}`,
          name: `${preset.name.toLowerCase().replace(/\s+/g, "-")}.svg`,
          svgString: preset.svg,
          size: new Blob([preset.svg]).size,
          width: dims.width,
          height: dims.height,
          viewBox: dims.viewBox,
          status: "idle",
        };
      }
    );

    setBulkFiles(samples);
    setBulkResultZip(null);

    if (autoProcessOnUpload) {
      setTimeout(() => {
        runBulkProcess(samples);
      }, 120);
    }
  };

  // Drag and Drop for Bulk
  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBulkFilesUpload(e.dataTransfer.files);
    }
  };

  // Run Bulk Conversion
  const runBulkProcess = async (itemsToProcess = bulkFiles) => {
    if (itemsToProcess.length === 0) {
      alert("Please upload at least one SVG file first!");
      return;
    }

    // Check if at least one format is selected
    const hasAnyFormat =
      bulkTargets.eps ||
      bulkTargets.png1x ||
      bulkTargets.png2x ||
      bulkTargets.png4x ||
      bulkTargets.png8x ||
      bulkTargets.jpg ||
      bulkTargets.includeSvg;

    if (!hasAnyFormat) {
      alert("Please select at least one output format (EPS, PNG sizes, or JPG)!");
      return;
    }

    setIsBulkProcessing(true);
    setBulkResultZip(null);
    setBulkProgress({
      processedFiles: 0,
      totalFiles: itemsToProcess.length,
      currentFileName: "Starting engine...",
      stage: "rendering",
      percent: 0,
    });

    try {
      const result = await processBulkSvgToZip(
        itemsToProcess,
        bulkTargets,
        zipFileName,
        (prog) => {
          setBulkProgress(prog);
        }
      );

      setBulkResultZip({
        blob: result.zipBlob,
        totalFiles: result.totalFilesGenerated,
        size: result.zipSize,
      });

      // Mark items as completed
      setBulkFiles((prev) =>
        prev.map((item) => ({ ...item, status: "done" }))
      );

      // Auto Download ZIP if enabled
      if (autoDownloadOnFinish) {
        downloadBlob(result.zipBlob, `${zipFileName}.zip`);
      }
    } catch (err) {
      alert("Bulk conversion error: " + String(err));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Clear bulk list
  const handleClearBulkFiles = () => {
    setBulkFiles([]);
    setBulkResultZip(null);
    setBulkProgress({
      processedFiles: 0,
      totalFiles: 0,
      currentFileName: "",
      stage: "idle",
      percent: 0,
    });
  };

  // Remove single item from queue
  const handleRemoveBulkItem = (id: string) => {
    setBulkFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Preset Selector for Bulk Formats
  const applyPresetMatrix = (presetKey: "master" | "web" | "print" | "vector") => {
    if (presetKey === "master") {
      setBulkTargets({
        eps: true,
        png1x: true,
        png2x: true,
        png4x: true,
        png8x: true,
        jpg: true,
        includeSvg: true,
        jpgQuality: 0.92,
        bgColor: "transparent",
        epsMode: "vector",
      });
    } else if (presetKey === "web") {
      setBulkTargets({
        eps: false,
        png1x: true,
        png2x: true,
        png4x: false,
        png8x: false,
        jpg: false,
        includeSvg: true,
        jpgQuality: 0.9,
        bgColor: "transparent",
        epsMode: "vector",
      });
    } else if (presetKey === "print") {
      setBulkTargets({
        eps: true,
        png1x: false,
        png2x: false,
        png4x: true,
        png8x: true,
        jpg: false,
        includeSvg: false,
        jpgQuality: 0.95,
        bgColor: "transparent",
        epsMode: "vector",
      });
    } else if (presetKey === "vector") {
      setBulkTargets({
        eps: true,
        png1x: false,
        png2x: false,
        png4x: false,
        png8x: false,
        jpg: false,
        includeSvg: true,
        jpgQuality: 0.92,
        bgColor: "transparent",
        epsMode: "vector",
      });
    }
  };

  // Count how many files will be generated per SVG
  const formatsCount =
    (bulkTargets.eps ? 1 : 0) +
    (bulkTargets.png1x ? 1 : 0) +
    (bulkTargets.png2x ? 1 : 0) +
    (bulkTargets.png4x ? 1 : 0) +
    (bulkTargets.png8x ? 1 : 0) +
    (bulkTargets.jpg ? 1 : 0) +
    (bulkTargets.includeSvg ? 1 : 0);

  const totalOutputAssetsCount = bulkFiles.length * formatsCount;

  // ==========================================
  // SINGLE EDITOR EXPORTS
  // ==========================================
  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base = file.name.replace(/\.[^/.]+$/, "");
    setFileName(base || "vector-export");

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setSvgCode(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPng = async () => {
    setIsExporting("png");
    try {
      const opts: ExportOptions = {
        scale: scaleMultiplier,
        bgColor:
          previewBg === "checker"
            ? "transparent"
            : previewBg === "dark"
            ? "#06100a"
            : previewBg === "light"
            ? "#ffffff"
            : customBgColor,
      };
      const blob = await svgToPngBlob(svgCode, opts);
      downloadBlob(blob, `${fileName}@${scaleMultiplier}x.png`);
    } catch (err) {
      alert("PNG Export Error: " + String(err));
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJpg = async () => {
    setIsExporting("jpg");
    try {
      const bg =
        previewBg === "checker"
          ? "#ffffff"
          : previewBg === "dark"
          ? "#06100a"
          : previewBg === "light"
          ? "#ffffff"
          : customBgColor;
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

  const handleExportSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `${fileName}.svg`);
  };

  const handleExportAllSingle = async () => {
    setIsExporting("all");
    try {
      await handleExportEps();
      await handleExportPng();
      await handleExportJpg();
    } finally {
      setIsExporting(null);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(svgCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={bulkFileInputRef}
        type="file"
        multiple
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBulkFilesUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in Chromium
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBulkFilesUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={singleFileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={handleSingleFileUpload}
      />

      {/* Primary Top Bar & Mode Switcher */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
              Bulk upload multiple SVGs, auto-convert into <b>EPS</b>, <b>PNG (1x to 8K)</b>, and <b>JPG</b>, and download complete asset bundles as <b>ZIP</b>.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#213026] bg-[#080e0b] p-1.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setActiveEngineMode("bulk")}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeEngineMode === "bulk"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                  : "text-[#8da194] hover:text-[#e7eee9]"
              }`}
            >
              <FolderArchive className="h-3.5 w-3.5" />
              <span>⚡ Bulk Auto Processor</span>
              {bulkFiles.length > 0 && (
                <span className="rounded-full bg-[#050a08] px-1.5 py-0.2 text-[10px] font-bold text-[#3cff5f]">
                  {bulkFiles.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveEngineMode("single")}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeEngineMode === "single"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                  : "text-[#8da194] hover:text-[#e7eee9]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>🎨 Single Canvas Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BULK BATCH PROCESSOR TAB */}
      {/* ========================================================= */}
      {activeEngineMode === "bulk" && (
        <div className="space-y-6">
          {/* Top Options & Auto Settings */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1b2720] pb-5">
              <div>
                <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#3cff5f]" />
                  <span>Bulk Output Matrix & Size Formats</span>
                </h3>
                <p className="text-xs text-[#8da194] mt-0.5">
                  Choose which vector and raster sizes will be automatically generated for every uploaded SVG.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#62776a] mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix("master")}
                  className="rounded-lg border border-[#2a5234] bg-[#102a16] px-2.5 py-1 text-[11px] font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer"
                >
                  🌟 Master Pack (All Sizes)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix("web")}
                  className="rounded-lg border border-[#213026] bg-[#080e0b] px-2.5 py-1 text-[11px] font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
                >
                  🌐 Web (1x, 2x, SVG)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix("print")}
                  className="rounded-lg border border-[#213026] bg-[#080e0b] px-2.5 py-1 text-[11px] font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
                >
                  🖨️ Print & Vector (EPS, 4K, 8K)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatrix("vector")}
                  className="rounded-lg border border-[#213026] bg-[#080e0b] px-2.5 py-1 text-[11px] font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
                >
                  📐 Vector Only (EPS)
                </button>
              </div>
            </div>

            {/* Checkbox Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* EPS */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.eps ? "border-[#3cff5f]/60 bg-[#102a16]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#3cff5f]">EPS Vector</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.eps}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, eps: e.target.checked }))}
                    className="accent-[#3cff5f] h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Illustrator & Corel</span>
              </label>

              {/* PNG 1x */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.png1x ? "border-[#38bdf8]/60 bg-[#0c2233]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#38bdf8]">PNG 1x</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.png1x}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, png1x: e.target.checked }))}
                    className="accent-[#38bdf8] h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Standard UI</span>
              </label>

              {/* PNG 2x */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.png2x ? "border-[#38bdf8]/60 bg-[#0c2233]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#38bdf8]">PNG 2x</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.png2x}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, png2x: e.target.checked }))}
                    className="accent-[#38bdf8] h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Retina High-Res</span>
              </label>

              {/* PNG 4x */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.png4x ? "border-[#38bdf8]/60 bg-[#0c2233]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#38bdf8]">PNG 4K (4x)</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.png4x}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, png4x: e.target.checked }))}
                    className="accent-[#38bdf8] h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Ultra HD Master</span>
              </label>

              {/* PNG 8K */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.png8x ? "border-[#38bdf8]/60 bg-[#0c2233]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#38bdf8]">PNG 8K (8x)</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.png8x}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, png8x: e.target.checked }))}
                    className="accent-[#38bdf8] h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Fine Art Print</span>
              </label>

              {/* JPG */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.jpg ? "border-amber-400/60 bg-[#29220d]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-400">JPG Photo</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.jpg}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, jpg: e.target.checked }))}
                    className="accent-amber-400 h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">92% Compressed</span>
              </label>

              {/* Source SVG */}
              <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                bulkTargets.includeSvg ? "border-purple-400/60 bg-[#261330]" : "border-[#213026] bg-[#080e0b] opacity-60"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-purple-400">Clean SVG</span>
                  <input
                    type="checkbox"
                    checked={bulkTargets.includeSvg}
                    onChange={(e) => setBulkTargets((prev) => ({ ...prev, includeSvg: e.target.checked }))}
                    className="accent-purple-400 h-3.5 w-3.5"
                  />
                </div>
                <span className="text-[10px] text-[#8da194]">Source Vector</span>
              </label>
            </div>

            {/* Automation Toggles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-[#1b2720]">
              <div className="flex flex-wrap items-center gap-5">
                {/* Auto Process Switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoProcessOnUpload}
                    onChange={(e) => setAutoProcessOnUpload(e.target.checked)}
                    className="accent-[#3cff5f] h-4 w-4 rounded"
                  />
                  <span className="text-xs font-bold text-[#e7eee9]">
                    ⚡ Auto-process immediately on file upload
                  </span>
                </label>

                {/* Auto Download Switch */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoDownloadOnFinish}
                    onChange={(e) => setAutoDownloadOnFinish(e.target.checked)}
                    className="accent-[#3cff5f] h-4 w-4 rounded"
                  />
                  <span className="text-xs font-bold text-[#e7eee9]">
                    📥 Auto-download ZIP when completed
                  </span>
                </label>
              </div>

              {/* Bundle ZIP Name */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#8da194] shrink-0">ZIP Name:</span>
                <div className="flex items-center rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 focus-within:border-[#3cff5f] transition-colors">
                  <input
                    type="text"
                    value={zipFileName}
                    onChange={(e) => setZipFileName(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "_"))}
                    className="bg-transparent text-xs font-mono text-[#3cff5f] focus:outline-none w-32 sm:w-40"
                  />
                  <span className="text-xs text-[#62776a] shrink-0 font-mono">.zip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Drop & Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleBulkDrop}
            className="rounded-3xl border-2 border-dashed border-[#2a5234] bg-[#0c1510]/90 hover:bg-[#102217] hover:border-[#3cff5f] p-8 text-center transition-all cursor-pointer shadow-xl group"
            onClick={() => bulkFileInputRef.current?.click()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-[#e7eee9]">
              Drag & Drop Multiple SVG Files Here
            </h3>
            <p className="mt-1 text-xs text-[#8da194] max-w-md mx-auto">
              Select 5, 20, or 100+ SVG vector files at once. All files will be automatically converted to your selected format bundle.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-5 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#50ff70] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 hover:scale-[1.02] active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Select SVG Files</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#2a5234] bg-[#102a16] px-4 py-2.5 text-xs font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Upload Entire Folder</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleBulkPack}
                className="inline-flex items-center gap-2 rounded-xl border border-[#213026] bg-[#080e0b] px-4 py-2.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>⚡ Test with 4 Sample SVGs</span>
              </button>
            </div>
          </div>

          {/* Progress Bar (When processing) */}
          {isBulkProcessing && (
            <div className="rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1f13] to-[#08120c] p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#3cff5f] flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Auto-Processing {bulkProgress.processedFiles} of {bulkProgress.totalFiles} SVGs...
                </span>
                <span className="font-mono font-bold text-[#e7eee9]">{bulkProgress.percent}%</span>
              </div>

              {/* Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#080e0b] border border-[#213026] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-[#3cff5f] shadow-[0_0_15px_#3cff5f] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(5, bulkProgress.percent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8da194]">
                <span className="truncate max-w-sm font-mono text-[#38bdf8]">
                  Rendering: {bulkProgress.currentFileName}
                </span>
                <span>Generating {formatsCount} formats per asset</span>
              </div>
            </div>
          )}

          {/* Result ZIP Download Ready Card */}
          {bulkResultZip && !isBulkProcessing && (
            <div className="rounded-3xl border-2 border-[#3cff5f] bg-[#0c2214] p-6 shadow-[0_0_40px_rgba(60,255,95,0.25)] flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] shadow-lg shadow-[#3cff5f]/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#e7eee9]">
                    Bulk Conversion Complete & Assets Packaged!
                  </h3>
                  <p className="text-xs text-[#8da194] mt-0.5">
                    <b>{bulkResultZip.totalFiles} asset files</b> generated across {bulkFiles.length} SVGs ({formatBytes(bulkResultZip.size)} ZIP archive).
                    {autoDownloadOnFinish && " Auto-downloaded to your browser."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => downloadBlob(bulkResultZip.blob, `${zipFileName}.zip`)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 hover:scale-105 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Bulk ZIP ({formatBytes(bulkResultZip.size)})</span>
                </button>
              </div>
            </div>
          )}

          {/* Queue List / Grid */}
          {bulkFiles.length > 0 && (
            <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1b2720] pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#102a16] text-[#3cff5f] font-bold text-xs border border-[#2a5234]">
                    {bulkFiles.length}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#e7eee9]">
                      Uploaded SVGs Queue
                    </h3>
                    <span className="text-[11px] text-[#8da194]">
                      Total output assets to generate: <b className="text-[#3cff5f]">{totalOutputAssetsCount} files</b> ({bulkFiles.length} SVGs × {formatsCount} formats)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>Add More</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearBulkFiles}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#3b1d22] bg-[#1f0f12] px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-[#2d1419] transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={() => runBulkProcess()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-4 py-1.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20 disabled:opacity-50"
                  >
                    {isBulkProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span>{isBulkProcessing ? "Processing..." : "Process All Now"}</span>
                  </button>
                </div>
              </div>

              {/* Items Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                {bulkFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#1b2720] bg-[#080e0b] p-3 hover:border-[#2a5234] transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Mini Preview Box */}
                      <div
                        className="h-12 w-12 shrink-0 rounded-xl border border-[#213026] bg-[#050a08] flex items-center justify-center p-1 overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                        dangerouslySetInnerHTML={{ __html: item.svgString }}
                      />

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#62776a]">#{index + 1}</span>
                          <h4 className="text-xs font-bold text-[#e7eee9] truncate max-w-[130px] sm:max-w-[160px]">
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#8da194] mt-0.5">
                          <span>{item.width}×{item.height}</span>
                          <span>•</span>
                          <span>{formatBytes(item.size)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.status === "done" ? (
                        <span className="rounded-full bg-[#102a16] p-1 text-[#3cff5f]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : item.status === "processing" ? (
                        <span className="rounded-full bg-[#102a16] p-1 text-[#3cff5f]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleRemoveBulkItem(item.id)}
                        className="rounded-lg p-1.5 text-[#62776a] hover:text-red-400 hover:bg-[#1a1215] transition-all cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SINGLE CANVAS STUDIO TAB */}
      {/* ========================================================= */}
      {activeEngineMode === "single" && (
        <div className="space-y-6">
          {/* Preset Icons Selection */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da194]">
                  Load Preset Vector Sample:
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(SAMPLE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSvgCode(preset.svg);
                      setFileName(preset.name.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-bold text-[#e7eee9] hover:border-[#3cff5f] hover:bg-[#102a16] hover:text-[#3cff5f] transition-all cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload .SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Left (Canvas) | Right (Inspector & Export Controls) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Canvas Preview / Code Tab (7 cols) */}
            <div className="lg:col-span-7 flex flex-col rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-6 shadow-2xl">
              {/* Canvas Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2720] pb-4 mb-4">
                <div className="flex items-center gap-1 rounded-2xl border border-[#213026] bg-[#080e0b] p-1">
                  <button
                    type="button"
                    onClick={() => setInputTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inputTab === "preview"
                        ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                        : "text-[#8da194] hover:text-[#e7eee9]"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Visual Canvas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab("code")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inputTab === "code"
                        ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                        : "text-[#8da194] hover:text-[#e7eee9]"
                    }`}
                  >
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>SVG Code</span>
                  </button>
                </div>

                {/* Background Toggles */}
                {inputTab === "preview" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#8da194] mr-1">Backdrop:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewBg("checker")}
                      title="Alpha Checkerboard"
                      className={`h-6 w-6 rounded-lg border text-[10px] flex items-center justify-center cursor-pointer transition-all ${
                        previewBg === "checker"
                          ? "border-[#3cff5f] ring-2 ring-[#3cff5f]/30"
                          : "border-[#213026] opacity-70"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(45deg, #18281e 25%, transparent 25%), linear-gradient(-45deg, #18281e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18281e 75%), linear-gradient(-45deg, transparent 75%, #18281e 75%)`,
                        backgroundSize: "8px 8px",
                        backgroundColor: "#0d1a12",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg("dark")}
                      title="Dark Canvas"
                      className={`h-6 w-6 rounded-lg border bg-[#06100a] cursor-pointer transition-all ${
                        previewBg === "dark" ? "border-[#3cff5f] ring-2 ring-[#3cff5f]/30" : "border-[#213026]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg("light")}
                      title="Light Canvas"
                      className={`h-6 w-6 rounded-lg border bg-white cursor-pointer transition-all ${
                        previewBg === "light" ? "border-[#3cff5f] ring-2 ring-[#3cff5f]/30" : "border-[#213026]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBg("emerald")}
                      title="Emerald Backdrop"
                      className={`h-6 w-6 rounded-lg border bg-[#102a16] cursor-pointer transition-all ${
                        previewBg === "emerald" ? "border-[#3cff5f] ring-2 ring-[#3cff5f]/30" : "border-[#213026]"
                      }`}
                    />
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        setPreviewBg("custom");
                      }}
                      title="Custom Color"
                      className="h-6 w-6 rounded-lg border border-[#213026] bg-transparent cursor-pointer p-0"
                    />
                  </div>
                )}
              </div>

              {/* Canvas Preview Area */}
              {inputTab === "preview" ? (
                <div
                  className="relative flex-1 min-h-[380px] sm:min-h-[440px] flex items-center justify-center rounded-2xl border border-[#213026] overflow-hidden p-6 transition-all"
                  style={{
                    backgroundColor:
                      previewBg === "checker"
                        ? "#0a140d"
                        : previewBg === "dark"
                        ? "#06100a"
                        : previewBg === "light"
                        ? "#ffffff"
                        : previewBg === "emerald"
                        ? "#102a16"
                        : customBgColor,
                    backgroundImage:
                      previewBg === "checker"
                        ? `linear-gradient(45deg, #15241b 25%, transparent 25%), linear-gradient(-45deg, #15241b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #15241b 75%), linear-gradient(-45deg, transparent 75%, #15241b 75%)`
                        : undefined,
                    backgroundSize: previewBg === "checker" ? "16px 16px" : undefined,
                  }}
                >
                  {/* Floating Zoom Bar */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl border border-[#213026] bg-[#0c1510]/90 backdrop-blur-md px-2 py-1 shadow-lg z-10">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                      className="p-1 text-[#8da194] hover:text-[#3cff5f] transition-all cursor-pointer"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[10px] font-bold text-[#e7eee9] w-9 text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                      className="p-1 text-[#8da194] hover:text-[#3cff5f] transition-all cursor-pointer"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="ml-1 text-[10px] text-[#3cff5f] font-bold px-1.5 py-0.5 rounded bg-[#102a16] border border-[#2a5234] hover:bg-[#16381e] transition-all cursor-pointer"
                    >
                      Fit
                    </button>
                  </div>

                  {/* Rendered SVG Element */}
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})`, transition: "transform 0.15s ease-out" }}
                    className="flex items-center justify-center max-w-full max-h-full drop-shadow-2xl [&>svg]:max-w-full [&>svg]:max-h-[380px] [&>svg]:h-auto"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                </div>
              ) : (
                /* Raw Code Editor Area */
                <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] flex flex-col">
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode ? "Copied!" : "Copy XML"}</span>
                    </button>
                  </div>

                  <textarea
                    value={svgCode}
                    onChange={(e) => setSvgCode(e.target.value)}
                    spellCheck={false}
                    className="w-full flex-1 rounded-2xl border border-[#213026] bg-[#080e0b] p-4 font-mono text-xs text-[#3cff5f] focus:outline-none focus:border-[#3cff5f] resize-none leading-relaxed"
                    placeholder="<svg ...> Paste or write SVG code here</svg>"
                  />
                </div>
              )}

              {/* Bottom Canvas Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#1b2720] text-xs text-[#8da194]">
                <div className="flex items-center gap-3 font-mono">
                  <span>
                    Dimensions: <b className="text-[#e7eee9]">{svgDimensions.width} × {svgDimensions.height} px</b>
                  </span>
                  <span>•</span>
                  <span>
                    viewBox: <b className="text-[#3cff5f]">{svgDimensions.viewBox}</b>
                  </span>
                </div>
                <div>
                  Raw Size: <b className="text-[#e7eee9]">{formatBytes(new Blob([svgCode]).size)}</b>
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Export Format Buttons (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#1b2720] pb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-[#3cff5f]" />
                    <h3 className="text-sm font-black text-[#e7eee9]">
                      Single Asset Export Settings
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-full">
                    Instant Download
                  </span>
                </div>

                {/* Base Output Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8da194]">File Base Name:</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "_"))}
                    className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs font-mono text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>

                {/* Resolution Multiplier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#8da194]">
                      Raster Scale (PNG / JPG):
                    </label>
                    <span className="font-mono text-xs font-black text-[#3cff5f]">
                      {scaleMultiplier}x ({svgDimensions.width * scaleMultiplier} × {svgDimensions.height * scaleMultiplier} px)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { scale: 1, label: "1x (Web)" },
                      { scale: 2, label: "2x (Retina)" },
                      { scale: 4, label: "4x (4K UHD)" },
                      { scale: 8, label: "8x (8K Print)" },
                    ].map((btn) => (
                      <button
                        key={btn.scale}
                        type="button"
                        onClick={() => setScaleMultiplier(btn.scale)}
                        className={`rounded-xl border py-2 text-center text-xs font-bold transition-all cursor-pointer ${
                          scaleMultiplier === btn.scale
                            ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                            : "border-[#213026] bg-[#080e0b] text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b]"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* JPG Quality */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#8da194]">JPG Compression Quality:</label>
                    <span className="font-mono text-xs font-bold text-amber-400">{jpgQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={jpgQuality}
                    onChange={(e) => setJpgQuality(Number(e.target.value))}
                    className="w-full accent-[#3cff5f] h-1.5 bg-[#1b2720] rounded-lg cursor-pointer"
                  />
                </div>

                {/* EPS PostScript Engine Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#8da194]">EPS PostScript Output Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEpsMode("vector")}
                      className={`rounded-xl border p-2 text-left text-xs transition-all cursor-pointer ${
                        epsMode === "vector"
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#8da194] hover:text-[#e7eee9]"
                      }`}
                    >
                      <div className="font-black">Pure Vector Path</div>
                      <div className="text-[10px] text-[#8da194]">Illustrator Editable</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpsMode("hires")}
                      className={`rounded-xl border p-2 text-left text-xs transition-all cursor-pointer ${
                        epsMode === "hires"
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                          : "border-[#213026] bg-[#080e0b] text-[#8da194] hover:text-[#e7eee9]"
                      }`}
                    >
                      <div className="font-black">Colorimage Stream</div>
                      <div className="text-[10px] text-[#8da194]">Hi-Res Complex Filter</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Format Action Cards */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    <span className="text-[10px] text-[#8da194] mt-0.5">{scaleMultiplier}x Alpha</span>
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
                    <span className="text-[10px] text-[#8da194] mt-0.5">{jpgQuality}% Quality</span>
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

                {/* Export All */}
                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={handleExportAllSingle}
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
      )}
    </div>
  );
}
