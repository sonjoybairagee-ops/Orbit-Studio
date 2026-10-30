"use client";

import { useState, useRef } from "react";
import { Pipette, Upload, Copy, Check } from "lucide-react";

export default function ImageColorPickerTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedHex, setSelectedHex] = useState<string>("#3b82f6");
  const [selectedRgb, setSelectedRgb] = useState<{ r: number; g: number; b: number }>({ r: 59, g: 130, b: 246 });
  const [hoverColor, setHoverColor] = useState<string>("#3b82f6");
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      renderImageAndPalette(img);
    };
    img.src = url;
  };

  const renderImageAndPalette = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);

    // Sample dominant palette
    extractPalette(ctx, canvas.width, canvas.height);
  };

  const extractPalette = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 1000)));
    const imgData = ctx.getImageData(0, 0, w, h).data;
    const colorCounts: Record<string, number> = {};

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        if (imgData[i + 3] < 128) continue; // skip transparent
        // Quantize slightly to group similar colors
        const r = Math.round(imgData[i] / 16) * 16;
        const g = Math.round(imgData[i + 1] / 16) * 16;
        const b = Math.round(imgData[i + 2] / 16) * 16;
        const hex =
          "#" +
          [r, g, b].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join("");
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
    }

    const sorted = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hex]) => hex);

    setPalette(sorted);
    if (sorted[0]) {
      selectHexColor(sorted[0]);
    }
  };

  const selectHexColor = (hex: string) => {
    setSelectedHex(hex);
    const num = parseInt(hex.replace("#", ""), 16);
    setSelectedRgb({
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: (num >> 0) & 0xff,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    const hex =
      "#" +
      [p[0], p[1], p[2]]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
    setHoverColor(hex);
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    const hex =
      "#" +
      [p[0], p[1], p[2]]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
    selectHexColor(hex);
  };

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const hslStr = rgbToHsl(selectedRgb.r, selectedRgb.g, selectedRgb.b);
  const rgbStr = `rgb(${selectedRgb.r}, ${selectedRgb.g}, ${selectedRgb.b})`;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <Pipette className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Choose an image to pick colors</h3>
            <p className="text-sm text-slate-500 mt-1">Magnifying loupe, hex codes, and automatic dominant palette extraction</p>
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

      {/* Editor & Color Inspector */}
      {imageFile && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Pipette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">{imageFile.name}</h4>
                <p className="text-xs text-slate-400">Click anywhere on the image to sample exact pixel colors</p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors"
            >
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {/* Color Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Color Swatch Big Card */}
            <div
              style={{ backgroundColor: selectedHex }}
              className="rounded-2xl p-6 min-h-[120px] flex flex-col justify-end shadow-sm border border-black/10 transition-colors"
            >
              <span className="font-mono text-2xl font-black text-white drop-shadow-md uppercase tracking-wider">
                {selectedHex}
              </span>
            </div>

            {/* HEX */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">HEX Code</span>
                <span className="font-mono text-base font-bold text-slate-900">{selectedHex}</span>
              </div>
              <button
                onClick={() => copyVal("hex", selectedHex)}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
              >
                {copiedKey === "hex" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* RGB */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">RGB Format</span>
                <span className="font-mono text-xs font-bold text-slate-900">{rgbStr}</span>
              </div>
              <button
                onClick={() => copyVal("rgb", rgbStr)}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
              >
                {copiedKey === "rgb" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* HSL */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">HSL Format</span>
                <span className="font-mono text-xs font-bold text-slate-900">{hslStr}</span>
              </div>
              <button
                onClick={() => copyVal("hsl", hslStr)}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
              >
                {copiedKey === "hsl" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Extracted Dominant Palette */}
          {palette.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-700 block">Extracted Dominant Color Palette</span>
              <div className="flex flex-wrap gap-2.5">
                {palette.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => selectHexColor(hex)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all group"
                  >
                    <span
                      style={{ backgroundColor: hex }}
                      className="w-6 h-6 rounded-lg shadow-2xs border border-black/10 group-hover:scale-105 transition-transform"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700 uppercase">{hex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200 flex justify-center p-4 max-h-[460px] overflow-auto">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              className="max-h-[420px] max-w-full object-contain cursor-crosshair rounded-lg shadow-sm"
              title="Click to pick color"
            />
          </div>
        </div>
      )}
    </div>
  );
}
