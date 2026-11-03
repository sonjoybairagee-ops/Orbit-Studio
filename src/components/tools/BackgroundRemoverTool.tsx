"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Palette,
  Eye,
  Layers,
  Wand2,
  FolderArchive,
  Trash2,
  Play,
  Plus,
  Loader2,
  FolderOpen,
} from "lucide-react";
import {
  BulkImageItem,
  RemovalEngine,
  BgOption,
  processBulkImagesToZip,
  removeBackgroundCanvas,
  removeBackgroundAi,
  compositeCutoutBackground,
  downloadBlob,
} from "@/lib/background-remover-engine";
import { formatBytes } from "@/lib/image-utils";

interface BackdropConfig {
  id: BgOption;
  label: string;
  badgeText: string;
  previewStyle: React.CSSProperties;
}

const BACKDROP_OPTIONS: BackdropConfig[] = [
  {
    id: "transparent",
    label: "Transparent PNG",
    badgeText: "TRANSPARENT",
    previewStyle: {
      backgroundImage:
        "linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)",
      backgroundSize: "6px 6px",
      backgroundColor: "#1f2937",
    },
  },
  {
    id: "white",
    label: "Studio White",
    badgeText: "WHITE",
    previewStyle: {
      backgroundColor: "#ffffff",
      border: "1px solid #d1d5db",
    },
  },
  {
    id: "black",
    label: "Studio Black",
    badgeText: "BLACK",
    previewStyle: {
      backgroundColor: "#050505",
      border: "1px solid #374151",
    },
  },
  {
    id: "custom",
    label: "Custom Color",
    badgeText: "CUSTOM",
    previewStyle: {
      backgroundColor: "#3cff5f",
    },
  },
];

