"use client";

import { useState, useRef, useEffect } from "react";
import { Stamp, Upload, Download, Type, Image as ImageIcon, Sliders, CheckCircle2 } from "lucide-react";

type Position = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br" | "tile";

export default function ImageWatermarkTool() {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "logo">("text");

  // Text watermark options
  const [text, setText] = useState<string>("© 2026 ToolHub. All Rights Reserved.");
  const [fontFamily, setFontFamily] = useState<string>("Arial, sans-serif");
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [opacity, setOpacity] = useState<number>(65);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<Position>("br");

  // Logo watermark options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoScale, setLogoScale] = useState<number>(20); // percent of base width

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const baseInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleBaseFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setBaseFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      baseImgRef.current = img;
      renderWatermark();
    };
    img.src = url;
  };

  const handleLogoFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setLogoFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoImgRef.current = img;
      renderWatermark();
    };
    img.src = url;
  };

  const renderWatermark = () => {
    if (!canvasRef.current || !baseImgRef.current) return;
    const base = baseImgRef.current;
    const canvas = canvasRef.current;
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw base photo
    ctx.drawImage(base, 0, 0);

    const w = canvas.width;
    const h = canvas.height;
    const alpha = opacity / 100;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (watermarkType === "text" && text) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";

      const textMetrics = ctx.measureText(text);
      const tw = textMetrics.width;
      const th = fontSize;

      if (position === "tile") {
        // Tiled watermark pattern
        const stepX = tw + 100;
        const stepY = th + 80;
        ctx.rotate((rotation * Math.PI) / 180);
        for (let x = -w; x < w * 2; x += stepX) {
          for (let y = -h; y < h * 2; y += stepY) {
            ctx.fillText(text, x, y);
          }
        }
      } else {
        // 9-point grid placement
        const pad = Math.max(20, Math.round(w * 0.03));
        let x = pad;
        let y = pad + th / 2;

        if (position === "tc" || position === "mc" || position === "bc") x = (w - tw) / 2;
        if (position === "tr" || position === "mr" || position === "br") x = w - tw - pad;

        if (position === "ml" || position === "mc" || position === "mr") y = h / 2;
        if (position === "bl" || position === "bc" || position === "br") y = h - pad - th / 2;

        ctx.translate(x + tw / 2, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, -tw / 2, 0);
      }
    } else if (watermarkType === "logo" && logoImgRef.current) {
      const logo = logoImgRef.current;
      const targetW = (w * logoScale) / 100;
      const scale = targetW / logo.width;
      const targetH = logo.height * scale;
      const pad = Math.max(20, Math.round(w * 0.03));

      let x = pad;
      let y = pad;

      if (position === "tc" || position === "mc" || position === "bc") x = (w - targetW) / 2;
      if (position === "tr" || position === "mr" || position === "br") x = w - targetW - pad;

      if (position === "ml" || position === "mc" || position === "mr") y = (h - targetH) / 2;
      if (position === "bl" || position === "bc" || position === "br") y = h - targetH - pad;

      ctx.drawImage(logo, x, y, targetW, targetH);
    }

    ctx.restore();
  };

  useEffect(() => {
    if (baseImgRef.current) renderWatermark();
  }, [watermarkType, text, fontFamily, fontSize, textColor, opacity, rotation, position, logoScale]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseFile?.name?.replace(/\.[^.]+$/, "") || "image"}_watermarked.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!baseFile && (
        <div
          onClick={() => baseInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Stamp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select an image to watermark</h3>
            <p className="text-sm text-slate-500 mt-1">Add copyright text, brand stamps, or transparent logo watermarks</p>
          </div>
          <input
            ref={baseInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleBaseFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Editor & Controls */}
      {baseFile && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Stamp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">{baseFile.name}</h4>
                <p className="text-xs text-slate-400">Client-side lossless canvas watermark rendering</p>
              </div>
            </div>

            <button
              onClick={() => baseInputRef.current?.click()}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
            >
              Change Photo
            </button>
            <input
              ref={baseInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleBaseFile(e.target.files[0])}
            />
          </div>

          {/* Watermark Type Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWatermarkType("text")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                watermarkType === "text" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Text Watermark
            </button>
            <button
              type="button"
              onClick={() => setWatermarkType("logo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                watermarkType === "logo" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Logo / Image Watermark
            </button>
          </div>

          {/* Options Grid */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            {watermarkType === "text" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-500"
                  >
                    <option value="Arial, sans-serif">Sans-Serif (Arial)</option>
                    <option value="Georgia, serif">Serif (Georgia)</option>
                    <option value="Impact, sans-serif">Bold (Impact)</option>
                    <option value="Courier New, monospace">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Text Color</label>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-xs font-bold text-slate-700">{textColor}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {logoFile ? `Logo: ${logoFile.name}` : "Upload Watermark Logo (PNG)"}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoFile(e.target.files[0])}
                  />
                </label>
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Scale: {logoScale}%</span>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Common Adjusters: Opacity, Size, Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-slate-200/60 pt-4">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {watermarkType === "text" && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Font Size</span>
                    <span className="font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="96"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}

              {/* 9-Point Alignment Grid */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Position</span>
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-3 gap-1 w-24 h-24 bg-white p-1 rounded-xl border border-slate-200">
                    {(["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"] as Position[]).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`rounded-md transition-colors ${
                          position === pos ? "bg-indigo-600" : "bg-slate-100 hover:bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPosition("tile")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      position === "tile"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    Repeat Tile Pattern
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex justify-center p-4 max-h-[480px] overflow-auto">
            <canvas ref={canvasRef} className="max-h-[440px] max-w-full object-contain rounded shadow-md" />
          </div>

          {/* Download Action */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400 font-medium">Export retains original camera resolution</span>
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Watermarked PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
