"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, Lock, Unlock, RefreshCw, Copy, Check, Download, Code } from "lucide-react";

interface ColorItem {
  id: string;
  hex: string;
  locked: boolean;
}

export default function ColorPaletteGeneratorTool() {
  const [colors, setColors] = useState<ColorItem[]>([
    { id: "1", hex: "#2563eb", locked: false },
    { id: "2", hex: "#7c3aed", locked: false },
    { id: "3", hex: "#ec4899", locked: false },
    { id: "4", hex: "#f59e0b", locked: false },
    { id: "5", hex: "#10b981", locked: false },
  ]);
  const [harmony, setHarmony] = useState<"random" | "analogous" | "monochromatic" | "triadic">("random");
  const [copiedHex, setCopiedHex] = useState<string>("");
  const [copiedExport, setCopiedExport] = useState<string>("");

  const randomHex = () => {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  };

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generatePalette = useCallback(() => {
    setColors((prev) => {
      const baseHue = Math.floor(Math.random() * 360);
      return prev.map((item, idx) => {
        if (item.locked) return item;

        let hex = "";
        if (harmony === "random") {
          hex = randomHex();
        } else if (harmony === "analogous") {
          const h = (baseHue + idx * 30) % 360;
          hex = hslToHex(h, 75, 45 + idx * 8);
        } else if (harmony === "monochromatic") {
          const l = 20 + idx * 16;
          hex = hslToHex(baseHue, 70, l);
        } else if (harmony === "triadic") {
          const h = (baseHue + idx * 60) % 360;
          hex = hslToHex(h, 80, 50);
        }
        return { ...item, hex };
      });
    });
  }, [harmony]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        generatePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generatePalette]);

  const toggleLock = (id: string) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(""), 1500);
  };

  const exportCss = () => {
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}`;
    navigator.clipboard.writeText(css);
    setCopiedExport("css");
    setTimeout(() => setCopiedExport(""), 2000);
  };

  const exportJson = () => {
    const json = JSON.stringify(colors.map((c) => c.hex), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedExport("json");
    setTimeout(() => setCopiedExport(""), 2000);
  };

  // Check luminance for light vs dark text
  const isLight = (hex: string) => {
    const rgb = parseInt(hex.replace("#", ""), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 140;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generatePalette}
            className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Palette
          </button>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">or press Spacebar</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-2">
            <span>Harmony:</span>
            <select
              value={harmony}
              onChange={(e) => setHarmony(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold focus:outline-pink-500"
            >
              <option value="random">Random / Trend</option>
              <option value="analogous">Analogous</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="triadic">Triadic</option>
            </select>
          </div>

          <button
            onClick={exportCss}
            className="text-xs font-semibold text-slate-700 hover:text-pink-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-pink-200 transition-colors flex items-center gap-1.5"
          >
            {copiedExport === "css" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code className="w-3.5 h-3.5" />}
            {copiedExport === "css" ? "Copied CSS!" : "Copy CSS"}
          </button>

          <button
            onClick={exportJson}
            className="text-xs font-semibold text-slate-700 hover:text-pink-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-pink-200 transition-colors flex items-center gap-1.5"
          >
            {copiedExport === "json" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedExport === "json" ? "Copied JSON!" : "Copy JSON"}
          </button>
        </div>
      </div>

      {/* Palette Preview Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-5 rounded-3xl overflow-hidden shadow-md min-h-[360px] border border-slate-200/80">
        {colors.map((color) => {
          const light = isLight(color.hex);
          const textColor = light ? "text-slate-900" : "text-white";
          const subColor = light ? "text-slate-700/80" : "text-white/80";

          return (
            <div
              key={color.id}
              style={{ backgroundColor: color.hex }}
              className="relative p-6 flex flex-col justify-between transition-colors duration-200 min-h-[140px] sm:min-h-[380px] group"
            >
              {/* Lock Button Top */}
              <div className="flex justify-end">
                <button
                  onClick={() => toggleLock(color.id)}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                    color.locked
                      ? "bg-black/30 text-white"
                      : "bg-white/20 hover:bg-white/40 text-white opacity-80 group-hover:opacity-100"
                  }`}
                  title={color.locked ? "Click to Unlock" : "Click to Lock"}
                >
                  {color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              {/* Color Details Bottom */}
              <div className="space-y-2">
                <button
                  onClick={() => copyHex(color.hex)}
                  className={`w-full text-left font-mono font-black text-xl sm:text-2xl uppercase tracking-wider ${textColor} flex items-center justify-between hover:opacity-80 transition-opacity`}
                >
                  <span>{color.hex}</span>
                  {copiedHex === color.hex ? (
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                  )}
                </button>
                <p className={`text-[11px] font-semibold tracking-wide ${subColor}`}>
                  {copiedHex === color.hex ? "Copied to clipboard!" : color.locked ? "Locked" : "Click hex to copy"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