export default function BackgroundRemoverTool() {
  // Navigation Mode: Bulk or Single
  const [activeTabMode, setActiveTabMode] = useState<"bulk" | "single">("bulk");

  // ==========================================
  // BULK BATCH REMOVER STATE
  // ==========================================
  const [bulkImages, setBulkImages] = useState<BulkImageItem[]>([]);
  const [bulkEngine, setBulkEngine] = useState<RemovalEngine>("smart-studio");
  const [bulkOutputBg, setBulkOutputBg] = useState<BgOption>("transparent");
  const [bulkCustomColor, setBulkCustomColor] = useState<string>("#ffffff");
  const [bulkTolerance, setBulkTolerance] = useState<number>(38);
  const [bulkAutoDetectCorner, setBulkAutoDetectCorner] = useState<boolean>(true);
  const [bulkAutoProcessOnUpload, setBulkAutoProcessOnUpload] = useState<boolean>(true);
  const [bulkAutoDownloadZip, setBulkAutoDownloadZip] = useState<boolean>(true);
  const [bulkZipName, setBulkZipName] = useState<string>("compx-cutouts-bundle");
  const [bulkContiguousMode, setBulkContiguousMode] = useState<boolean>(true);
  const [bulkDecontaminate, setBulkDecontaminate] = useState<boolean>(true);

  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<{
    processed: number;
    total: number;
    currentName: string;
    percent: number;
  }>({
    processed: 0,
    total: 0,
    currentName: "",
    percent: 0,
  });

  const [bulkZipResult, setBulkZipResult] = useState<{
    blob: Blob;
    total: number;
    size: number;
  } | null>(null);

  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFolderInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // SINGLE EDITOR STATE
  // ==========================================
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleOriginalUrl, setSingleOriginalUrl] = useState<string>("");
  const [singleProcessedUrl, setSingleProcessedUrl] = useState<string>("");
  const [singleMode, setSingleMode] = useState<RemovalEngine>("smart-studio");
  const [singleBg, setSingleBg] = useState<BgOption>("transparent");
  const [singleCustomColor, setSingleCustomColor] = useState<string>("#3cff5f");
  const [singleTolerance, setSingleTolerance] = useState<number>(35);
  const [singleTargetColor, setSingleTargetColor] = useState<string>("#ffffff");
  const [singleContiguousMode, setSingleContiguousMode] = useState<boolean>(true);
  const [singleDecontaminate, setSingleDecontaminate] = useState<boolean>(true);

  const [isSingleProcessing, setIsSingleProcessing] = useState<boolean>(false);
  const [singleProgressMsg, setSingleProgressMsg] = useState<string>("");
  const [singleProgressPercent, setSingleProgressPercent] = useState<number>(0);
  const [singleError, setSingleError] = useState<string>("");
  const [singleCopied, setSingleCopied] = useState<boolean>(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const singleProcessedBlobRef = useRef<Blob | null>(null);
  const singleImgRef = useRef<HTMLImageElement | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (singleOriginalUrl) URL.revokeObjectURL(singleOriginalUrl);
      if (singleProcessedUrl) URL.revokeObjectURL(singleProcessedUrl);
      bulkImages.forEach((item) => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
      });
    };
  }, [bulkImages, singleOriginalUrl, singleProcessedUrl]);

  // ==========================================
  // BULK BATCH HANDLERS
  // ==========================================
  const handleBulkUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, JPEG, WebP).");
      return;
    }

    const newItems: BulkImageItem[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `img_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        name: file.name,
        originalUrl: url,
        processedUrl: null,
        processedBlob: null,
        size: file.size,
        width: 800,
        height: 800,
        status: "idle",
        progress: 0,
      });
    }

    setBulkImages((prev) => {
      const merged = [...prev, ...newItems];
      if (bulkAutoProcessOnUpload) {
        setTimeout(() => {
          runBulkProcess(merged);
        }, 120);
      }
      return merged;
    });

    setBulkZipResult(null);
  };

  // Generate 4 diverse sample images on HTML5 canvas for 1-click test
  const handleLoadSampleBulkPack = () => {
    const samples = [
      { name: "Product-Sneaker.jpg", bg: "#ffffff", shape: "sneaker" },
      { name: "Portrait-Avatar.jpg", bg: "#3b82f6", shape: "avatar" },
      { name: "Electronics-Camera.jpg", bg: "#10b981", shape: "camera" },
      { name: "Fashion-Watch.jpg", bg: "#e2e8f0", shape: "watch" },
    ];

    const generatedItems: BulkImageItem[] = [];

    samples.forEach((sample, idx) => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Solid studio background
      ctx.fillStyle = sample.bg;
      ctx.fillRect(0, 0, 600, 600);

      if (sample.shape === "sneaker") {
        // Red shoe shape
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.roundRect(120, 240, 360, 140, [30, 80, 20, 40]);
        ctx.fill();
        ctx.fillStyle = "#111827";
        ctx.fillRect(140, 360, 320, 30);
      } else if (sample.shape === "avatar") {
        // Person silhouette
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(300, 240, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(300, 500, 190, Math.PI, 0);
        ctx.fill();
      } else if (sample.shape === "camera") {
        // Dark camera body
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.roundRect(160, 200, 280, 200, 25);
        ctx.fill();
        // Lens
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(300, 300, 65, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Watch dial & strap
        ctx.fillStyle = "#334155";
        ctx.fillRect(260, 100, 80, 400);
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath();
        ctx.arc(300, 300, 90, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], sample.name, { type: "image/jpeg" });
          const url = URL.createObjectURL(file);
          generatedItems.push({
            id: `sample_${idx}_${Date.now()}`,
            file,
            name: sample.name,
            originalUrl: url,
            processedUrl: null,
            processedBlob: null,
            size: blob.size,
            width: 600,
            height: 600,
            status: "idle",
            progress: 0,
          });

          if (generatedItems.length === samples.length) {
            setBulkImages(generatedItems);
            setBulkZipResult(null);
            if (bulkAutoProcessOnUpload) {
              setTimeout(() => {
                runBulkProcess(generatedItems);
              }, 120);
            }
          }
        }
      }, "image/jpeg");
    });
  };

  // Run Bulk Removal Pipeline
  const runBulkProcess = async (itemsToProcess = bulkImages) => {
    if (itemsToProcess.length === 0) {
      alert("Please upload at least one image first!");
      return;
    }

    setIsBulkProcessing(true);
    setBulkZipResult(null);
    setBulkProgress({
      processed: 0,
      total: itemsToProcess.length,
      currentName: "Starting engine...",
      percent: 0,
    });

    try {
      const result = await processBulkImagesToZip(
        itemsToProcess,
        {
          engine: bulkEngine,
          tolerance: bulkTolerance,
          autoDetectCorner: bulkAutoDetectCorner,
          outputBg: bulkOutputBg,
          customBgColor: bulkCustomColor,
          contiguousMode: bulkContiguousMode,
          decontaminateFringe: bulkDecontaminate,
        },
        bulkZipName,
        (prog) => {
          setBulkProgress({
            processed: prog.processed,
            total: prog.total,
            currentName: prog.currentName,
            percent: prog.percent,
          });
        }
      );

      // Update individual items with their processed preview URLs
      const mapResults = new Map(result.processedItems.map((r) => [r.id, r]));

      setBulkImages((prev) =>
        prev.map((item) => {
          const res = mapResults.get(item.id);
          if (res) {
            return {
              ...item,
              status: "done",
              processedUrl: res.url,
              processedBlob: res.blob,
            };
          }
          return item;
        })
      );

      setBulkZipResult({
        blob: result.zipBlob,
        total: result.totalProcessed,
        size: result.zipSize,
      });

      // Auto Download ZIP if enabled
      if (bulkAutoDownloadZip && result.zipBlob) {
        downloadBlob(result.zipBlob, `${bulkZipName}.zip`);
      }
    } catch (err) {
      alert("Bulk background removal error: " + String(err));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleClearBulk = () => {
    setBulkImages([]);
    setBulkZipResult(null);
    setBulkProgress({
      processed: 0,
      total: 0,
      currentName: "",
      percent: 0,
    });
  };

  const handleRemoveBulkItem = (id: string) => {
    setBulkImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDownloadSingleCutoutFromBulk = (item: BulkImageItem) => {
    if (!item.processedBlob) return;
    const base = item.name.replace(/\.[^/.]+$/, "");
    downloadBlob(item.processedBlob, `${base}_cutout.png`);
  };

  // ==========================================
  // SINGLE EDITOR HANDLERS
  // ==========================================
  const handleSingleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSingleError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setSingleError("");
    setSingleImageFile(file);

    if (singleOriginalUrl) URL.revokeObjectURL(singleOriginalUrl);
    if (singleProcessedUrl) URL.revokeObjectURL(singleProcessedUrl);
    setSingleProcessedUrl("");

    const url = URL.createObjectURL(file);
    setSingleOriginalUrl(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      singleImgRef.current = img;

      // Auto-detect corner pixel color for chroma key
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 10;
      tempCanvas.height = 10;
      const tCtx = tempCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(img, 0, 0, 10, 10);
        const p = tCtx.getImageData(0, 0, 1, 1).data;
        const autoHex =
          "#" + [p[0], p[1], p[2]].map((x) => x.toString(16).padStart(2, "0")).join("");
        setSingleTargetColor(autoHex);
      }

      runSingleRemoval(file, img);
    };
    img.src = url;
  };

  const runSingleRemoval = async (file: File, img: HTMLImageElement) => {
    setIsSingleProcessing(true);
    setSingleProgressMsg("Removing background...");
    setSingleProgressPercent(25);
    setSingleError("");

    try {
      let cutoutBlob: Blob;

      if (singleMode === "ai-deep") {
        try {
          cutoutBlob = await removeBackgroundAi(file, (msg, pct) => {
            setSingleProgressMsg(msg);
            setSingleProgressPercent(pct);
          });
        } catch {
          // Fallback to studio canvas
          cutoutBlob = await removeBackgroundCanvas(img, {
            autoDetectCorner: true,
            tolerance: singleTolerance,
          });
        }
      } else {
        cutoutBlob = await removeBackgroundCanvas(img, {
          targetColor: singleTargetColor,
          tolerance: singleTolerance,
          autoDetectCorner: true,
          contiguousMode: singleContiguousMode,
          decontaminateFringe: singleDecontaminate,
        });
      }

      // Backdrop composite
      const finalBlob = await compositeCutoutBackground(cutoutBlob, singleBg, singleCustomColor);
      singleProcessedBlobRef.current = finalBlob;

      if (singleProcessedUrl) URL.revokeObjectURL(singleProcessedUrl);
      const url = URL.createObjectURL(finalBlob);
      setSingleProcessedUrl(url);
      setSingleProgressPercent(100);
      setSingleProgressMsg("Done!");
    } catch (err) {
      setSingleError("Background removal failed: " + String(err));
    } finally {
      setIsSingleProcessing(false);
    }
  };

  const handleSingleDownload = () => {
    if (!singleProcessedBlobRef.current) return;
    const base = singleImageFile?.name?.replace(/\.[^/.]+$/, "") || "transparent";
    downloadBlob(singleProcessedBlobRef.current, `compx-removed-bg-${base}.png`);
  };

  const handleSingleCopy = async () => {
    if (!singleProcessedBlobRef.current) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": singleProcessedBlobRef.current,
        }),
      ]);
      setSingleCopied(true);
      setTimeout(() => setSingleCopied(false), 2000);
    } catch {
      setSingleError("Clipboard write failed. Please use Download button instead.");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden File Inputs */}
      <input
        ref={bulkFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBulkUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={bulkFolderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in Chromium
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBulkUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleSingleFileSelect(f);
        }}
      />

      {/* Top Banner & Mode Switcher */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shrink-0">
                <Wand2 className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#e7eee9]">
                {activeTabMode === "bulk"
                  ? "CompX Bulk Background Remover Engine"
                  : "CompX Single Studio Cutout Editor"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8da194]">
              {activeTabMode === "bulk"
                ? "Upload multiple images, auto-remove white studio or complex backgrounds, and download cutouts as a ZIP bundle."
                : "Upload an image, inspect cutouts side-by-side, fine-tune edge tolerance, and export full-resolution PNG."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="shrink-0 flex items-center gap-1 rounded-xl border border-[#213026] bg-[#080e0b] p-1 w-full sm:w-auto overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTabMode("bulk")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTabMode === "bulk"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-sm font-black"
                  : "text-[#8da194] hover:text-[#e7eee9] hover:bg-[#102016]/40"
              }`}
            >
              <FolderArchive className="h-4 w-4 shrink-0" />
              <span>Bulk Batch Remover</span>
              {bulkImages.length > 0 && (
                <span className="rounded-full bg-[#050a08] px-1.5 py-0.5 text-[10px] font-bold text-[#3cff5f]">
                  {bulkImages.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTabMode("single")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTabMode === "single"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-sm font-black"
                  : "text-[#8da194] hover:text-[#e7eee9] hover:bg-[#102016]/40"
              }`}
            >
              <Palette className="h-4 w-4 shrink-0" />
              <span>Single Studio Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BULK BATCH REMOVER TAB */}
      {/* ========================================================= */}
      {activeTabMode === "bulk" && (
        <div className="space-y-6">
          {/* Bulk Controls & Settings Hub */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1b2720] pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#3cff5f] shrink-0" />
                  <span>Removal Engine & Output Settings</span>
                </h3>
                <p className="text-xs text-[#8da194] mt-0.5">
                  Choose between Ultra-Fast Smart Studio Mode (50+ photos in seconds) or AI Deep Cutout.
                </p>
              </div>

              {/* Engine Switcher */}
              <div className="shrink-0 flex items-center gap-1 rounded-xl border border-[#213026] bg-[#080e0b] p-1 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBulkEngine("smart-studio")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    bulkEngine === "smart-studio"
                      ? "bg-[#3cff5f] text-[#050a08]"
                      : "text-[#8da194] hover:text-[#e7eee9]"
                  }`}
                >
                  <span>⚡ Smart Studio (Fast)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBulkEngine("ai-deep")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    bulkEngine === "ai-deep"
                      ? "bg-[#3cff5f] text-[#050a08]"
                      : "text-[#8da194] hover:text-[#e7eee9]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>🤖 AI Deep Cutout</span>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Output Backdrop Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Output Backdrop:</label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKDROP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBulkOutputBg(opt.id)}
                      className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer text-center whitespace-nowrap ${
                        bulkOutputBg === opt.id
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                          : "border-[#213026] bg-[#080e0b] text-[#8da194] hover:text-[#e7eee9]"
                      }`}
                    >
                      {opt.badgeText}
                    </button>
                  ))}
                </div>
                {bulkOutputBg === "custom" && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-[#8da194]">Pick Color:</span>
                    <input
                      type="color"
                      value={bulkCustomColor}
                      onChange={(e) => setBulkCustomColor(e.target.value)}
                      className="h-7 w-12 rounded-lg border border-[#213026] bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-xs font-mono text-[#3cff5f]">{bulkCustomColor}</span>
                  </div>
                )}
              </div>

              {/* Tolerance (Smart Studio) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#8da194]">Color Sensitivity:</label>
                  <span className="font-mono font-bold text-[#3cff5f]">{bulkTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={bulkTolerance}
                  onChange={(e) => setBulkTolerance(Number(e.target.value))}
                  className="w-full accent-[#3cff5f] h-2 bg-[#1b2720] rounded-lg cursor-pointer block"
                />
                <p className="text-[10px] text-[#62776a] mt-1 m-0">Auto-detects corner studio background</p>
              </div>
            </div>

            {/* Studio High-Quality Cleanliness Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1b2720]">
              <label className="flex items-start gap-2.5 rounded-xl border border-[#213026] bg-[#080e0b]/70 p-3 cursor-pointer select-none hover:border-[#3cff5f]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={bulkContiguousMode}
                  onChange={(e) => setBulkContiguousMode(e.target.checked)}
                  className="accent-[#3cff5f] h-4 w-4 rounded mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <span>🛡️ Protect Subject Interior (Border-Connected)</span>
                    <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                      STUDIO PRO
                    </span>
                  </span>
                  <p className="text-[11px] text-[#8da194] mt-0.5">
                    Only carves background connected to outer borders. Internal white clothing, text, sneaker soles &amp; reflections are 100% protected.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 rounded-xl border border-[#213026] bg-[#080e0b]/70 p-3 cursor-pointer select-none hover:border-[#3cff5f]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={bulkDecontaminate}
                  onChange={(e) => setBulkDecontaminate(e.target.checked)}
                  className="accent-[#3cff5f] h-4 w-4 rounded mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <span>✨ Anti-Halo &amp; Color Decontamination</span>
                    <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                      CRISP EDGES
                    </span>
                  </span>
                  <p className="text-[11px] text-[#8da194] mt-0.5">
                    Removes white/green edge bleeding and fringe halos on semi-transparent borders for razor-sharp cutouts on any background.
                  </p>
                </div>
              </label>
            </div>

            {/* Automation Toggles & ZIP Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-[#1b2720]">
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bulkAutoProcessOnUpload}
                    onChange={(e) => setBulkAutoProcessOnUpload(e.target.checked)}
                    className="accent-[#3cff5f] h-4 w-4 rounded"
                  />
                  <span className="text-xs font-bold text-[#e7eee9]">
                    ⚡ Auto-remove background immediately on upload
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={bulkAutoDownloadZip}
                    onChange={(e) => setBulkAutoDownloadZip(e.target.checked)}
                    className="accent-[#3cff5f] h-4 w-4 rounded"
                  />
                  <span className="text-xs font-bold text-[#e7eee9]">
                    📥 Auto-download ZIP archive when complete
                  </span>
                </label>
              </div>

              {/* Bundle ZIP Name */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#8da194] shrink-0">ZIP Name:</span>
                <div className="flex items-center rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 focus-within:border-[#3cff5f] transition-colors">
                  <input
                    type="text"
                    value={bulkZipName}
                    onChange={(e) => setBulkZipName(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "_"))}
                    className="bg-transparent text-xs font-mono text-[#3cff5f] focus:outline-none w-36 sm:w-44"
                    placeholder="compx-cutouts-bundle"
                  />
                  <span className="text-xs text-[#62776a] shrink-0 font-mono">.zip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Drop & Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleBulkUpload(e.dataTransfer.files);
            }}
            onClick={() => bulkFileInputRef.current?.click()}
            className="rounded-3xl border-2 border-dashed border-[#2a5234] bg-[#0c1510]/90 hover:bg-[#102217] hover:border-[#3cff5f] p-8 text-center transition-all cursor-pointer shadow-xl group"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-[#e7eee9]">
              Drag & Drop Multiple Photos / Product Images Here
            </h3>
            <p className="mt-1 text-xs text-[#8da194] max-w-md mx-auto">
              Select 5, 20, or 50+ photos (JPG, PNG, WebP) or entire folders. All backgrounds will be cleanly removed and bundled into a ZIP.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => bulkFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-5 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#50ff70] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 hover:scale-[1.02] active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Select Photos</span>
              </button>

              <button
                type="button"
                onClick={() => bulkFolderInputRef.current?.click()}
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
                <span>⚡ Test with 4 Sample Photos</span>
              </button>
            </div>
          </div>

          {/* Progress Bar (during batch processing) */}
          {isBulkProcessing && (
            <div className="rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1f13] to-[#08120c] p-6 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#3cff5f] flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing Backgrounds: {bulkProgress.processed} of {bulkProgress.total} images...
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
                  Processing: {bulkProgress.currentName}
                </span>
                <span>Engine: {bulkEngine === "smart-studio" ? "⚡ Smart Studio" : "🤖 AI Deep"}</span>
              </div>
            </div>
          )}

          {/* Result ZIP Ready Card */}
          {bulkZipResult && !isBulkProcessing && (
            <div className="rounded-3xl border-2 border-[#3cff5f] bg-[#0c2214] p-6 shadow-[0_0_40px_rgba(60,255,95,0.25)] flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] shadow-lg shadow-[#3cff5f]/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#e7eee9]">
                    Bulk Background Removal Complete! 🎉
                  </h3>
                  <p className="text-xs text-[#8da194] mt-0.5">
                    <b>{bulkZipResult.total} cutouts</b> generated ({formatBytes(bulkZipResult.size)} ZIP archive).
                    {bulkAutoDownloadZip && " Auto-downloaded to your computer."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => downloadBlob(bulkZipResult.blob, `${bulkZipName}.zip`)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 hover:scale-105 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download All Cutouts (.zip)</span>
                </button>
              </div>
            </div>
          )}

          {/* Bulk Images Queue & Gallery */}
          {bulkImages.length > 0 && (
            <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1b2720] pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#102a16] text-[#3cff5f] font-bold text-xs border border-[#2a5234]">
                    {bulkImages.length}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#e7eee9]">
                      Images Queue & Cutout Previews
                    </h3>
                    <span className="text-[11px] text-[#8da194]">
                      {bulkImages.filter((x) => x.status === "done").length} of {bulkImages.length} cutouts ready
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
                    onClick={handleClearBulk}
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

              {/* Items Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[550px] overflow-y-auto pr-1">
                {bulkImages.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl border border-[#1b2720] bg-[#080e0b] p-3 space-y-2.5 hover:border-[#2a5234] transition-all"
                  >
                    {/* Before / After Previews */}
                    <div className="grid grid-cols-2 gap-2 h-28">
                      {/* Original */}
                      <div className="relative rounded-xl border border-[#213026] bg-[#050a08] overflow-hidden flex items-center justify-center p-1">
                        <span className="absolute top-1 left-1 rounded bg-[#080e0b]/80 px-1 py-0.2 text-[9px] font-bold text-[#8da194] z-10">
                          Original
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.originalUrl}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Cutout Result */}
                      <div
                        className="relative rounded-xl border border-[#213026] overflow-hidden flex items-center justify-center p-1"
                        style={{
                          backgroundImage:
                            bulkOutputBg === "transparent"
                              ? "linear-gradient(45deg, #18281e 25%, transparent 25%), linear-gradient(-45deg, #18281e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18281e 75%), linear-gradient(-45deg, transparent 75%, #18281e 75%)"
                              : undefined,
                          backgroundSize: "8px 8px",
                          backgroundColor:
                            bulkOutputBg === "transparent"
                              ? "#0d1a12"
                              : bulkOutputBg === "white"
                              ? "#ffffff"
                              : bulkOutputBg === "black"
                              ? "#000000"
                              : bulkCustomColor,
                        }}
                      >
                        <span className="absolute top-1 left-1 rounded bg-[#080e0b]/80 px-1 py-0.2 text-[9px] font-bold text-[#3cff5f] z-10">
                          Cutout
                        </span>
                        {item.status === "processing" ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 className="h-5 w-5 animate-spin text-[#3cff5f]" />
                            <span className="text-[10px] text-[#3cff5f]">Removing...</span>
                          </div>
                        ) : item.processedUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.processedUrl}
                            alt="Cutout"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-[#62776a]">Waiting</span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#14231b]">
                      <div className="overflow-hidden mr-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-[#62776a]">#{idx + 1}</span>
                          <h4 className="text-xs font-bold text-[#e7eee9] truncate max-w-[120px]">
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8da194]">
                          <span>{formatBytes(item.size)}</span>
                          {item.width > 0 && (
                            <span className="font-mono text-[#3cff5f]">
                              • {item.width}×{item.height} HQ PNG
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.processedBlob && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleCutoutFromBulk(item)}
                            className="rounded-lg bg-[#102a16] border border-[#2a5234] p-1.5 text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer"
                            title="Download PNG"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkItem(item.id)}
                          className="rounded-lg p-1.5 text-[#62776a] hover:text-red-400 hover:bg-[#1a1215] transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SINGLE STUDIO EDITOR TAB */}
      {/* ========================================================= */}
      {activeTabMode === "single" && (
        <div className="space-y-6">
          {/* Upload & Controls Hub */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 sm:p-6 shadow-xl space-y-5">
            {/* Header: Title and Engine Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1b2720] pb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#3cff5f] shrink-0" />
                  <span>Single Image Studio Editor</span>
                </h3>
                <p className="text-xs text-[#8da194] mt-0.5">
                  Inspect cutouts side by side, fine-tune color tolerance, and replace backgrounds.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                {/* Engine Switcher */}
                <div className="shrink-0 flex items-center gap-1 rounded-xl border border-[#213026] bg-[#080e0b] p-1 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSingleMode("smart-studio");
                      if (singleImageFile && singleImgRef.current) {
                        setTimeout(() => runSingleRemoval(singleImageFile, singleImgRef.current!), 50);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      singleMode === "smart-studio"
                        ? "bg-[#3cff5f] text-[#050a08]"
                        : "text-[#8da194] hover:text-[#e7eee9]"
                    }`}
                  >
                    <span>⚡ Smart Studio (Fast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSingleMode("ai-deep");
                      if (singleImageFile && singleImgRef.current) {
                        setTimeout(() => runSingleRemoval(singleImageFile, singleImgRef.current!), 50);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      singleMode === "ai-deep"
                        ? "bg-[#3cff5f] text-[#050a08]"
                        : "text-[#8da194] hover:text-[#e7eee9]"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>🤖 AI Deep Cutout</span>
                  </button>
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{singleImageFile ? "Change Image" : "Upload Image"}</span>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Output Backdrop Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Output Backdrop:</label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKDROP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSingleBg(opt.id);
                        if (singleImageFile && singleImgRef.current) {
                          runSingleRemoval(singleImageFile, singleImgRef.current);
                        }
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center truncate ${
                        singleBg === opt.id
                          ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                          : "border-[#213026] bg-[#080e0b] text-[#8da194] hover:text-[#e7eee9]"
                      }`}
                    >
                      {opt.badgeText}
                    </button>
                  ))}
                </div>
                {singleBg === "custom" && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-[#8da194]">Pick Color:</span>
                    <input
                      type="color"
                      value={singleCustomColor}
                      onChange={(e) => {
                        setSingleCustomColor(e.target.value);
                        if (singleImageFile && singleImgRef.current) {
                          runSingleRemoval(singleImageFile, singleImgRef.current);
                        }
                      }}
                      className="h-7 w-12 rounded-lg border border-[#213026] bg-transparent cursor-pointer p-0"
                    />
                    <span className="text-xs font-mono text-[#3cff5f]">{singleCustomColor}</span>
                  </div>
                )}
              </div>

              {/* Tolerance (Smart Studio) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#8da194]">Color Sensitivity:</label>
                  <span className="font-mono font-bold text-[#3cff5f]">{singleTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={singleTolerance}
                  onChange={(e) => setSingleTolerance(Number(e.target.value))}
                  onMouseUp={() => {
                    if (singleImageFile && singleImgRef.current) {
                      runSingleRemoval(singleImageFile, singleImgRef.current);
                    }
                  }}
                  onTouchEnd={() => {
                    if (singleImageFile && singleImgRef.current) {
                      runSingleRemoval(singleImageFile, singleImgRef.current);
                    }
                  }}
                  className="w-full accent-[#3cff5f] h-2 bg-[#1b2720] rounded-lg cursor-pointer block"
                />
                <p className="text-[10px] text-[#62776a] mt-1 m-0">Auto-detects corner studio background</p>
              </div>
            </div>

            {/* Studio High-Quality Cleanliness Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1b2720]">
              <label className="flex items-start gap-2.5 rounded-xl border border-[#213026] bg-[#080e0b]/70 p-3 cursor-pointer select-none hover:border-[#3cff5f]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={singleContiguousMode}
                  onChange={(e) => {
                    setSingleContiguousMode(e.target.checked);
                    if (singleImageFile && singleImgRef.current) {
                      setTimeout(() => runSingleRemoval(singleImageFile, singleImgRef.current!), 50);
                    }
                  }}
                  className="accent-[#3cff5f] h-4 w-4 rounded mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <span>🛡️ Protect Subject Interior (Border-Connected)</span>
                    <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                      STUDIO PRO
                    </span>
                  </span>
                  <p className="text-[11px] text-[#8da194] mt-0.5">
                    Only carves background connected to outer borders. Internal white clothing, text, sneaker soles &amp; reflections are 100% protected.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 rounded-xl border border-[#213026] bg-[#080e0b]/70 p-3 cursor-pointer select-none hover:border-[#3cff5f]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={singleDecontaminate}
                  onChange={(e) => {
                    setSingleDecontaminate(e.target.checked);
                    if (singleImageFile && singleImgRef.current) {
                      setTimeout(() => runSingleRemoval(singleImageFile, singleImgRef.current!), 50);
                    }
                  }}
                  className="accent-[#3cff5f] h-4 w-4 rounded mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <span>✨ Anti-Halo &amp; Color Decontamination</span>
                    <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                      CRISP EDGES
                    </span>
                  </span>
                  <p className="text-[11px] text-[#8da194] mt-0.5">
                    Removes white/green edge bleeding and fringe halos on semi-transparent borders for razor-sharp cutouts on any background.
                  </p>
                </div>
              </label>
            </div>

            {/* Progress Bar */}
            {isSingleProcessing && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#3cff5f] font-medium flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {singleProgressMsg}
                  </span>
                  <span className="text-[#9baaa1] font-mono">{singleProgressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-[#080e0b] rounded-full overflow-hidden border border-[#213026]">
                  <div
                    className="h-full bg-gradient-to-r from-[#102a16] to-[#3cff5f] transition-all duration-300"
                    style={{ width: `${singleProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {singleError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{singleError}</span>
              </div>
            )}
          </div>

          {/* Main Comparison & Result */}
          {singleProcessedUrl || singleOriginalUrl ? (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-1 font-mono font-bold text-[#3cff5f]">
                    <span>✨ 100% Full Resolution</span>
                    <span>•</span>
                    <span>Lossless 32-bit PNG</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSingleCopy}
                    disabled={!singleProcessedUrl}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#102a16] px-4 py-2 text-xs sm:text-sm font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {singleCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{singleCopied ? "Copied PNG!" : "Copy PNG"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSingleDownload}
                    disabled={!singleProcessedUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-5 py-2 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20 disabled:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Cutout PNG</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] overflow-hidden flex flex-col shadow-xl">
                  <div className="px-5 py-3 border-b border-[#213026] bg-[#080e0b] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#e7eee9]">Original Image</span>
                    <span className="text-[#9baaa1] font-mono">{singleImageFile?.name || "Uploaded"}</span>
                  </div>
                  <div className="relative aspect-square w-full bg-[#050a08] flex items-center justify-center p-4 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={singleOriginalUrl}
                      alt="Original"
                      className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] overflow-hidden flex flex-col shadow-xl">
                  <div className="px-5 py-3 border-b border-[#213026] bg-[#080e0b] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3cff5f] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Cutout Result</span>
                    </span>
                    <span className="text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {singleBg.toUpperCase()}
                    </span>
                  </div>
                  <div
                    className="relative aspect-square w-full flex items-center justify-center p-4 overflow-hidden"
                    style={{
                      backgroundImage:
                        singleBg === "transparent"
                          ? "linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)"
                          : undefined,
                      backgroundSize: "16px 16px",
                      backgroundColor:
                        singleBg === "transparent"
                          ? "#1f2937"
                          : singleBg === "white"
                          ? "#ffffff"
                          : singleBg === "black"
                          ? "#000000"
                          : singleCustomColor,
                    }}
                  >
                    {isSingleProcessing ? (
                      <div className="text-center p-6 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#3cff5f] mx-auto" />
                        <p className="text-xs text-[#3cff5f] font-semibold">{singleProgressMsg}</p>
                      </div>
                    ) : singleProcessedUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={singleProcessedUrl}
                        alt="Cutout"
                        className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div
              onClick={() => singleFileInputRef.current?.click()}
              className="rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center hover:border-[#3cff5f]/50 transition-colors cursor-pointer group"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
                <Wand2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[#e7eee9]">
                Click or Drag Image to Open in Single Studio
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
                Inspect before and after side-by-side with full precision.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
