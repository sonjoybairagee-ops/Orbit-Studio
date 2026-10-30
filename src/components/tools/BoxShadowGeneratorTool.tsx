"use client";

import { useState } from "react";
import { BoxSelect, Copy, Check, Plus, Trash2, Sun, Moon } from "lucide-react";

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: "Soft Elevation",
    layers: [
      { id: "1", x: 0, y: 10, blur: 25, spread: -5, color: "#000000", opacity: 10, inset: false },
      { id: "2", x: 0, y: 8, blur: 10, spread: -6, color: "#000000", opacity: 10, inset: false },
    ],
  },
  {
    name: "Floating Card",
    layers: [
      { id: "1", x: 0, y: 20, blur: 40, spread: -10, color: "#0f172a", opacity: 20, inset: false },
    ],
  },
  {
    name: "Neon Cyan Glow",
    layers: [
      { id: "1", x: 0, y: 0, blur: 20, spread: 2, color: "#06b6d4", opacity: 60, inset: false },
      { id: "2", x: 0, y: 0, blur: 40, spread: 5, color: "#3b82f6", opacity: 40, inset: false },
    ],
  },
  {
    name: "Purple Inset",
    layers: [
      { id: "1", x: 4, y: 4, blur: 16, spread: 0, color: "#7c3aed", opacity: 25, inset: true },
      { id: "2", x: -4, y: -4, blur: 16, spread: 0, color: "#ec4899", opacity: 20, inset: true },
    ],
  },
  {
    name: "Sharp Retro",
    layers: [
      { id: "1", x: 8, y: 8, blur: 0, spread: 0, color: "#0f172a", opacity: 100, inset: false },
    ],
  },
];

export default function BoxShadowGeneratorTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", x: 0, y: 12, blur: 30, spread: -4, color: "#000000", opacity: 15, inset: false },
  ]);
  const [previewBg, setPreviewBg] = useState<"light" | "gray" | "dark">("light");
  const [copied, setCopied] = useState<boolean>(false);

  // Convert hex + opacity to rgba string
  const hexToRgba = (hex: string, op: number) => {
    const c = parseInt(hex.replace("#", ""), 16);
    const r = (c >> 16) & 0xff;
    const g = (c >> 8) & 0xff;
    const b = (c >> 0) & 0xff;
    return `rgba(${r}, ${g}, ${b}, ${(op / 100).toFixed(2)})`;
  };

  const cssValue = layers
    .map(
      (l) =>
        `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`
    )
    .join(", ");

  const fullCss = `box-shadow: ${cssValue};`;

  const addLayer = () => {
    if (layers.length >= 5) return;
    setLayers([
      ...layers,
      {
        id: Math.random().toString(36).substring(7),
        x: 0,
        y: 4,
        blur: 12,
        spread: 0,
        color: "#000000",
        opacity: 15,
        inset: false,
      },
    ]);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((l) => l.id !== id));
  };

  const updateLayer = (id: string, field: keyof ShadowLayer, val: any) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  };

  const copyCss = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Preview Box */}
      <div
        className={`rounded-3xl p-8 sm:p-14 border border-slate-200 transition-colors flex flex-col items-center justify-center min-h-[320px] relative ${
          previewBg === "dark" ? "bg-slate-900" : previewBg === "gray" ? "bg-slate-200" : "bg-slate-100/70"
        }`}
      >
        {/* Backdrop Switcher */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setPreviewBg("light")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              previewBg === "light" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setPreviewBg("gray")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              previewBg === "gray" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Gray
          </button>
          <button
            type="button"
            onClick={() => setPreviewBg("dark")}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              previewBg === "dark" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Dark
          </button>
        </div>

        {/* The Shadow Target Box */}
        <div
          style={{ boxShadow: cssValue }}
          className="w-56 h-40 sm:w-64 sm:h-44 bg-white rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-all duration-200"
        >
          <BoxSelect className="w-8 h-8 text-violet-600 mb-2" />
          <span className="text-xs font-bold text-slate-800">Box Shadow Element</span>
          <span className="text-[10px] text-slate-400 mt-1">{layers.length} shadow layer{layers.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Editor & Layers */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Shadow Layers ({layers.length}/5)
          </h4>
          {layers.length < 5 && (
            <button
              onClick={addLayer}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shadow Layer
            </button>
          )}
        </div>

        {/* Sliders for each layer */}
        <div className="space-y-6">
          {layers.map((l, idx) => (
            <div
              key={l.id}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-bold text-slate-700">Layer {idx + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={l.inset}
                      onChange={(e) => updateLayer(l.id, "inset", e.target.checked)}
                      className="rounded accent-violet-600"
                    />
                    <span>Inset Shadow</span>
                  </label>

                  {layers.length > 1 && (
                    <button
                      onClick={() => removeLayer(l.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                {/* X */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>X Offset</span>
                    <span className="font-mono">{l.x}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={l.x}
                    onChange={(e) => updateLayer(l.id, "x", Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Y */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Y Offset</span>
                    <span className="font-mono">{l.y}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={l.y}
                    onChange={(e) => updateLayer(l.id, "y", Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Blur Radius</span>
                    <span className="font-mono">{l.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={l.blur}
                    onChange={(e) => updateLayer(l.id, "blur", Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Spread */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Spread Radius</span>
                    <span className="font-mono">{l.spread}px</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={l.spread}
                    onChange={(e) => updateLayer(l.id, "spread", Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                {/* Color */}
                <div>
                  <span className="block mb-1">Color</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5">
                    <input
                      type="color"
                      value={l.color}
                      onChange={(e) => updateLayer(l.id, "color", e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-xs font-bold text-slate-800">{l.color}</span>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Opacity</span>
                    <span className="font-mono">{l.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={l.opacity}
                    onChange={(e) => updateLayer(l.id, "opacity", Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Popular Elevation Presets
          </span>
          <div className="flex flex-wrap gap-2.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setLayers(p.layers)}
                className="text-xs font-bold text-slate-700 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Output */}
        <div className="border-t border-slate-100 pt-5">
          <label className="text-xs font-bold text-slate-800 block mb-2">CSS Code</label>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs flex items-center justify-between">
            <span className="truncate pr-4">{fullCss}</span>
            <button
              onClick={copyCss}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy CSS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
