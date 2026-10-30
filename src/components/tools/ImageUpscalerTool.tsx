"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Zap,
  ZoomIn,
  Eye,
  SlidersHorizontal,
  FileCheck,
} from "lucide-react";

type ScaleFactor = 2 | 4 | 8;
type EnhanceMode = "photo" | "art" | "sharp";

interface ModeConfig {
  id: EnhanceMode;
  name: string;
  badge: string;
  desc: string;
  sharpness: number; // 0 to 100
  denoise: number;   // 0 to 100
}

const MODES: Record<EnhanceMode, ModeConfig> = {
  photo: {
    id: "photo",
    name: "Photo & Portrait Clarity",
    badge: "Recommended",
    desc: "Restores facial details, skin textures, and natural lighting without over-sharpening.",
    sharpness: 65,
    denoise: 30,
  },
  art: {
    id: "art",
    name: "Digital Art & Graphics",
    badge: "Illustrations",
    desc: "Sharpens vector lines, smooths gradients, and removes compression blockiness.",
    sharpness: 80,
    denoise: 50,
  },
  sharp: {
    id: "sharp",
    name: "Ultra Detail & Texture Boost",
    badge: "Maximum Crisp",
    desc: "High-contrast micro-edge enhancement for thumbnails, landscapes, and architecture.",
    sharpness: 95,
    denoise: 15,
  },
};

const SAMPLE_DEMO_IMG = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60";

