"use client";

import { useState } from "react";
import { Contrast, ArrowLeftRight, CheckCircle2, XCircle, Copy, Check } from "lucide-react";

export default function ColorContrastCheckerTool() {
  const [fgColor, setFgColor] = useState<string>("#0f172a");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate relative luminance according to WCAG 2.1
  const getLuminance = (hex: string): number => {
    const c = parseInt(hex.replace("#", ""), 16);
    const r = ((c >> 16) & 0xff) / 255;
    const g = ((c >> 8) & 0xff) / 255;
    const b = (c & 0xff) / 255;

    const transform = (val: number) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    };

    const rL = transform(r);
    const gL = transform(g);
    const bL = transform(b);

    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  };

  const lum1 = getLuminance(fgColor);
  const lum2 = getLuminance(bgColor);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  const ratioRounded = ratio.toFixed(2);

  // Criteria
  const passAaNormal = ratio >= 4.5;
  const passAaLarge = ratio >= 3.0;
  const passAaaNormal = ratio >= 7.0;
  const passAaaLarge = ratio >= 4.5;
  const passUi = ratio >= 3.0;

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const copySummary = () => {
    navigator.clipboard.writeText(`Foreground: ${fgColor}, Background: ${bgColor}, Contrast Ratio: ${ratioRounded}:1`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Pickers & Summary Row */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Foreground (Text) */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Text Color (Foreground)
            </label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="font-mono text-sm font-bold text-slate-800 bg-transparent focus:outline-hidden w-24 uppercase"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapColors}
            className="p-3 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-all self-end"
            title="Swap foreground & background"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Background */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Background Color
            </label>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="font-mono text-sm font-bold text-slate-800 bg-transparent focus:outline-hidden w-24 uppercase"
              />
            </div>
          </div>

          {/* Contrast Score Big Banner */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl min-w-[150px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contrast Ratio</span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 mt-0.5">
              {ratioRounded}:1
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-400 mr-2">Presets:</span>
          {[
            { label: "Classic Dark", fg: "#0f172a", bg: "#ffffff" },
            { label: "Night Owl", fg: "#f8fafc", bg: "#0f172a" },
            { label: "Accessible Navy", fg: "#ffffff", bg: "#1e3a8a" },
            { label: "Forest Green", fg: "#ffffff", bg: "#065f46" },
            { label: "Warm Stone", fg: "#292524", bg: "#f5f5f4" },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ background: preset.bg }}>
                <div className="w-1.5 h-1.5 rounded-full mx-auto my-1" style={{ background: preset.fg }} />
              </div>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* WCAG Compliance Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* AA Normal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">WCAG AA</span>
            {passAaNormal ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                <XCircle className="w-4 h-4" /> Fail
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800">Normal Text (≥ 4.5:1)</p>
          <p className="text-[11px] text-slate-400">Body copy below 18pt</p>
        </div>

        {/* AA Large */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">WCAG AA</span>
            {passAaLarge ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                <XCircle className="w-4 h-4" /> Fail
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800">Large Text (≥ 3.0:1)</p>
          <p className="text-[11px] text-slate-400">Headings & text above 18pt</p>
        </div>

        {/* AAA Normal */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">WCAG AAA</span>
            {passAaaNormal ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                <XCircle className="w-4 h-4" /> Fail
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800">AAA Enhanced (≥ 7.0:1)</p>
          <p className="text-[11px] text-slate-400">Highest accessibility standard</p>
        </div>

        {/* UI Components */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">UI Controls</span>
            {passUi ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
                <XCircle className="w-4 h-4" /> Fail
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-800">UI Elements (≥ 3.0:1)</p>
          <p className="text-[11px] text-slate-400">Input borders, buttons, icons</p>
        </div>
      </div>

      {/* Live Sample Preview Mockup */}
      <div
        style={{ backgroundColor: bgColor, color: fgColor }}
        className="rounded-3xl p-8 border border-slate-200 shadow-sm transition-colors space-y-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest opacity-75">Live Visual Mockup</span>
          <button
            onClick={copySummary}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-current opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Ratio"}
          </button>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            The quick brown fox jumps over the lazy dog.
          </h3>
          <p className="mt-2 text-sm leading-relaxed max-w-2xl opacity-90">
            Good contrast makes user interfaces legible, accessible, and comfortable to read for all users, including individuals with low vision or color vision deficiencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            style={{ backgroundColor: fgColor, color: bgColor }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
          >
            Sample Solid Button
          </button>
          <button
            type="button"
            style={{ borderColor: fgColor }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold border"
          >
            Sample Outlined Button
          </button>
        </div>
      </div>
    </div>
  );
}
