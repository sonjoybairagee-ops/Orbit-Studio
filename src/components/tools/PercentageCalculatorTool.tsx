"use client";

import { useState } from "react";
import { Percent, Copy, Check, ArrowRight, RotateCcw } from "lucide-react";

export default function PercentageCalculatorTool() {
  // Mode 1: What is X% of Y?
  const [val1P, setVal1P] = useState<string>("15");
  const [val1Total, setVal1Total] = useState<string>("250");

  // Mode 2: X is what % of Y?
  const [val2Part, setVal2Part] = useState<string>("35");
  const [val2Total, setVal2Total] = useState<string>("140");

  // Mode 3: % Change from X to Y
  const [val3From, setVal3From] = useState<string>("80");
  const [val3To, setVal3To] = useState<string>("120");

  // Mode 4: Add/Subtract X% to Y (Discount/Tax)
  const [val4Base, setVal4Base] = useState<string>("199.99");
  const [val4Percent, setVal4Percent] = useState<string>("20");
  const [val4Op, setVal4Op] = useState<"add" | "subtract">("subtract");

  const [copiedKey, setCopiedKey] = useState<string>("");

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // Calculations
  const p1 = parseFloat(val1P) || 0;
  const t1 = parseFloat(val1Total) || 0;
  const res1 = ((p1 / 100) * t1).toFixed(2);

  const part2 = parseFloat(val2Part) || 0;
  const t2 = parseFloat(val2Total) || 0;
  const res2 = t2 !== 0 ? ((part2 / t2) * 100).toFixed(2) : "0.00";

  const f3 = parseFloat(val3From) || 0;
  const to3 = parseFloat(val3To) || 0;
  const change3 = f3 !== 0 ? (((to3 - f3) / Math.abs(f3)) * 100).toFixed(2) : "0.00";
  const isIncrease = parseFloat(change3) >= 0;

  const base4 = parseFloat(val4Base) || 0;
  const p4 = parseFloat(val4Percent) || 0;
  const delta4 = (base4 * (p4 / 100));
  const res4 = val4Op === "add" ? (base4 + delta4).toFixed(2) : (base4 - delta4).toFixed(2);

  return (
    <div className="space-y-6">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: What is X% of Y? */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Percentage of Value
            </span>
            <span className="text-xs text-slate-400 font-mono">Formula: (P / 100) × Total</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
            <span>What is</span>
            <div className="relative w-24">
              <input
                type="number"
                value={val1P}
                onChange={(e) => setVal1P(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-emerald-500"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
            </div>
            <span>of</span>
            <input
              type="number"
              value={val1Total}
              onChange={(e) => setVal1Total(e.target.value)}
              className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-emerald-500"
            />
            <span>?</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-800 font-medium">Result</p>
              <p className="text-2xl font-black text-emerald-900 font-mono">{res1}</p>
            </div>
            <button
              onClick={() => copyVal("c1", res1)}
              className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
              title="Copy result"
            >
              {copiedKey === "c1" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-blue-300 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Percentage Ratio
            </span>
            <span className="text-xs text-slate-400 font-mono">Formula: (Part / Total) × 100</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              type="number"
              value={val2Part}
              onChange={(e) => setVal2Part(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-blue-500"
            />
            <span>is what % of</span>
            <input
              type="number"
              value={val2Total}
              onChange={(e) => setVal2Total(e.target.value)}
              className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-blue-500"
            />
            <span>?</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-800 font-medium">Result</p>
              <p className="text-2xl font-black text-blue-900 font-mono">{res2}%</p>
            </div>
            <button
              onClick={() => copyVal("c2", `${res2}%`)}
              className="p-2 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
              title="Copy result"
            >
              {copiedKey === "c2" ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 3: % Increase / Decrease */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-violet-300 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
              Percentage Change
            </span>
            <span className="text-xs text-slate-400 font-mono">Formula: ((To - From) / From) × 100</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
            <span>From</span>
            <input
              type="number"
              value={val3From}
              onChange={(e) => setVal3From(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-violet-500"
            />
            <span>to</span>
            <input
              type="number"
              value={val3To}
              onChange={(e) => setVal3To(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-violet-500"
            />
          </div>

          <div className="bg-violet-50/70 border border-violet-200/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-violet-800 font-medium">
                {isIncrease ? "Percentage Increase" : "Percentage Decrease"}
              </p>
              <p className={`text-2xl font-black font-mono ${isIncrease ? "text-emerald-700" : "text-rose-600"}`}>
                {isIncrease ? `+${change3}%` : `${change3}%`}
              </p>
            </div>
            <button
              onClick={() => copyVal("c3", `${change3}%`)}
              className="p-2 text-violet-700 hover:bg-violet-100 rounded-xl transition-colors"
              title="Copy result"
            >
              {copiedKey === "c3" ? <Check className="w-4 h-4 text-violet-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 4: Add / Subtract Percentage (Discount/Tax) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-amber-300 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Discount & Tax Calculator
            </span>
            <span className="text-xs text-slate-400 font-mono">Add or Subtract %</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              type="number"
              value={val4Base}
              onChange={(e) => setVal4Base(e.target.value)}
              placeholder="Base"
              className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-amber-500"
            />
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setVal4Op("subtract")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  val4Op === "subtract" ? "bg-white text-rose-600 shadow-xs" : "text-slate-500"
                }`}
              >
                - (Off)
              </button>
              <button
                type="button"
                onClick={() => setVal4Op("add")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  val4Op === "add" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500"
                }`}
              >
                + (Tax)
              </button>
            </div>
            <div className="relative w-20">
              <input
                type="number"
                value={val4Percent}
                onChange={(e) => setVal4Percent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-amber-500"
              />
              <span className="absolute right-2 top-2 text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-800 font-medium">
                Final Amount ({val4Op === "subtract" ? `Save $${delta4.toFixed(2)}` : `Tax $${delta4.toFixed(2)}`})
              </p>
              <p className="text-2xl font-black text-amber-900 font-mono">${res4}</p>
            </div>
            <button
              onClick={() => copyVal("c4", `$${res4}`)}
              className="p-2 text-amber-700 hover:bg-amber-100 rounded-xl transition-colors"
              title="Copy result"
            >
              {copiedKey === "c4" ? <Check className="w-4 h-4 text-amber-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