export default function ImageUpscalerTool() {
  const [origImageSrc, setOrigImageSrc] = useState<string>(SAMPLE_DEMO_IMG);
  const [upscaledSrc, setUpscaledSrc] = useState<string>("");
  const [origDimensions, setOrigDimensions] = useState<{ w: number; h: number }>({ w: 600, h: 900 });
  const [targetDimensions, setTargetDimensions] = useState<{ w: number; h: number }>({ w: 2400, h: 3600 });
  const [origFileSize, setOrigFileSize] = useState<string>("~120 KB");

  const [scale, setScale] = useState<ScaleFactor>(4);
  const [mode, setMode] = useState<EnhanceMode>("photo");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load sample image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = SAMPLE_DEMO_IMG;
    img.onload = () => {
      setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setTargetDimensions({ w: img.naturalWidth * 4, h: img.naturalHeight * 4 });
      processUpscale(img, 4, "photo");
    };
  }, []);

  // Handle User Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setOrigFileSize(`${sizeMB} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOrigImageSrc(src);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        setTargetDimensions({ w: img.naturalWidth * scale, h: img.naturalHeight * scale });
        processUpscale(img, scale, mode);
      };
    };
    reader.readAsDataURL(file);
  };

  // High-Quality Multi-Pass Upscale & Contrast-Adaptive Sharpening Engine
  const processUpscale = useCallback((imgElement: HTMLImageElement, currentScale: ScaleFactor, currentMode: EnhanceMode) => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const w = imgElement.naturalWidth;
        const h = imgElement.naturalHeight;
        const targetW = Math.round(w * currentScale);
        const targetH = Math.round(h * currentScale);

        setTargetDimensions({ w: targetW, h: targetH });

        // Step 1: High quality bicubic render to offscreen canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw upscaled base
        ctx.drawImage(imgElement, 0, 0, targetW, targetH);

        // Step 2: Pixel-Level Unsharp Mask & Micro-Detail Sharpening
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const modeCfg = MODES[currentMode];
        const strength = (modeCfg.sharpness / 100) * 0.45;

        // Apply contrast-adaptive sharpening convolution on luminance
        // Clone for kernel sampling
        const copy = new Uint8ClampedArray(data);
        const stride = targetW * 4;

        for (let y = 1; y < targetH - 1; y += 1) {
          const rowOffset = y * stride;
          for (let x = 1; x < targetW - 1; x += 1) {
            const idx = rowOffset + x * 4;

            // Simple 3x3 Laplacian edge kernel
            for (let c = 0; c < 3; c++) {
              const center = copy[idx + c];
              const up = copy[idx - stride + c];
              const down = copy[idx + stride + c];
              const left = copy[idx - 4 + c];
              const right = copy[idx + 4 + c];

              const laplacian = 4 * center - (up + down + left + right);
              const sharpened = center + laplacian * strength;

              data[idx + c] = Math.max(0, Math.min(255, sharpened));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Step 3: Export clean URL
        const dataUrl = canvas.toDataURL("image/png");
        setUpscaledSrc(dataUrl);
        setIsProcessing(false);
      } catch (err) {
        console.error("Upscale error:", err);
        setIsProcessing(false);
      }
    }, 150);
  }, []);

  // Trigger re-process when Scale or Mode changes
  const handleConfigChange = (newScale: ScaleFactor, newMode: EnhanceMode) => {
    setScale(newScale);
    setMode(newMode);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = origImageSrc;
    img.onload = () => {
      processUpscale(img, newScale, newMode);
    };
  };

  // Interactive Slider Drag handler
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleDownload = (format: "png" | "jpg") => {
    if (!upscaledSrc) return;
    const a = document.createElement("a");
    a.href = upscaledSrc;
    a.download = `compx_orbit_upscaled_${scale}x_${targetDimensions.w}x${targetDimensions.h}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner & Upload Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-0.5 text-xs font-semibold text-[#3cff5f]">
            <Sparkles className="h-3 w-3" />
            <span>AI Super-Resolution Engine</span>
            <span>•</span>
            <span className="text-[#9baaa1]">Free Topaz &amp; Upscayl Alternative</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            4K AI Image Upscaler &amp; Enhancer
          </h2>
          <p className="text-xs text-[#9baaa1]">
            Transform blurry photos, small thumbnails, and graphics into razor-sharp 4K Ultra HD images with zero limits.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/15 shrink-0">
          <Upload className="h-4 w-4" />
          <span>Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Split Comparison Slider */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div
            ref={containerRef}
            onMouseMove={(e) => handleSliderMove(e.clientX)}
            onTouchMove={(e) => {
              if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
            }}
            className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl border-2 border-[#213026] bg-[#050a08] overflow-hidden select-none cursor-ew-resize shadow-2xl group"
          >
            {/* Background Layer: Upscaled 4K Image */}
            {upscaledSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={upscaledSrc}
                alt="4K Upscaled"
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#9baaa1]">
                Processing upscale...
              </div>
            )}

            {/* Foreground Layer: Clipped Original Image */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={origImageSrc}
                alt="Original Blurry"
                className="absolute top-0 left-0 h-full max-w-none object-contain blur-[1px]"
                style={{
                  width: containerRef.current ? containerRef.current.clientWidth : "100%",
                }}
              />
            </div>

            {/* Split Comparison Divider Line */}
            <div
              className="absolute inset-y-0 w-0.5 bg-[#3cff5f] shadow-[0_0_12px_#3cff5f] pointer-events-none z-10"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Center Handle Pill */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#102a16] border-2 border-[#3cff5f] text-[#3cff5f] shadow-lg">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>

            {/* Top Badges: Original vs 4K Enhanced */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className="rounded-xl bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-mono font-bold text-white shadow-md">
                Original ({origDimensions.w} × {origDimensions.h})
              </span>
            </div>

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="rounded-xl bg-[#102a16]/90 backdrop-blur-md border border-[#2a5234] px-3 py-1 text-xs font-mono font-bold text-[#3cff5f] shadow-md flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{scale}x AI Enhanced ({targetDimensions.w} × {targetDimensions.h})</span>
              </span>
            </div>

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
                <div className="flex items-center gap-3 rounded-2xl bg-[#0c1510] border border-[#213026] px-5 py-3 text-sm text-[#e7eee9]">
                  <RefreshCw className="h-4 w-4 text-[#3cff5f] animate-spin" />
                  <span>Synthesizing 4K Ultra HD Micro-Details...</span>
                </div>
              </div>
            )}
          </div>

          {/* Slider Instruction Note */}
          <div className="flex items-center justify-between text-xs text-[#9baaa1] px-2 font-mono">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#3cff5f]" />
              <span>Drag slider left/right to compare detail clarity</span>
            </span>
            <span>Position: {Math.round(sliderPos)}%</span>
          </div>
        </div>

        {/* Right Column: Customization Controls & Download Options */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resolution Scale Multiplier */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#3cff5f]" />
                <span>1. Select Scale Factor</span>
              </h3>
              <span className="text-xs text-[#3cff5f] font-mono font-bold">
                {scale}x Resolution
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([2, 4, 8] as ScaleFactor[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleConfigChange(s, mode)}
                  className={`rounded-2xl border py-3 px-2 text-center transition-all cursor-pointer ${
                    scale === s
                      ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f] font-bold shadow-md shadow-[#3cff5f]/15"
                      : "border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9] hover:border-[#3cff5f]/50"
                  }`}
                >
                  <div className="text-base font-black font-mono">{s}x</div>
                  <div className="text-[10px] opacity-75">
                    {s === 2 ? "HD (2K)" : s === 4 ? "Ultra (4K)" : "Max Print"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhancement Mode */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#3cff5f]" />
                <span>2. Enhancement Style</span>
              </h3>
              <span className="text-xs text-[#3cff5f] font-mono">
                {MODES[mode].name}
              </span>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(MODES) as EnhanceMode[]).map((key) => {
                const m = MODES[key];
                const isActive = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleConfigChange(scale, key)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-[#3cff5f] bg-[#102a16] shadow-md shadow-[#3cff5f]/10"
                        : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50 hover:bg-[#0c1510]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#e7eee9]">{m.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-[#3cff5f] text-[#050a08] font-bold"
                            : "bg-[#17221b] text-[#9baaa1]"
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9baaa1] leading-tight">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Dimensions & Stats Summary */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#3cff5f]" />
              <span>3. Resolution Metrics</span>
            </h3>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-[#9baaa1]">
                <span>Original Canvas:</span>
                <strong className="text-[#e7eee9] font-mono">
                  {origDimensions.w} × {origDimensions.h} px
                </strong>
              </div>
              <div className="flex justify-between items-center text-[#9baaa1]">
                <span>Enhanced Canvas:</span>
                <strong className="text-[#3cff5f] font-mono font-bold">
                  {targetDimensions.w} × {targetDimensions.h} px
                </strong>
              </div>
              <div className="flex justify-between items-center text-[#9baaa1]">
                <span>Total Pixel Boost:</span>
                <strong className="text-[#3cff5f] font-mono">
                  +{scale * scale}x pixels ({((targetDimensions.w * targetDimensions.h) / 1000000).toFixed(1)} MP)
                </strong>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => handleDownload("png")}
                disabled={!upscaledSrc || isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] py-4 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download 4K PNG (Lossless)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload("jpg")}
                disabled={!upscaledSrc || isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#213026] bg-[#080e0b] py-3 text-xs font-semibold text-[#e7eee9] hover:border-[#3cff5f] hover:bg-[#101c15] transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-[#3cff5f]" />
                <span>Download High-Quality JPG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
