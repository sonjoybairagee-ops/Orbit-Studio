"use client";

import { useState } from "react";
import Dropzone from "./Dropzone";
import { convertImage, formatBytes, ConvertResult } from "@/lib/image-utils";
import { Download, RefreshCw, CheckCircle2, Sliders, Palette, ArrowRight } from "lucide-react";

export default function PngToJpgTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    processConversion(file, quality, bgColor);
  };

  const processConversion = async (file: File, q: number, bg: string) => {
    try {
      setIsProcessing(true);
      const res = await convertImage(file, "image/jpeg", q, bg);
      setResult(res);
    } catch (err) {
      console.error("Conversion error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityChange = (newQ: number) => {
    setQuality(newQ);
    if (selectedFile) processConversion(selectedFile, newQ, bgColor);
  };

  const handleBgChange = (newBg: string) => {
    setBgColor(newBg);
    if (selectedFile) processConversion(selectedFile, quality, newBg);
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
        <Dropzone 
          onFileSelect={handleFile} 
          accept="image/png" 
          allowedFormatsText="PNG images with or without transparency (up to 30 MB)" 
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quality control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Sliders className="h-4 w-4 text-amber-600" />
                    <span>JPG Output Quality: {quality}%</span>
                  </label>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Standard JPG
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Small (20%)</span>
                  <span>Recommended (90%)</span>
                  <span>Maximum (100%)</span>
                </div>
              </div>

              {/* Background Color Picker for transparent areas */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                  <Palette className="h-4 w-4 text-amber-600" />
                  <span>Transparency Fill Color:</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleBgChange("#ffffff")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      bgColor === "#ffffff" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-300 bg-white" />
                    <span>White (Default)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBgChange("#000000")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      bgColor === "#000000" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-black" />
                    <span>Black</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleBgChange(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent"
                    />
                    <span className="text-xs text-slate-400 font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & stats */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                  PNG: {formatBytes(selectedFile.size)}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                  JPG: {result ? formatBytes(result.size) : "..."}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/25 hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download JPG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>Converted JPG Preview</span>
              </h4>
              <span className="text-xs text-slate-400">Ready for universal sharing & printing</span>
            </div>

            <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-slate-100/80 p-4 border border-slate-200/60 overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
                  <span className="text-xs font-medium">Converting to JPG...</span>
                </div>
              ) : result?.url ? (
                <img
                  src={result.url}
                  alt="Converted JPG"
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
