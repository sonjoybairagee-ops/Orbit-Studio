"use client";

import { useState, useRef, useEffect } from "react";
import { PaintBucket, Upload, Download, RefreshCw, Sliders, CheckCircle2 } from "lucide-react";

export default function BackgroundColorChangerTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [mode, setMode] = useState<"replace" | "underlay">("replace");
  const [targetColor, setTargetColor] = useState<string>("#ffffff"); // color to replace
  const [newColor, setNewColor] = useState<string>("#3b82f6"); // color to paint
  const [tolerance, setTolerance] = useState<number>(30); // color diff tolerance
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImageUrl(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      // Auto-detect top-left pixel color as target color
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tCtx = tempCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(img, 0, 0);
        const p = tCtx.getImageData(0, 0, 1, 1).data;
        const hex =
          "#" +
          [p[0], p[1], p[2]]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("");
        setTargetColor(hex);
      }
      renderCanvas();
    };
    img.src = url;
  };

  const hexToRgb = (hex: string) => {
    const c = parseInt(hex.replace("#", ""), 16);
    return {
      r: (c >> 16) & 0xff,
      g: (c >> 8) & 0xff,
      b: (c >> 0) & 0xff,
    };
  };

  const renderCanvas = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (mode === "underlay") {
      // Underlay mode (fills canvas background and draws transparent image over)
      if (newColor === "transparent") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = newColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
    } else {
      // Color key replacement mode
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const targetRgb = hexToRgb(targetColor);
      const isNewTransparent = newColor === "transparent";
      const newRgb = isNewTransparent ? { r: 0, g: 0, b: 0 } : hexToRgb(newColor);

      const tolSq = tolerance * tolerance * 3;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) {
          // If transparent pixel and newColor is not transparent, fill it
          if (!isNewTransparent) {
            data[i] = newRgb.r;
            data[i + 1] = newRgb.g;
            data[i + 2] = newRgb.b;
            data[i + 3] = 255;
          }
          continue;
        }

        const dr = r - targetRgb.r;
        const dg = g - targetRgb.g;
        const db = b - targetRgb.b;
        const distSq = dr * dr + dg * dg + db * db;

        if (distSq <= tolSq) {
          if (isNewTransparent) {
            data[i + 3] = 0; // make transparent
          } else {
            data[i] = newRgb.r;
            data[i + 1] = newRgb.g;
            data[i + 2] = newRgb.b;
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }
  };

  useEffect(() => {
    if (imgRef.current) renderCanvas();
  }, [mode, targetColor, newColor, tolerance]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${imageFile?.name?.replace(/\.[^.]+$/, "") || "image"}_bg_changed.png`;
    a.click();
  };

  // Sample color by clicking on the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext("2d");
    if (!tCtx) return;
    tCtx.drawImage(imgRef.current, 0, 0);
    const p = tCtx.getImageData(x, y, 1, 1).data;
    const hex =
      "#" +
      [p[0], p[1], p[2]]
        .map((val) => val.toString(16).padStart(2, "0"))
        .join("");
    setTargetColor(hex);
  };

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      {!imageFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-fuchsia-200 hover:border-fuchsia-400 bg-fuchsia-50/30 hover:bg-fuchsia-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 group-hover:scale-110 transition-transform">
            <PaintBucket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Choose an image to change background color</h3>
            <p className="text-sm text-slate-500 mt-1">Supports PNG, JPG, and WebP (100% in-browser processing)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Controls & Canvas Display */}
      {imageFile && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
                  <PaintBucket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">{imageFile.name}</h4>
                  <p className="text-xs text-slate-400">Click any pixel on the preview to sample the target background color</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-slate-600 hover:text-fuchsia-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-fuchsia-200 transition-colors"
                >
                  Change Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Config Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl">
              {/* Mode */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Replacement Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-fuchsia-500"
                >
                  <option value="replace">Color Replacement (Magic Key)</option>
                  <option value="underlay">Underlay Fill (For transparent PNGs)</option>
                </select>
              </div>

              {/* Target Color */}
              {mode === "replace" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Color to Replace</label>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700">{targetColor}</span>
                  </div>
                </div>
              )}

              {/* New Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">New Background Color</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 flex-1">
                    <input
                      type="color"
                      value={newColor === "transparent" ? "#ffffff" : newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {newColor === "transparent" ? "Transparent" : newColor}
                    </span>
                  </div>
                  <button
                    onClick={() => setNewColor("transparent")}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      newColor === "transparent"
                        ? "bg-fuchsia-600 text-white border-fuchsia-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-fuchsia-300"
                    }`}
                  >
                    Clear (Alpha)
                  </button>
                </div>
              </div>

              {/* Tolerance */}
              {mode === "replace" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Match Tolerance: {tolerance}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-fuchsia-600"
                  />
                </div>
              )}
            </div>

            {/* Swatches presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Quick Palettes:</span>
              {[
                { label: "White", hex: "#ffffff" },
                { label: "Black", hex: "#000000" },
                { label: "Soft Gray", hex: "#f1f5f9" },
                { label: "Sky Blue", hex: "#38bdf8" },
                { label: "Emerald", hex: "#10b981" },
                { label: "Rose", hex: "#f43f5e" },
                { label: "Amber", hex: "#f59e0b" },
              ].map((sw) => (
                <button
                  key={sw.hex}
                  type="button"
                  onClick={() => setNewColor(sw.hex)}
                  style={{ backgroundColor: sw.hex }}
                  className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                  title={sw.label}
                />
              ))}
            </div>

            {/* Canvas Preview Area */}
            <div className="relative rounded-2xl overflow-hidden bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] border border-slate-200 flex justify-center p-4 max-h-[460px] overflow-auto">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-h-[420px] max-w-full object-contain cursor-crosshair rounded-lg shadow-sm"
                title="Click anywhere to sample that color as target"
              />
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400 font-medium">Click on canvas to sample target background color</span>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download Modified PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
