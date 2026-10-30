"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Plus, Trash2, RotateCw } from "lucide-react";

interface ColorStop {
  id: string;
  color: string;
  stop: number;
}

const PRESETS: { name: string; type: "linear" | "radial"; angle: number; stops: ColorStop[] }[] = [
  {
    name: "Hyper Neon",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#ec4899", stop: 0 },
      { id: "2", color: "#8b5cf6", stop: 50 },
      { id: "3", color: "#3b82f6", stop: 100 },
    ],
  },
  {
    name: "Ocean Blue",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#2e0854", stop: 0 },
      { id: "2", color: "#1e3a8a", stop: 50 },
      { id: "3", color: "#06b6d4", stop: 100 },
    ],
  },
  {
    name: "Sunset Blaze",
    type: "linear",
    angle: 45,
    stops: [
      { id: "1", color: "#ff0844", stop: 0 },
      { id: "2", color: "#ffb199", stop: 100 },
    ],
  },
  {
    name: "Emerald Glow",
    type: "linear",
    angle: 120,
    stops: [
      { id: "1", color: "#059669", stop: 0 },
      { id: "2", color: "#34d399", stop: 50 },
      { id: "3", color: "#a7f3d0", stop: 100 },
    ],
  },
  {
    name: "Cyberpunk",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#f43f5e", stop: 0 },
      { id: "2", color: "#d946ef", stop: 40 },
      { id: "3", color: "#06b6d4", stop: 100 },
    ],
  },
];

export default function CssGradientGeneratorTool() {
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState<number>(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "1", color: "#4f46e5", stop: 0 },
    { id: "2", color: "#06b6d4", stop: 100 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute CSS gradient string
  const sortedStops = [...stops].sort((a, b) => a.stop - b.stop);
  const stopsStr = sortedStops.map((s) => `${s.color} ${s.stop}%`).join(", ");

  const cssRule =
    gradientType === "linear"
      ? `linear-gradient(${angle}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;

  const fullCss = `background: ${cssRule};`;

  const addStop = () => {
    if (stops.length >= 6) return;
    const newStopVal = Math.round(
      (sortedStops[sortedStops.length - 2]?.stop || 0) +
        ((sortedStops[sortedStops.length - 1]?.stop || 100) -
          (sortedStops[sortedStops.length - 2]?.stop || 0)) /
          2
    );
    setStops([
      ...stops,
      { id: Math.random().toString(36).substring(7), color: "#ec4899", stop: newStopVal || 50 },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, field: "color" | "stop", value: any) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops);
  };

  const copyCss = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Box */}
      <div
        style={{ background: cssRule }}
        className="w-full h-56 sm:h-72 rounded-3xl shadow-lg border border-white/20 transition-all duration-300 relative flex items-end p-6"
      >
        <button
          onClick={copyCss}
          className="px-5 py-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 transition-colors border border-white/20 shadow-md ml-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied CSS!" : "Copy CSS Code"}
        </button>
      </div>

      {/* Editor & Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Type & Angle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGradientType("linear")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                gradientType === "linear" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              Linear Gradient
            </button>
            <button
              type="button"
              onClick={() => setGradientType("radial")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                gradientType === "radial" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              Radial Gradient
            </button>
          </div>

          {gradientType === "linear" && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Angle: {angle}°</span>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-28 sm:w-36 accent-purple-600"
              />
            </div>
          )}
        </div>

        {/* Color Stops Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Color Stops ({stops.length}/6)</h4>
            {stops.length < 6 && (
              <button
                onClick={addStop}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stop
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {stops.map((s, idx) => (
              <div
                key={s.id}
                className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs"
              >
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => updateStop(s.id, "color", e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <span className="font-mono font-bold text-slate-700 w-20">{s.color}</span>

                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.stop}
                    onChange={(e) => updateStop(s.id, "stop", Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <span className="font-mono text-slate-500 w-10 text-right">{s.stop}%</span>
                </div>

                {stops.length > 2 && (
                  <button
                    onClick={() => removeStop(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Presets Gallery */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Curated Presets</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRESETS.map((p) => {
              const pStr = p.stops.map((s) => `${s.color} ${s.stop}%`).join(", ");
              const pCss = `linear-gradient(${p.angle}deg, ${pStr})`;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="flex flex-col items-center gap-2 p-2 rounded-2xl border border-slate-100 hover:border-purple-300 hover:shadow-xs transition-all group"
                >
                  <div
                    style={{ background: pCss }}
                    className="w-full h-12 rounded-xl shadow-2xs group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-slate-700">{p.name}</span>
                </button>
              );
            })}
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
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
