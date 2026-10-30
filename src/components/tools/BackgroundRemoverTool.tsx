"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";

type ProcessingMode = "ai" | "chroma";
type BgOption = "transparent" | "white" | "black" | "gradient1" | "gradient2" | "gradient3" | "custom";

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
    id: "gradient2",
    label: "Neon Sunset (Pink / Purple)",
    badgeText: "SUNSET",
    previewStyle: {
      background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
    },
  },
  {
    id: "gradient1",
    label: "Cyberpunk (Indigo / Cyan)",
    badgeText: "CYBERPUNK",
    previewStyle: {
      background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
    },
  },
  {
    id: "gradient3",
    label: "Emerald Orbit (Green / Dark)",
    badgeText: "EMERALD",
    previewStyle: {
      background: "linear-gradient(135deg, #102a16 0%, #050a08 100%)",
      border: "1px solid #2a5234",
    },
  },
];

export default function BackgroundRemoverTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("ai");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Background replacement
  const [selectedBg, setSelectedBg] = useState<BgOption>("transparent");
  const [customColor, setCustomColor] = useState<string>("#3cff5f");
  const [viewMode, setViewMode] = useState<"side-by-side" | "result-only">("side-by-side");

  // Chroma key / Color tolerance settings
  const [targetColor, setTargetColor] = useState<string>("#ffffff");
  const [tolerance, setTolerance] = useState<number>(35);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedBlobRef = useRef<Blob | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  // AI-powered Background Removal via in-browser WebAssembly
  const runAiRemoval = async (file: File) => {
    setIsProcessing(true);
    setProgressMsg("Preparing image...");
    setProgressPercent(15);
    setError("");

    try {
      // Dynamic import to prevent any SSR evaluation issues
      const { removeBackground } = await import("@imgly/background-removal");

      setProgressMsg("Detecting subject and removing background...");
      setProgressPercent(35);

      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const p = Math.round((current / total) * 100);
            if (key.includes("fetch")) {
              setProgressMsg(`Preparing image (${p}%)...`);
              setProgressPercent(15 + Math.round(p * 0.35));
            } else if (key.includes("compute")) {
              setProgressMsg(`Removing background (${p}%)...`);
              setProgressPercent(50 + Math.round(p * 0.45));
            }
          }
        },
      });

      processedBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProgressPercent(100);
      setProgressMsg("Background removed successfully!");
    } catch (err: unknown) {
      console.error("Removal error:", err);
      // Fallback to chroma key
      runChromaKeyRemoval();
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant Canvas-based Chroma / Solid Color Key Removal
  const runChromaKeyRemoval = useCallback(() => {
    if (!originalImgRef.current) return;
    setIsProcessing(true);
    setProgressMsg("Removing color background...");
    setError("");

    try {
      const img = originalImgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context");

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Parse target hex color
      const hex = targetColor.replace("#", "");
      const tr = parseInt(hex.substring(0, 2), 16);
      const tg = parseInt(hex.substring(2, 4), 16);
      const tb = parseInt(hex.substring(4, 6), 16);

      const maxDist = (tolerance / 100) * 441.67; // max distance sqrt(255^2 * 3)

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance
        const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

        if (dist <= maxDist) {
          // Feather edges smoothly near the tolerance boundary
          const featherRange = maxDist * 0.3;
          if (dist > maxDist - featherRange) {
            const alphaRatio = (dist - (maxDist - featherRange)) / featherRange;
            data[i + 3] = Math.round(data[i + 3] * alphaRatio);
          } else {
            data[i + 3] = 0; // 100% transparent
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          processedBlobRef.current = blob;
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          const url = URL.createObjectURL(blob);
          setProcessedUrl(url);
          setProgressMsg("Background removed!");
        }
        setIsProcessing(false);
      }, "image/png");
    } catch {
      setError("Failed to remove background using chroma key.");
      setIsProcessing(false);
    }
  }, [processedUrl, targetColor, tolerance]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setImageFile(file);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl("");

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImgRef.current = img;

      // Auto-detect corner pixel color for chroma key
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 10;
      tempCanvas.height = 10;
      const tCtx = tempCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(img, 0, 0, 10, 10);
        const p = tCtx.getImageData(0, 0, 1, 1).data;
        const autoHex = "#" + [p[0], p[1], p[2]].map((x) => x.toString(16).padStart(2, "0")).join("");
        setTargetColor(autoHex);
      }

      // Automatically run AI removal by default
      if (processingMode === "ai") {
        runAiRemoval(file);
      } else {
        runChromaKeyRemoval();
      }
    };
    img.src = url;
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    // If a background color/gradient is selected other than transparent, render onto composite canvas
    if (selectedBg !== "transparent") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (!ctx) return;

        // Draw custom background
        if (selectedBg === "white") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, c.width, c.height);
        } else if (selectedBg === "black") {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, c.width, c.height);
        } else if (selectedBg === "gradient1") {
          const g = ctx.createLinearGradient(0, 0, c.width, c.height);
          g.addColorStop(0, "#4f46e5");
          g.addColorStop(1, "#06b6d4");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, c.width, c.height);
        } else if (selectedBg === "gradient2") {
          const g = ctx.createLinearGradient(0, 0, c.width, c.height);
          g.addColorStop(0, "#ec4899");
          g.addColorStop(1, "#8b5cf6");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, c.width, c.height);
        } else if (selectedBg === "gradient3") {
          const g = ctx.createLinearGradient(0, 0, c.width, c.height);
          g.addColorStop(0, "#102a16");
          g.addColorStop(1, "#050a08");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, c.width, c.height);
        } else if (selectedBg === "custom") {
          ctx.fillStyle = customColor;
          ctx.fillRect(0, 0, c.width, c.height);
        }

        ctx.drawImage(img, 0, 0);

        c.toBlob((blob) => {
          if (!blob) return;
          const u = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = u;
          a.download = `compx-removed-bg-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(u);
        }, "image/png");
      };
      img.src = processedUrl;
      return;
    }

    // Default transparent download
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `compx-removed-bg-${imageFile?.name?.replace(/\.[^/.]+$/, "") || "transparent"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (!processedBlobRef.current) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": processedBlobRef.current,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard write failed. Please use Download button instead.");
    }
  };

  // Sample Images to test instantly
  const loadSample = (sampleType: "portrait" | "product") => {
    // Generate high contrast geometric canvas sample
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (sampleType === "portrait") {
      // Solid bright blue background
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, 0, 800, 800);

      // Person silhouette
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(400, 320, 160, 0, Math.PI * 2); // head
      ctx.fill();

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(400, 680, 260, Math.PI, 0); // body
      ctx.fill();
    } else {
      // Studio product with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 800);

      // Tech device / sneaker shape
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.roundRect(200, 300, 400, 240, 40);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PRODUCT TEST", 400, 430);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample-${sampleType}.png`, { type: "image/png" });
        handleFileSelect(file);
      }
    }, "image/png");
  };

  return (
    <div className="w-full">
      {/* Upload & Controls Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3cff5f]" />
              <span>Instant Background Remover</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Upload any portrait, product, logo, or graphic for instant transparent cutout.
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => loadSample("product")}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-3 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample</span>
            </button>
          </div>
        </div>

        {/* Chroma Key Controls Bar (Only visible if Chroma mode active) */}
        {processingMode === "chroma" && (
          <div className="mt-6 pt-5 border-t border-[#213026] flex flex-wrap items-center gap-6 text-xs text-[#9baaa1]">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#3cff5f]" />
              <span>Background Color:</span>
              <input
                type="color"
                value={targetColor}
                onChange={(e) => {
                  setTargetColor(e.target.value);
                  setTimeout(runChromaKeyRemoval, 50);
                }}
                className="h-8 w-10 cursor-pointer rounded-lg border border-[#213026] bg-transparent p-0.5"
              />
              <span className="font-mono text-[#e7eee9]">{targetColor}</span>
            </div>

            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-[#3cff5f]" />
              <span>Color Tolerance:</span>
              <input
                type="range"
                min="5"
                max="85"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                onMouseUp={runChromaKeyRemoval}
                onTouchEnd={runChromaKeyRemoval}
                className="w-32 accent-[#3cff5f] cursor-pointer"
              />
              <span className="font-mono text-[#e7eee9]">{tolerance}%</span>
            </div>

            <button
              type="button"
              onClick={runChromaKeyRemoval}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#080e0b] px-3 py-1.5 font-semibold text-[#3cff5f] border border-[#213026] hover:border-[#3cff5f] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-Apply</span>
            </button>
          </div>
        )}

        {/* Progress Bar (during AI processing) */}
        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#3cff5f] font-medium flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-[#3cff5f] border-t-transparent rounded-full animate-spin" />
                {progressMsg}
              </span>
              <span className="text-[#9baaa1] font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#080e0b] rounded-full overflow-hidden border border-[#213026]">
              <div
                className="h-full bg-gradient-to-r from-[#102a16] to-[#3cff5f] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Workspace: Comparison & Results */}
      {processedUrl || originalUrl ? (
        <div className="space-y-6">
          {/* Top Action & View Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-4">
            {/* Background Backdrop Selector */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#9baaa1] font-semibold">Backdrop:</span>
              <div className="flex flex-wrap items-center gap-2">
                {BACKDROP_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedBg(opt.id)}
                    className={`swatch-btn no-btn-override group relative p-0.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      selectedBg === opt.id
                        ? "ring-2 ring-[#3cff5f] ring-offset-2 ring-offset-[#080e0b] scale-105"
                        : "opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ background: "#0c1510", border: selectedBg === opt.id ? "1px solid #3cff5f" : "1px solid #26332d" }}
                    title={opt.label}
                  >
                    <span
                      className="block h-7 w-7 rounded-lg shadow-inner flex items-center justify-center transition-transform"
                      style={opt.previewStyle}
                    >
                      {selectedBg === opt.id && (
                        <Check className={`h-4 w-4 ${opt.id === "white" ? "text-black" : "text-white"} drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] stroke-[3]`} />
                      )}
                    </span>
                  </button>
                ))}

                {/* Custom Color Picker Swatch */}
                <label
                  className={`swatch-btn no-btn-override group relative p-0.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    selectedBg === "custom"
                      ? "ring-2 ring-[#3cff5f] ring-offset-2 ring-offset-[#080e0b] scale-105"
                      : "opacity-85 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ background: "#0c1510", border: selectedBg === "custom" ? "1px solid #3cff5f" : "1px solid #26332d" }}
                  title="Pick Custom Color"
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedBg("custom");
                    }}
                    className="sr-only"
                  />
                  <span
                    className="block h-7 w-7 rounded-lg shadow-inner flex items-center justify-center transition-transform"
                    style={{ backgroundColor: customColor }}
                  >
                    {selectedBg === "custom" ? (
                      <Check className="h-4 w-4 text-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] stroke-[3]" />
                    ) : (
                      <Palette className="h-3.5 w-3.5 text-black/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]" />
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                disabled={!processedUrl}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#102a16] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#3cff5f] hover:bg-[#16381e] hover:border-[#3cff5f] transition-colors cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied PNG!" : "Copy PNG"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!processedUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20 disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                <span>Download Result</span>
              </button>
            </div>
          </div>

          {/* Visual Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Image */}
            <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] overflow-hidden flex flex-col shadow-xl">
              <div className="px-5 py-3 border-b border-[#213026] bg-[#080e0b] flex items-center justify-between text-xs">
                <span className="font-bold text-[#e7eee9]">Original Image</span>
                <span className="text-[#9baaa1] font-mono">{imageFile?.name || "Uploaded"}</span>
              </div>
              <div className="relative aspect-square w-full bg-[#050a08] flex items-center justify-center p-4 overflow-hidden">
                {originalUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={originalUrl}
                    alt="Original Upload"
                    className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <span className="text-xs text-[#9baaa1]">No image selected</span>
                )}
              </div>
            </div>

            {/* Right: Transparent Removed BG Result */}
            <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] overflow-hidden flex flex-col shadow-xl">
              <div className="px-5 py-3 border-b border-[#213026] bg-[#080e0b] flex items-center justify-between text-xs">
                <span className="font-bold text-[#3cff5f] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transparent Result</span>
                </span>
                <span className="text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-md font-mono text-[10px]">
                  {selectedBg.toUpperCase()}
                </span>
              </div>

              {/* Backdrop Container */}
              <div
                className="relative aspect-square w-full flex items-center justify-center p-4 overflow-hidden transition-all"
                style={
                  selectedBg === "transparent"
                    ? {
                        backgroundImage:
                          "linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        backgroundColor: "#1f2937",
                      }
                    : selectedBg === "white"
                    ? { backgroundColor: "#ffffff" }
                    : selectedBg === "black"
                    ? { backgroundColor: "#000000" }
                    : selectedBg === "gradient1"
                    ? { background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" }
                    : selectedBg === "gradient2"
                    ? { background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" }
                    : selectedBg === "gradient3"
                    ? { background: "linear-gradient(135deg, #102a16 0%, #050a08 100%)" }
                    : selectedBg === "custom"
                    ? { backgroundColor: customColor }
                    : undefined
                }
              >
                {isProcessing ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="h-10 w-10 border-3 border-[#3cff5f] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#3cff5f] font-semibold">{progressMsg}</p>
                  </div>
                ) : processedUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={processedUrl}
                    alt="Background Removed"
                    className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-center p-6 text-xs text-[#9baaa1]">
                    Click &quot;Upload Image&quot; or &quot;Try Sample&quot; to remove background
                  </div>
                )}
              </div>
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
            <Wand2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag & Drop or Click to Upload Image
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Supports PNG, JPG, JPEG, and WebP up to 25MB. Processed 100% locally in your browser with zero data upload.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> AI Subject Detection
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% Free & Unlimited
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> High-Res PNG Download
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
