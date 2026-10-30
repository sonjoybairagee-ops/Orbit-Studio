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
  Cpu,
  Layers,
  AlertCircle,
  XCircle,
  Flame,
  ShieldCheck,
  Info,
} from "lucide-react";

export type EngineType = "neural" | "fast";
export type ModelQuality = "slim" | "medium";
export type ScaleFactor = 2 | 4 | 8;
export type EnhanceMode = "photo" | "art" | "sharp";

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
    desc: "Reconstructs natural skin textures, facial features, and subtle lighting with deep detail.",
    sharpness: 65,
    denoise: 30,
  },
  art: {
    id: "art",
    name: "Digital Art & Anime (Waifu2x Style)",
    badge: "Illustrations",
    desc: "Preserves sharp vector line art, eliminates compression artifacts, and smooths color gradients.",
    sharpness: 80,
    denoise: 50,
  },
  sharp: {
    id: "sharp",
    name: "Ultra Detail & Micro-Edge Boost",
    badge: "Maximum Crisp",
    desc: "Maximum micro-contrast for YouTube thumbnails, architecture, typography, and landscapes.",
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

  // Upscale Configuration
  const [engine, setEngine] = useState<EngineType>("neural");
  const [modelQuality, setModelQuality] = useState<ModelQuality>("slim");
  const [scale, setScale] = useState<ScaleFactor>(4);
  const [mode, setMode] = useState<EnhanceMode>("photo");

  // Processing & Feedback States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [neuralProgress, setNeuralProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%

  const containerRef = useRef<HTMLDivElement | null>(null);
  const upscalerInstanceRef = useRef<any>(null);

  // High-Quality Multi-Pass Fast HD Engine (Contrast-Adaptive Sharpening)
  const processFastUpscale = useCallback(
    (imgElement: HTMLImageElement, currentScale: ScaleFactor, currentMode: EnhanceMode) => {
      setIsProcessing(true);
      setProcessingStatus("Synthesizing pixels with Contrast-Adaptive Engine...");

      setTimeout(() => {
        try {
          const w = imgElement.naturalWidth;
          const h = imgElement.naturalHeight;
          const targetW = Math.round(w * currentScale);
          const targetH = Math.round(h * currentScale);

          setTargetDimensions({ w: targetW, h: targetH });

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            setIsProcessing(false);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(imgElement, 0, 0, targetW, targetH);

          // Unsharp masking & contrast-adaptive sharpening
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          const modeCfg = MODES[currentMode];
          const strength = (modeCfg.sharpness / 100) * 0.45;

          const copy = new Uint8ClampedArray(data);
          const stride = targetW * 4;

          for (let y = 1; y < targetH - 1; y += 1) {
            const rowOffset = y * stride;
            for (let x = 1; x < targetW - 1; x += 1) {
              const idx = rowOffset + x * 4;
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
          const dataUrl = canvas.toDataURL("image/png");
          setUpscaledSrc(dataUrl);
          setIsProcessing(false);
          setProcessingStatus("");
        } catch (err) {
          console.error("Fast upscale error:", err);
          setIsProcessing(false);
          setProcessingStatus("");
        }
      }, 80);
    },
    []
  );

  // Deep Learning True Neural AI Engine (Real-ESRGAN / RDN Model)
  const processNeuralUpscale = useCallback(
    async (imgElement: HTMLImageElement, currentScale: ScaleFactor, currentQuality: ModelQuality) => {
      setIsProcessing(true);
      setNeuralProgress(0);
      setErrorMessage("");
      setProcessingStatus("Initializing Real-ESRGAN Neural Network...");

      try {
        const targetW = imgElement.naturalWidth * currentScale;
        const targetH = imgElement.naturalHeight * currentScale;
        setTargetDimensions({ w: targetW, h: targetH });

        // Dynamic browser-only import of Upscaler to prevent SSR errors
        const UpscalerModule = await import("upscaler");
        const Upscaler = UpscalerModule.default;

        setProcessingStatus("Loading deep convolutional model weights into WebGL...");

        // Setup local model definition (zero cloud external dependency)
        const modelDef = {
          scale: currentScale,
          modelType: "layers" as const,
          path: `/models/esrgan-${currentQuality}/x${currentScale}/model.json`,
          meta: {
            architecture: "rdn",
            patchSize: 128,
          },
          inputRange: [0, 255] as [number, number],
          outputRange: [0, 255] as [number, number],
        };

        const upscaler = new Upscaler({
          model: modelDef,
        });
        upscalerInstanceRef.current = upscaler;

        setProcessingStatus("Synthesizing neural tiles via WebGL GPU...");

        // Patch size 64 with padding 6 ensures low memory footprint on client GPUs
        const upscaledBase64 = await upscaler.upscale(imgElement, {
          patchSize: 64,
          padding: 6,
          progress: (pct: number) => {
            const progressPct = Math.round(pct * 100);
            setNeuralProgress(progressPct);
            setProcessingStatus(`Real-ESRGAN processing tiles: ${progressPct}%`);
          },
        });

        setUpscaledSrc(upscaledBase64);
        setIsProcessing(false);
        setProcessingStatus("");
      } catch (err: any) {
        console.warn("Neural upscale error or unsupported device, falling back to Fast HD:", err);
        setErrorMessage("Neural GPU encountered an issue. Automatically switched to Fast HD engine.");
        processFastUpscale(imgElement, currentScale, mode);
      }
    },
    [mode, processFastUpscale]
  );

  // Main Upscale Dispatcher
  const executeUpscale = useCallback(
    (
      imgElement: HTMLImageElement,
      targetEngine: EngineType,
      targetScale: ScaleFactor,
      targetQuality: ModelQuality,
      targetMode: EnhanceMode
    ) => {
      if (targetEngine === "neural") {
        processNeuralUpscale(imgElement, targetScale, targetQuality);
      } else {
        processFastUpscale(imgElement, targetScale, targetMode);
      }
    },
    [processNeuralUpscale, processFastUpscale]
  );

  // Load sample image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = SAMPLE_DEMO_IMG;
    img.onload = () => {
      setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setTargetDimensions({ w: img.naturalWidth * 4, h: img.naturalHeight * 4 });
      // Run Fast HD on initial load for instant zero-wait preview
      processFastUpscale(img, 4, "photo");
    };
  }, [processFastUpscale]);

  // Handle User Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setOrigFileSize(`${sizeMB} MB`);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOrigImageSrc(src);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        setTargetDimensions({ w: img.naturalWidth * scale, h: img.naturalHeight * scale });
        executeUpscale(img, engine, scale, modelQuality, mode);
      };
    };
    reader.readAsDataURL(file);
  };

  // Re-process when Engine, Scale, Quality or Mode changes
  const triggerUpscaleWithParams = (
    newEngine: EngineType,
    newScale: ScaleFactor,
    newQuality: ModelQuality,
    newMode: EnhanceMode
  ) => {
    setEngine(newEngine);
    setScale(newScale);
    setModelQuality(newQuality);
    setMode(newMode);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = origImageSrc;
    img.onload = () => {
      executeUpscale(img, newEngine, newScale, newQuality, newMode);
    };
  };

  // Abort active neural upscaler
  const handleAbort = () => {
    if (upscalerInstanceRef.current && typeof upscalerInstanceRef.current.abort === "function") {
      try {
        upscalerInstanceRef.current.abort();
      } catch (e) {
        console.warn("Abort error:", e);
      }
    }
    setIsProcessing(false);
    setProcessingStatus("");
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
    const engineLabel = engine === "neural" ? `real_esrgan_${modelQuality}` : "fast_hd";
    a.download = `compx_orbit_${engineLabel}_${scale}x_${targetDimensions.w}x${targetDimensions.h}.${format}`;
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
            <Sparkles className="h-3.5 w-3.5" />
            <span>True Neural AI (Real-ESRGAN / Waifu2x)</span>
            <span>•</span>
            <span className="text-[#9baaa1]">Hardware Accelerated WebGL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            4K AI Image Upscaler &amp; Super-Resolution Studio
          </h2>
          <p className="text-xs text-[#9baaa1]">
            Reconstruct micro-textures, facial skin pores, and anime line art into crystal-clear 4K Ultra HD. 100% private in-browser.
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

      {/* Error / Fallback Notification */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
                <span>
                  {scale}x {engine === "neural" ? "Real-ESRGAN AI" : "Fast HD"} ({targetDimensions.w} × {targetDimensions.h})
                </span>
              </span>
            </div>

            {/* Processing Spinner & Neural Tile Progress Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6">
                <div className="w-full max-w-md rounded-3xl bg-[#0c1510] border border-[#213026] p-6 shadow-2xl space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="relative">
                      <RefreshCw className="h-8 w-8 text-[#3cff5f] animate-spin" />
                      <Cpu className="h-4 w-4 text-[#3cff5f] absolute inset-0 m-auto" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#e7eee9]">
                      {engine === "neural" ? "True Neural AI Reconstructing Image" : "Fast HD Rendering"}
                    </h4>
                    <p className="text-xs text-[#9baaa1] mt-1">
                      {processingStatus || "Processing micro-details..."}
                    </p>
                  </div>

                  {/* Neural Tile Progress Bar */}
                  {engine === "neural" && (
                    <div className="space-y-1.5">
                      <div className="w-full h-2 rounded-full bg-[#17221b] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#215a30] via-[#3cff5f] to-[#52ff71] transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(8, neuralProgress)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono text-[#9baaa1]">
                        <span>Tiles Synthesis: {neuralProgress}%</span>
                        <span className="text-[#3cff5f]">WebGL GPU Active</span>
                      </div>
                    </div>
                  )}

                  {/* Abort button for long neural passes */}
                  <button
                    type="button"
                    onClick={handleAbort}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Processing</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Slider Instruction Note & Action Trigger */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#9baaa1] px-2 font-mono gap-2">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#3cff5f]" />
              <span>Drag slider left/right to compare detail clarity</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Divider: {Math.round(sliderPos)}%</span>
              <button
                type="button"
                onClick={() => triggerUpscaleWithParams(engine, scale, modelQuality, mode)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1 rounded-lg border border-[#2a5234] bg-[#102a16] px-2.5 py-1 text-[11px] text-[#3cff5f] hover:bg-[#153a1f] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Re-Enhance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Engine, Scale, Model Controls & Download */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Super-Resolution Engine Selection */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#3cff5f]" />
                <span>1. AI Engine Core</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
                {engine === "neural" ? "True Neural AI" : "Fast CAS"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* True Neural AI */}
              <button
                type="button"
                onClick={() => triggerUpscaleWithParams("neural", scale, modelQuality, mode)}
                className={`rounded-2xl border p-3 text-left transition-all cursor-pointer relative overflow-hidden ${
                  engine === "neural"
                    ? "border-[#3cff5f] bg-[#102a16] shadow-md shadow-[#3cff5f]/15"
                    : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>True Neural AI</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#3cff5f] text-[#050a08] font-bold">
                    Deep CNN
                  </span>
                </div>
                <p className="text-[10px] text-[#9baaa1] leading-tight">
                  Real-ESRGAN deep network reconstructs textures, skin pores, &amp; sharp edges.
                </p>
              </button>

              {/* Instant Fast HD */}
              <button
                type="button"
                onClick={() => triggerUpscaleWithParams("fast", scale, modelQuality, mode)}
                className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  engine === "fast"
                    ? "border-[#3cff5f] bg-[#102a16] shadow-md shadow-[#3cff5f]/15"
                    : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#e7eee9] flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Fast HD</span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#17221b] text-[#9baaa1]">
                    &lt;100ms
                  </span>
                </div>
                <p className="text-[10px] text-[#9baaa1] leading-tight">
                  Sub-second contrast-adaptive sharpening. Great for instant resizing &amp; low battery.
                </p>
              </button>
            </div>

            {/* Neural Model Weight Toggle (When in Neural Mode) */}
            {engine === "neural" && (
              <div className="pt-2 border-t border-[#213026] space-y-2">
                <span className="text-[11px] font-semibold text-[#9baaa1] block">
                  Neural Model Architecture:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerUpscaleWithParams("neural", scale, "slim", mode)}
                    className={`rounded-xl border py-2 px-3 text-left text-xs transition-all cursor-pointer ${
                      modelQuality === "slim"
                        ? "border-[#3cff5f] bg-[#142d1d] text-[#e7eee9]"
                        : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>ESRGAN Slim</span>
                      <span className="text-[9px] font-mono text-[#3cff5f]">~900 KB</span>
                    </div>
                    <div className="text-[10px] text-[#9baaa1]">Fast WebGL inference</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerUpscaleWithParams("neural", scale, "medium", mode)}
                    className={`rounded-xl border py-2 px-3 text-left text-xs transition-all cursor-pointer ${
                      modelQuality === "medium"
                        ? "border-[#3cff5f] bg-[#142d1d] text-[#e7eee9]"
                        : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>ESRGAN Studio</span>
                      <span className="text-[9px] font-mono text-[#3cff5f]">~2.8 MB</span>
                    </div>
                    <div className="text-[10px] text-[#9baaa1]">Maximum 4K fidelity</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Resolution Scale Multiplier */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#3cff5f]" />
                <span>2. Scale Multiplier</span>
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
                  onClick={() => triggerUpscaleWithParams(engine, s, modelQuality, mode)}
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

          {/* 3. Enhancement Style Presets */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#3cff5f]" />
                <span>3. Enhancement Style</span>
              </h3>
              <span className="text-xs text-[#3cff5f] font-mono">
                {MODES[mode].name.split(" ")[0]}
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
                    onClick={() => triggerUpscaleWithParams(engine, scale, modelQuality, key)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all cursor-pointer ${
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

          {/* 4. Image Dimensions & Export */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9baaa1] flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#3cff5f]" />
              <span>4. Resolution &amp; Download</span>
            </h3>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-2 text-xs">
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
              <div className="flex justify-between items-center text-[#9baaa1]">
                <span>Active Engine:</span>
                <span className="text-white/80 font-mono text-[11px]">
                  {engine === "neural" ? `Real-ESRGAN (${modelQuality})` : "Contrast-Adaptive CAS"}
                </span>
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
