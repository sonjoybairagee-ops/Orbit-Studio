"use client";

import { useState } from "react";
import { Move3d, Copy, Check, RotateCcw } from "lucide-react";

export default function TransformGeneratorTool() {
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [skewX, setSkewX] = useState<number>(0);
  const [skewY, setSkewY] = useState<number>(0);
  const [perspective, setPerspective] = useState<number>(800);
  const [origin, setOrigin] = useState<string>("center");
  const [copied, setCopied] = useState<boolean>(false);

  // Compute CSS transform string
  const transforms: string[] = [];
  if (perspective !== 800) transforms.push(`perspective(${perspective}px)`);
  if (translateX !== 0 || translateY !== 0) transforms.push(`translate(${translateX}px, ${translateY}px)`);
  if (scale !== 1) transforms.push(`scale(${scale})`);
  if (rotate !== 0) transforms.push(`rotate(${rotate}deg)`);
  if (rotateX !== 0) transforms.push(`rotateX(${rotateX}deg)`);
  if (rotateY !== 0) transforms.push(`rotateY(${rotateY}deg)`);
  if (skewX !== 0 || skewY !== 0) transforms.push(`skew(${skewX}deg, ${skewY}deg)`);

  const transformValue = transforms.length > 0 ? transforms.join(" ") : "none";
  const fullCss = `transform: ${transformValue};\ntransform-origin: ${origin};`;

  const resetAll = () => {
    setTranslateX(0);
    setTranslateY(0);
    setScale(1);
    setRotate(0);
    setRotateX(0);
    setRotateY(0);
    setSkewX(0);
    setSkewY(0);
    setPerspective(800);
    setOrigin("center");
  };

  const applyPreset = (preset: "isometric" | "tilt" | "skewBadge" | "flip") => {
    resetAll();
    if (preset === "isometric") {
      setRotateX(55);
      setRotate(45);
      setPerspective(1000);
    } else if (preset === "tilt") {
      setRotateX(20);
      setRotateY(-15);
      setPerspective(600);
    } else if (preset === "skewBadge") {
      setSkewX(-12);
      setRotate(2);
    } else if (preset === "flip") {
      setRotateY(180);
      setPerspective(600);
    }
  };

  const copyCss = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 3D Perspective Stage Viewport */}
      <div
        style={{ perspective: `${perspective}px` }}
        className="rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center min-h-[340px] overflow-hidden"
      >
        <div
          style={{
            transform: transformValue,
            transformOrigin: origin,
            transition: "transform 0.15s ease-out",
          }}
          className="w-56 h-40 sm:w-64 sm:h-44 bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white p-4 text-center select-none border border-white/20"
        >
          <Move3d className="w-8 h-8 text-sky-200 mb-2 drop-shadow" />
          <span className="font-bold text-sm">CSS 3D Transform</span>
          <span className="text-[11px] text-sky-100 font-mono mt-1 opacity-90">
            rot: {rotate}° • scl: {scale}x
          </span>
        </div>
      </div>

      {/* Editor & Sliders */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transform Controls</h4>
          <button
            onClick={resetAll}
            className="text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-2xl text-xs font-semibold text-slate-700">
          {/* Rotate 2D */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Rotate (2D)</span>
              <span className="font-mono">{rotate}°</span>
            </div>
            <input type="range" min="0" max="360" value={rotate} onChange={(e) => setRotate(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Scale */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Scale</span>
              <span className="font-mono">{scale}x</span>
            </div>
            <input type="range" min="0.3" max="2.0" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Rotate X (3D) */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Rotate X (3D Tilt)</span>
              <span className="font-mono">{rotateX}°</span>
            </div>
            <input type="range" min="-60" max="60" value={rotateX} onChange={(e) => setRotateX(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Rotate Y (3D) */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Rotate Y (3D Spin)</span>
              <span className="font-mono">{rotateY}°</span>
            </div>
            <input type="range" min="-60" max="60" value={rotateY} onChange={(e) => setRotateY(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Skew X */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Skew X</span>
              <span className="font-mono">{skewX}°</span>
            </div>
            <input type="range" min="-45" max="45" value={skewX} onChange={(e) => setSkewX(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Skew Y */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Skew Y</span>
              <span className="font-mono">{skewY}°</span>
            </div>
            <input type="range" min="-45" max="45" value={skewY} onChange={(e) => setSkewY(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Translate X */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Translate X</span>
              <span className="font-mono">{translateX}px</span>
            </div>
            <input type="range" min="-100" max="100" value={translateX} onChange={(e) => setTranslateX(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Translate Y */}
          <div>
            <div className="flex justify-between mb-1">
              <span>Translate Y</span>
              <span className="font-mono">{translateY}px</span>
            </div>
            <input type="range" min="-100" max="100" value={translateY} onChange={(e) => setTranslateY(Number(e.target.value))} className="w-full accent-sky-600" />
          </div>

          {/* Transform Origin */}
          <div>
            <span className="block mb-1">Transform Origin</span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-sky-500"
            >
              <option value="center">Center</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
              <option value="bottom left">Bottom Left</option>
              <option value="bottom right">Bottom Right</option>
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="border-t border-slate-100 pt-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">3D Presets</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "isometric", label: "Isometric 3D Projection" },
              { id: "tilt", label: "3D Perspective Tilt" },
              { id: "skewBadge", label: "Slanted Skew Ribbon" },
              { id: "flip", label: "Card Flip (180°)" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as any)}
                className="text-xs font-bold text-slate-700 hover:text-sky-700 bg-slate-50 hover:bg-sky-50 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-sky-200 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Output */}
        <div className="border-t border-slate-100 pt-5">
          <label className="text-xs font-bold text-slate-800 block mb-2">CSS Code</label>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs flex items-center justify-between">
            <span className="truncate pr-4 whitespace-pre">{fullCss}</span>
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
