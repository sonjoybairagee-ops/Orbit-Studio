"use client";

import { useState } from "react";
import Dropzone from "./Dropzone";
import { resizeImage, getImageDimensions, formatBytes, ConvertResult } from "@/lib/image-utils";
import { Download, RefreshCw, CheckCircle2, Lock, Unlock, Maximize, Sparkles } from "lucide-react";

export default function ImageResizerTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>("image/jpeg");
  const [quality, setQuality] = useState<number>(90);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    try {
      const { width, height } = await getImageDimensions(file);
      setOriginalWidth(width);
      setOriginalHeight(height);
      setTargetWidth(width);
      setTargetHeight(height);
      performResize(file, width, height, outputFormat, quality);
    } catch (e) {
      console.error(e);
    }
  };

  const performResize = async (file: File, w: number, h: number, format: string, q: number) => {
    if (w <= 0 || h <= 0) return;
    try {
      setIsProcessing(true);
      const res = await resizeImage(file, w, h, q, format);
      setResult(res);
    } catch (err) {
      console.error("Resize error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    let newH = targetHeight;
    if (lockAspect && originalWidth > 0) {
      newH = Math.round((w / originalWidth) * originalHeight);
      setTargetHeight(newH);
    }
    if (selectedFile) performResize(selectedFile, w, newH, outputFormat, quality);
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    let newW = targetWidth;
    if (lockAspect && originalHeight > 0) {
      newW = Math.round((h / originalHeight) * originalWidth);
      setTargetWidth(newW);
    }
    if (selectedFile) performResize(selectedFile, newW, h, outputFormat, quality);
  };

  const applyPercentage = (pct: number) => {
    if (!originalWidth || !originalHeight) return;
    const w = Math.round(originalWidth * (pct / 100));
    const h = Math.round(originalHeight * (pct / 100));
    setTargetWidth(w);
    setTargetHeight(h);
    if (selectedFile) performResize(selectedFile, w, h, outputFormat, quality);
  };

  const applyPreset = (w: number, h: number) => {
    setLockAspect(false);
    setTargetWidth(w);
    setTargetHeight(h);
    if (selectedFile) performResize(selectedFile, w, h, outputFormat, quality);
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <Dropzone onFileSelect={handleFile} allowedFormatsText="JPG, PNG, or WebP (up to 30 MB)" />
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Width & Height inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-indigo-600" />
                    <span>Target Dimensions (Pixels)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLockAspect(!lockAspect)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      lockAspect
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {lockAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    <span>{lockAspect ? "Aspect Ratio Locked" : "Aspect Free"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Width (px)</span>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Height (px)</span>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Percentage quick scale */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Scale:</span>
                  {[25, 50, 75, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPercentage(pct)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Presets */}
              <div>
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Popular Social Media Presets</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(1080, 1080)}
                    className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800">Instagram Square</span>
                    <span className="text-[11px] text-slate-500">1080 × 1080 px (1:1)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(1080, 1920)}
                    className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800">Stories & Reels</span>
                    <span className="text-[11px] text-slate-500">1080 × 1920 px (9:16)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(1280, 720)}
                    className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800">YouTube Thumbnail</span>
                    <span className="text-[11px] text-slate-500">1280 × 720 px (16:9)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(1200, 630)}
                    className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all"
                  >
                    <span className="text-xs font-bold text-slate-800">Facebook / OG Share</span>
                    <span className="text-[11px] text-slate-500">1200 × 630 px</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Output:</span>
                <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
                  {targetWidth} × {targetHeight} px ({result ? formatBytes(result.size) : "..."})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Choose Another</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!result || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Resized Image</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>Resized Preview</span>
              </h4>
              <span className="text-xs text-slate-400">
                Original: {originalWidth} × {originalHeight} px
              </span>
            </div>

            <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-slate-100/80 p-4 border border-slate-200/60 overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Resizing image...</span>
                </div>
              ) : result?.url ? (
                <img
                  src={result.url}
                  alt="Resized Image"
                  className="max-h-[480px] w-auto max-w-full rounded-lg object-contain shadow-sm"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
