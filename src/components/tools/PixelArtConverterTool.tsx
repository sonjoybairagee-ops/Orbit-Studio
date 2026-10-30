"use client";

import { useState, useRef, useEffect } from "react";
import { Grid, Upload, Download, Sliders, Sparkles } from "lucide-react";

type PaletteMode = "full" | "gameboy" | "nes" | "pico8" | "grayscale";

const PALETTES: Record<PaletteMode, { name: string; colors?: number[][] }> = {
  full: { name: "Full 24-bit Color" },
  gameboy: {
    name: "Game Boy (4 Shades)",
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  nes: {
    name: "NES 8-Bit (Classic)",
    colors: [
      [0, 0, 0], [255, 255, 255], [116, 116, 116], [36, 24, 140],
      [0, 0, 168], [68, 0, 156], [140, 0, 116], [168, 0, 32],
      [164, 0, 0], [124, 8, 0], [64, 44, 0], [0, 68, 0],
      [0, 64, 88], [24, 60, 92], [252, 152, 56], [252, 216, 168]
    ],
  },
  pico8: {
    name: "PICO-8 (16 Colors)",
    colors: [
      [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
      [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
      [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
      [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170]
    ],
  },
  grayscale: {
    name: "Grayscale (4-bit)",
    colors: [
      [0, 0, 0], [60, 60, 60], [120, 120, 120], [180, 180, 180], [255, 255, 255]
    ],
  },
};

export default function PixelArtConverterTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(12);
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("full");
  const [showGrid, setShowGrid] = useState<boolean>(false);

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
      renderPixelArt();
    };
    img.src = url;
  };

  const findNearestColor = (r: number, g: number, b: number, palette: number[][]): number[] => {
    let best = palette[0];
    let minDist = 9999999;
    for (const c of palette) {
      const dr = r - c[0];
      const dg = g - c[1];
      const db = b - c[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        best = c;
      }
    }
    return best;
  };

  const renderPixelArt = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;

    // Small downsampled offscreen canvas
    const downW = Math.max(1, Math.floor(w / pixelSize));
    const downH = Math.max(1, Math.floor(h / pixelSize));
    const offCanvas = document.createElement("canvas");
    offCanvas.width = downW;
    offCanvas.height = downH;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) return;

    // Draw downscaled image
    offCtx.drawImage(img, 0, 0, downW, downH);

    // Apply color palette quantization if selected
    if (paletteMode !== "full" && PALETTES[paletteMode].colors) {
      const palette = PALETTES[paletteMode].colors!;
      const imgData = offCtx.getImageData(0, 0, downW, downH);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue; // skip transparent
        const [nr, ng, nb] = findNearestColor(d[i], d[i + 1], d[i + 2], palette);
        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
      }
      offCtx.putImageData(imgData, 0, 0);
    }

    // Upscale nearest-neighbor back to full canvas
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offCanvas, 0, 0, downW, downH, 0, 0, w, h);

    // Draw subtle grid overlay if enabled
    if (showGrid && pixelSize >= 8) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += pixelSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += pixelSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (imgRef.current) renderPixelArt();
  }, [pixelSize, paletteMode, showGrid]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${imageFile?.name?.replace(/\.[^.]+$/, "") || "pixel"}_pixelart.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-cyan-200 hover:border-cyan-400 bg-cyan-50/30 hover:bg-cyan-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
            <Grid className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select an image to pixelate</h3>
            <p className="text-sm text-slate-500 mt-1">Convert photos, portraits, and game sprites into retro 8-bit art</p>
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

      {/* Editor & Preview */}
      {imageFile && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">{imageFile.name}</h4>
                <p className="text-xs text-slate-400">Real-time nearest-neighbor canvas pixelation</p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-slate-600 hover:text-cyan-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-cyan-200 transition-colors"
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

          {/* Config Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-slate-50 p-4 rounded-2xl">
            {/* Block Size */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Pixel Block Size</span>
                <span className="font-mono text-cyan-700 font-bold">{pixelSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="36"
                step="2"
                value={pixelSize}
                onChange={(e) => setPixelSize(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </div>

            {/* Retro Palette */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Retro Color Palette</label>
              <select
                value={paletteMode}
                onChange={(e) => setPaletteMode(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-cyan-500"
              >
                <option value="full">Full Color (Original)</option>
                <option value="gameboy">Game Boy (4-color green)</option>
                <option value="nes">NES 8-Bit (16-color)</option>
                <option value="pico8">PICO-8 Fantasy (16-color)</option>
                <option value="grayscale">Grayscale (4-bit)</option>
              </select>
            </div>

            {/* Grid Overlay Toggle */}
            <div className="flex items-center sm:justify-center">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded accent-cyan-600"
                />
                <span>Show Pixel Grid Overlay</span>
              </label>
            </div>
          </div>

          {/* Canvas Display */}
          <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex justify-center p-4 max-h-[480px] overflow-auto">
            <canvas ref={canvasRef} className="max-h-[440px] max-w-full object-contain rounded shadow-md" />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400 font-medium">Export preserves original high resolution</span>
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Pixel Art PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
