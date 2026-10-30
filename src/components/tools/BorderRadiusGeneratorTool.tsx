"use client";

import { useState } from "react";
import { Square, Copy, Check, Sparkles, Link as LinkIcon, Unlink } from "lucide-react";

export default function BorderRadiusGeneratorTool() {
  const [mode, setMode] = useState<"standard" | "blob">("standard");
  const [allLinked, setAllLinked] = useState<boolean>(true);
  const [unit, setUnit] = useState<"px" | "%">("px");

  // Standard 4 corners
  const [tl, setTl] = useState<number>(24);
  const [tr, setTr] = useState<number>(24);
  const [br, setBr] = useState<number>(24);
  const [bl, setBl] = useState<number>(24);

  // 8-value blob corners (horizontal & vertical radii)
  const [h1, setH1] = useState<number>(40);
  const [h2, setH2] = useState<number>(60);
  const [h3, setH3] = useState<number>(70);
  const [h4, setH4] = useState<number>(30);
  const [v1, setV1] = useState<number>(60);
  const [v2, setV2] = useState<number>(40);
  const [v3, setV3] = useState<number>(30);
  const [v4, setV4] = useState<number>(70);

  const [copied, setCopied] = useState<boolean>(false);

  // Synchronize when linked
  const handleLinkedChange = (val: number) => {
    setTl(val);
    setTr(val);
    setBr(val);
    setBl(val);
  };

  const standardCss =
    tl === tr && tr === br && br === bl
      ? `${tl}${unit}`
      : `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;

  const blobCss = `${h1}% ${h2}% ${h3}% ${h4}% / ${v1}% ${v2}% ${v3}% ${v4}%`;

  const cssValue = mode === "standard" ? standardCss : blobCss;
  const fullCss = `border-radius: ${cssValue};`;

  const copyCss = () => {
    navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: "pill" | "card" | "blob1" | "leaf" | "circle") => {
    if (preset === "pill") {
      setMode("standard");
      setAllLinked(true);
      setUnit("px");
      handleLinkedChange(9999);
    } else if (preset === "card") {
      setMode("standard");
      setAllLinked(true);
      setUnit("px");
      handleLinkedChange(24);
    } else if (preset === "circle") {
      setMode("standard");
      setAllLinked(true);
      setUnit("%");
      handleLinkedChange(50);
    } else if (preset === "leaf") {
      setMode("standard");
      setAllLinked(false);
      setUnit("px");
      setTl(48);
      setTr(0);
      setBr(48);
      setBl(0);
    } else if (preset === "blob1") {
      setMode("blob");
      setH1(30); setH2(70); setH3(70); setH4(30);
      setV1(30); setV2(30); setV3(70); setV4(70);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Visual Preview */}
      <div className="rounded-3xl p-8 sm:p-14 bg-slate-100/70 border border-slate-200 transition-colors flex items-center justify-center min-h-[300px]">
        <div
          style={{ borderRadius: cssValue }}
          className="w-56 h-48 sm:w-64 sm:h-56 bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl flex items-center justify-center text-white font-bold text-xs transition-all duration-300 p-4 text-center select-none"
        >
          <span>Border Radius Element</span>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Mode selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("standard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "standard" ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              Standard (4 Corners)
            </button>
            <button
              type="button"
              onClick={() => setMode("blob")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "blob" ? "bg-orange-600 text-white shadow-xs" : "bg-slate-100 text-slate-600"
              }`}
            >
              8-Point Organic Blob
            </button>
          </div>

          {mode === "standard" && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAllLinked(!allLinked)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                  allLinked ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                {allLinked ? <LinkIcon className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                {allLinked ? "Linked (All Corners)" : "Independent Corners"}
              </button>

              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUnit("px")}
                  className={`px-2.5 py-1 rounded-lg ${unit === "px" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
                >
                  px
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("%")}
                  className={`px-2.5 py-1 rounded-lg ${unit === "%" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
                >
                  %
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sliders Area */}
        {mode === "standard" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl">
            {allLinked ? (
              <div className="col-span-full">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>All Corners Radius</span>
                  <span className="font-mono">{tl}{unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={unit === "%" ? 50 : 150}
                  value={tl}
                  onChange={(e) => handleLinkedChange(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Top Left</span>
                    <span className="font-mono">{tl}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={unit === "%" ? 50 : 150}
                    value={tl}
                    onChange={(e) => setTl(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Top Right</span>
                    <span className="font-mono">{tr}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={unit === "%" ? 50 : 150}
                    value={tr}
                    onChange={(e) => setTr(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Bottom Right</span>
                    <span className="font-mono">{br}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={unit === "%" ? 50 : 150}
                    value={br}
                    onChange={(e) => setBr(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Bottom Left</span>
                    <span className="font-mono">{bl}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={unit === "%" ? 50 : 150}
                    value={bl}
                    onChange={(e) => setBl(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl">
            <span className="text-xs font-bold text-slate-700 block">8-Point Morphing Sliders</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
              <div>
                <span className="block mb-1">H-Top Left: {h1}%</span>
                <input type="range" min="0" max="100" value={h1} onChange={(e) => setH1(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">H-Top Right: {h2}%</span>
                <input type="range" min="0" max="100" value={h2} onChange={(e) => setH2(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">H-Bottom Right: {h3}%</span>
                <input type="range" min="0" max="100" value={h3} onChange={(e) => setH3(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">H-Bottom Left: {h4}%</span>
                <input type="range" min="0" max="100" value={h4} onChange={(e) => setH4(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">V-Top Left: {v1}%</span>
                <input type="range" min="0" max="100" value={v1} onChange={(e) => setV1(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">V-Top Right: {v2}%</span>
                <input type="range" min="0" max="100" value={v2} onChange={(e) => setV2(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">V-Bottom Right: {v3}%</span>
                <input type="range" min="0" max="100" value={v3} onChange={(e) => setV3(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
              <div>
                <span className="block mb-1">V-Bottom Left: {v4}%</span>
                <input type="range" min="0" max="100" value={v4} onChange={(e) => setV4(Number(e.target.value))} className="w-full accent-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Presets */}
        <div className="border-t border-slate-100 pt-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Quick Presets</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "card", label: "Modern Card (24px)" },
              { id: "pill", label: "Pill Button" },
              { id: "circle", label: "Circle (50%)" },
              { id: "leaf", label: "Asymmetrical Leaf" },
              { id: "blob1", label: "Organic Fluid Blob" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as any)}
                className="text-xs font-bold text-slate-700 hover:text-orange-700 bg-slate-50 hover:bg-orange-50 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 transition-colors"
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
