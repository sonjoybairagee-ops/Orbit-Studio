"use client";

import { useState, useRef, useEffect } from "react";
import Dropzone from "./Dropzone";
import { cropImage, getImageDimensions, formatBytes, ConvertResult, CropCoordinates } from "@/lib/image-utils";
import { Download, RefreshCw, CheckCircle2, Crop, Sliders, Ratio } from "lucide-react";

export default function ImageCropperTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Normalized crop percentage or coordinates
  const [crop, setCrop] = useState<CropCoordinates>({ x: 0, y: 0, width: 0, height: 0 });
  const [activeRatio, setActiveRatio] = useState<string>("free");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConvertResult | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    try {
      const { width, height, objectUrl } = await getImageDimensions(file);
      setNaturalWidth(width);
      setNaturalHeight(height);
      setImageUrl(objectUrl);

      // Default crop: center 80%
      const initW = Math.round(width * 0.8);
      const initH = Math.round(height * 0.8);
      const initX = Math.round((width - initW) / 2);
      const initY = Math.round((height - initH) / 2);

      const initialCrop: CropCoordinates = { x: initX, y: initY, width: initW, height: initH };
      setCrop(initialCrop);
      performCrop(file, initialCrop);
    } catch (e) {
      console.error(e);
    }
  };

  const performCrop = async (file: File, coords: CropCoordinates) => {
    if (coords.width <= 0 || coords.height <= 0) return;
    try {
      setIsProcessing(true);
      const res = await cropImage(file, coords);
      setResult(res);
    } catch (err) {
      console.error("Crop error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyRatio = (ratioType: string) => {
    setActiveRatio(ratioType);
    if (!naturalWidth || !naturalHeight || !selectedFile) return;

    let targetRatio = 1;
    if (ratioType === "1:1") targetRatio = 1;
    else if (ratioType === "16:9") targetRatio = 16 / 9;
    else if (ratioType === "4:3") targetRatio = 4 / 3;
    else if (ratioType === "9:16") targetRatio = 9 / 16;
    else if (ratioType === "3:2") targetRatio = 3 / 2;
    else return; // freeform

    let w = naturalWidth * 0.8;
    let h = w / targetRatio;

    if (h > naturalHeight) {
      h = naturalHeight * 0.8;
      w = h * targetRatio;
    }

    w = Math.round(w);
    h = Math.round(h);
    const x = Math.round((naturalWidth - w) / 2);
    const y = Math.round((naturalHeight - h) / 2);

    const newCrop = { x, y, width: w, height: h };
    setCrop(newCrop);
    performCrop(selectedFile, newCrop);
  };

  const handleSliderX = (x: number) => {
    const maxX = naturalWidth - crop.width;
    const clampedX = Math.max(0, Math.min(maxX, x));
    const newCrop = { ...crop, x: clampedX };
    setCrop(newCrop);
    if (selectedFile) performCrop(selectedFile, newCrop);
  };

  const handleSliderY = (y: number) => {
    const maxY = naturalHeight - crop.height;
    const clampedY = Math.max(0, Math.min(maxY, y));
    const newCrop = { ...crop, y: clampedY };
    setCrop(newCrop);
    if (selectedFile) performCrop(selectedFile, newCrop);
  };

  const handleSliderWidth = (w: number) => {
    const clampedW = Math.max(20, Math.min(naturalWidth - crop.x, w));
    let newH = crop.height;
    if (activeRatio === "1:1") newH = clampedW;
    else if (activeRatio === "16:9") newH = Math.round(clampedW / (16 / 9));
    else if (activeRatio === "4:3") newH = Math.round(clampedW / (4 / 3));

    if (crop.y + newH > naturalHeight) {
      newH = naturalHeight - crop.y;
    }

    const newCrop = { ...crop, width: clampedW, height: newH };
    setCrop(newCrop);
    if (selectedFile) performCrop(selectedFile, newCrop);
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
    setImageUrl(null);
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
              {/* Presets */}
              <div>
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <Ratio className="h-4 w-4 text-purple-600" />
                  <span>Crop Aspect Ratio Presets</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "free", label: "Freeform" },
                    { id: "1:1", label: "1:1 Square" },
                    { id: "16:9", label: "16:9 Cinema" },
                    { id: "4:3", label: "4:3 Standard" },
                    { id: "9:16", label: "9:16 Story" },
                    { id: "3:2", label: "3:2 Classic" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => applyRatio(r.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        activeRatio === r.id
                          ? "border-purple-500 bg-purple-50 text-purple-800 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Crop Dimensions Slider */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Crop Width:</span>
                      <span className="font-semibold text-slate-800">{crop.width} px</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max={naturalWidth}
                      value={crop.width}
                      onChange={(e) => handleSliderWidth(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Offset Position Sliders */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <span>Adjust Position Offsets</span>
                </label>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Horizontal Offset (X):</span>
                    <span className="font-semibold text-slate-800">{crop.x} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, naturalWidth - crop.width)}
                    value={crop.x}
                    onChange={(e) => handleSliderX(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Vertical Offset (Y):</span>
                    <span className="font-semibold text-slate-800">{crop.y} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, naturalHeight - crop.height)}
                    value={crop.y}
                    onChange={(e) => handleSliderY(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Cropped Box:</span>
                <span className="rounded-xl bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800">
                  {crop.width} × {crop.height} px
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Cropped Image</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>Cropped Result Preview</span>
              </h4>
              <span className="text-xs text-slate-400">
                {result ? `${result.width} × ${result.height} px (${formatBytes(result.size)})` : ""}
              </span>
            </div>

            <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-slate-100/80 p-4 border border-slate-200/60 overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="text-xs font-medium">Cropping image...</span>
                </div>
              ) : result?.url ? (
                <img
                  src={result.url}
                  alt="Cropped Preview"
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
