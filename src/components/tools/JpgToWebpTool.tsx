"use client";

import { useState } from "react";
import Dropzone from "./Dropzone";
import { convertImage, formatBytes, ConvertResult } from "@/lib/image-utils";
import { Download, RefreshCw, CheckCircle2, Sliders, ArrowRight, Zap } from "lucide-react";

export default function JpgToWebpTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    processConversion(file, quality);
  };

  const processConversion = async (file: File, q: number) => {
    try {
      setIsProcessing(true);
      const res = await convertImage(file, "image/webp", q);
      setResult(res);
    } catch (err) {
      console.error("Conversion error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (selectedFile) {
      processConversion(selectedFile, newQ);
    }
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

  const savedSize = selectedFile && result ? selectedFile.size - result.size : 0;
  const savedPercent = selectedFile && result && selectedFile.size > 0 
    ? Math.max(0, Math.round(((selectedFile.size - result.size) / selectedFile.size) * 100))
    : 0;

  return (
    <div className="w-full">
      {!selectedFile ? (
        <Dropzone 
          onFileSelect={handleFile} 
          accept="image/jpeg, image/jpg" 
          allowedFormatsText="JPG or JPEG images (up to 30 MB)" 
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Sliders className="h-4 w-4 text-sky-600" />
                    <span>WebP Quality: {quality}%</span>
                  </label>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    High Efficiency WebP
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>Fast Loading (20%)</span>
                  <span>Balanced Web (85%)</span>
                  <span>Lossless-like (100%)</span>
                </div>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download WebP</span>
                </button>
              </div>
            </div>

            {result && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    JPG: {formatBytes(selectedFile.size)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-800">
                    WebP: {formatBytes(result.size)}
                  </span>
                </div>

                {savedPercent > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/50">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{savedPercent}% smaller file size!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-600" />
                <span>WebP Output Preview ({result?.width} × {result?.height}px)</span>
              </h4>
              <span className="text-xs text-slate-400">Next-Gen Web Image Format</span>
            </div>

            <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-slate-100/80 p-4 border border-slate-200/60 overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-sky-600" />
                  <span className="text-xs font-medium">Encoding to WebP...</span>
                </div>
              ) : result?.url ? (
                <img
                  src={result.url}
                  alt="Converted WebP"
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
