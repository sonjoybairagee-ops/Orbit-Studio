"use client";

import { useState, useMemo } from "react";
import {
  Receipt,
  Users,
  DollarSign,
  Percent,
  Copy,
  Check,
  Sparkles,
  Utensils,
  Minus,
  Plus,
  HelpCircle,
} from "lucide-react";

export default function TipCalculatorTool() {
  const [billAmount, setBillAmount] = useState<string>("75.50");
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [roundingMode, setRoundingMode] = useState<"none" | "round_tip" | "round_total">("none");
  const [copied, setCopied] = useState<boolean>(false);

  // Preset tips
  const PRESET_TIPS = [
    { label: "10%", value: 10, service: "Fair" },
    { label: "15%", value: 15, service: "Good" },
    { label: "18%", value: 18, service: "Great" },
    { label: "20%", value: 20, service: "Excellent" },
    { label: "25%", value: 25, service: "Exceptional" },
  ];

  const activeTipPercentage = isCustom ? parseFloat(customTip) || 0 : tipPercent;

  // Calculation
  const calculation = useMemo(() => {
    const rawBill = Math.max(0, parseFloat(billAmount) || 0);
    const people = Math.max(1, splitCount);

    let rawTip = (rawBill * activeTipPercentage) / 100;
    let totalBill = rawBill + rawTip;

    if (roundingMode === "round_tip") {
      rawTip = Math.ceil(rawTip);
      totalBill = rawBill + rawTip;
    } else if (roundingMode === "round_total") {
      totalBill = Math.ceil(totalBill);
      rawTip = Math.max(0, totalBill - rawBill);
    }

    const tipPerPerson = people > 0 ? rawTip / people : 0;
    const billPerPerson = people > 0 ? rawBill / people : 0;
    const totalPerPerson = people > 0 ? totalBill / people : 0;

    return {
      bill: rawBill,
      tipAmount: rawTip,
      totalBill,
      tipPerPerson,
      billPerPerson,
      totalPerPerson,
      people,
    };
  }, [billAmount, activeTipPercentage, splitCount, roundingMode]);

  const handleCopySplit = () => {
    const text = [
      `🧾 Bill Split Summary (${calculation.people} people):`,
      `• Bill Amount: $${calculation.bill.toFixed(2)}`,
      `• Tip (${activeTipPercentage}%): $${calculation.tipAmount.toFixed(2)}`,
      `• Total Bill: $${calculation.totalBill.toFixed(2)}`,
      `👉 Each Person Pays: $${calculation.totalPerPerson.toFixed(2)} (includes $${calculation.tipPerPerson.toFixed(2)} tip)`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Bill & Tip Details</h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Instant Split
            </span>
          </div>

          {/* Bill Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Bill Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">$</span>
              <input
                type="number"
                step="0.01"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-9 pr-4 text-2xl font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-mono"
              />
            </div>
          </div>

          {/* Tip Percentage Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Tip Percentage
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {activeTipPercentage}% Tip
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_TIPS.map((preset) => {
                const isSelected = !isCustom && tipPercent === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setTipPercent(preset.value);
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-sm">{preset.label}</span>
                    <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {preset.service}
                    </span>
                  </button>
                );
              })}

              {/* Custom % button */}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl border transition-all ${
                  isCustom
                    ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102 font-bold"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-sm">Custom</span>
                <span className={`text-[10px] ${isCustom ? "text-emerald-100" : "text-slate-400"}`}>
                  Enter %
                </span>
              </button>
            </div>

            {isCustom && (
              <div className="relative pt-1">
                <input
                  type="number"
                  step="0.5"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Enter custom tip %"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            )}
          </div>

          {/* Number of People Splitting */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Split Bill Between
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="font-mono text-xl font-extrabold text-slate-900">
                  {splitCount}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {splitCount === 1 ? "Person" : "People"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSplitCount(splitCount + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rounding Options */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Clean Rounding Options
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRoundingMode("none")}
                className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all ${
                  roundingMode === "none"
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Exact Cents
              </button>
              <button
                type="button"
                onClick={() => setRoundingMode("round_tip")}
                className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all ${
                  roundingMode === "round_tip"
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Round Up Tip
              </button>
              <button
                type="button"
                onClick={() => setRoundingMode("round_total")}
                className={`py-2 px-2.5 rounded-xl border text-center font-semibold transition-all ${
                  roundingMode === "round_total"
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Round Up Total
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Per Person
            </span>
            <button
              type="button"
              onClick={handleCopySplit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Split"}
            </button>
          </div>

          {/* Big Per-Person Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center shadow-lg shadow-emerald-600/20">
            <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-1">
              Each Person Pays ({calculation.people} Way Split)
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight">
              ${calculation.totalPerPerson.toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-emerald-100/90 font-medium">
              (${calculation.billPerPerson.toFixed(2)} bill + ${calculation.tipPerPerson.toFixed(2)} tip)
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Subtotal Bill:</span>
              <span className="font-mono font-semibold text-slate-900">
                ${calculation.bill.toFixed(2)}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-emerald-700 font-bold">Total Tip ({activeTipPercentage}%):</span>
              <span className="font-mono font-bold text-emerald-700">
                ${calculation.tipAmount.toFixed(2)}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-900 font-bold">Total Bill with Tip:</span>
              <span className="font-mono font-extrabold text-slate-900">
                ${calculation.totalBill.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tipping Guidelines Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-emerald-600" />
          Standard US & Global Tipping Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="font-bold text-slate-900">🍽️ Sit-down Dining</div>
            <p className="mt-1 text-emerald-700 font-bold font-mono">15% - 22%</p>
            <p className="mt-1 text-slate-500 leading-relaxed">
              15% for standard service, 18-20% for great service, 22%+ for exceptional fine dining.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="font-bold text-slate-900">🛵 Food Delivery</div>
            <p className="mt-1 text-emerald-700 font-bold font-mono">15% - 20% or $3-$5</p>
            <p className="mt-1 text-slate-500 leading-relaxed">
              DoorDash/UberEats drivers: $3-$5 minimum or 15-20% on larger orders or bad weather.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="font-bold text-slate-900">🍸 Bar & Bartenders</div>
            <p className="mt-1 text-emerald-700 font-bold font-mono">$1-$2 / drink or 20%</p>
            <p className="mt-1 text-slate-500 leading-relaxed">
              $1 per beer/wine, $2 per craft cocktail, or 20% of total bar tab at the end of the night.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="font-bold text-slate-900">🚗 Rideshare & Taxis</div>
            <p className="mt-1 text-emerald-700 font-bold font-mono">10% - 15%</p>
            <p className="mt-1 text-slate-500 leading-relaxed">
              Uber, Lyft, and taxis: 10-15% of fare, extra $2-$5 if driver helps with heavy luggage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
