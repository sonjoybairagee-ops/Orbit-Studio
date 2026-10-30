"use client";

import { useState, useEffect } from "react";
import Dropzone from "./Dropzone";
import { compressImage, formatBytes, CompressResult } from "@/lib/image-utils";
import { Download, RefreshCw, CheckCircle2, Sliders, ArrowDownRight, Eye } from "lucide-react";

export default function ImageCompressorTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressResult | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    processCompression(file, quality);
  };

  const processCompression = async (file: File, q: number) => {
    try {
      setIsProcessing(true);
      const res = await compressImage(file, q);
      setResult(res);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (selectedFile) {
      processCompression(selectedFile, newQ);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const a = document.createElement("a");
    a.href = result.url;
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}-compressed.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <Dropzone onFileSelect={handleFile} allowedFormatsText="JPG, PNG, or WebP (up to 30 MB)" />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Sliders className="h-4 w-4 text-emerald-600" />
                    <span>Compression Quality: {quality}%</span>
                  </label>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {quality > 85 ? "Maximum Quality" : quality > 60 ? "Balanced (Recommended)" : "Maximum Compression"}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                  <span>Smaller Size (10%)</span>
                  <span>Balanced (75%)</span>
                  <span>Highest Quality (95%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>New Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!result || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>

            {/* Savings Banner */}
            {result && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 text-center">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Original Size</div>
                  <div className="text-base font-bold text-slate-700 mt-0.5">
                    {formatBytes(result.originalSize)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Compressed Size</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    {formatBytes(result.compressedSize)}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 p-3">
                  <div className="text-xs text-emerald-600 font-medium">Total Saved</div>
                  <div className="text-base font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>{result.savedPercentage}%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Resolution</div>
                  <div className="text-base font-bold text-slate-700 mt-0.5">
                    {result.width} × {result.height}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side by side Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Original File</span>
                <span>{selectedFile && formatBytes(selectedFile.size)}</span>
              </div>
              <div className="relative flex aspect-video items-center justify-center rounded-2xl bg-slate-100/80 overflow-hidden border border-slate-200/50">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Compressed Result</span>
                </span>
                <span>{result && formatBytes(result.compressedSize)}</span>
              </div>
              <div className="relative flex aspect-video items-center justify-center rounded-2xl bg-slate-100/80 overflow-hidden border border-slate-200/50">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                    <span className="text-xs">Compressing image...</span>
                  </div>
                ) : result?.url ? (
                  <img
                    src={result.url}
                    alt="Compressed result"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
