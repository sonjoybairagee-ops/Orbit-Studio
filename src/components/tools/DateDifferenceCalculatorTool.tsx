"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Briefcase, ArrowRight, Check, Copy } from "lucide-react";

export default function DateDifferenceCalculatorTool() {
  const [startDate, setStartDate] = useState<string>("2026-01-01");
  const [endDate, setEndDate] = useState<string>("2026-02-01");
  const [includeEndDay, setIncludeEndDay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const today = new Date();
      const todayFormatted = today.toISOString().split("T")[0];
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      setStartDate(todayFormatted);
      setEndDate(nextMonth);
    } catch {}
  }, []);

  // Compute differences
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isValid = !isNaN(start.getTime()) && !isNaN(end.getTime());

  let totalDays = 0;
  let workdays = 0;
  let weekends = 0;
  let yDiff = 0;
  let mDiff = 0;
  let dDiff = 0;

  if (isValid) {
    const d1 = start < end ? start : end;
    const d2 = start < end ? end : start;

    const diffMs = d2.getTime() - d1.getTime();
    totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + (includeEndDay ? 1 : 0);

    // Business Days loop
    const cur = new Date(d1);
    const limit = new Date(d2);
    if (includeEndDay) limit.setDate(limit.getDate() + 1);

    while (cur < limit) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      } else {
        workdays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Years, Months, Days breakdown
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate() + (includeEndDay ? 1 : 0);

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    yDiff = Math.max(0, years);
    mDiff = Math.max(0, months);
    dDiff = Math.max(0, days);
  }

  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const hours = totalDays * 24;
  const minutes = hours * 60;

  const copySummary = () => {
    const summary = `${totalDays} days (${yDiff} years, ${mDiff} months, ${dDiff} days) • ${workdays} workdays`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Date Pickers Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:outline-blue-500"
            />
          </div>
        </div>

        {/* Options & Quick presets */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeEndDay}
              onChange={(e) => setIncludeEndDay(e.target.checked)}
              className="rounded accent-blue-600"
            />
            Include end date in calculation (+1 day)
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "+7 Days", days: 7 },
              { label: "+30 Days", days: 30 },
              { label: "+90 Days", days: 90 },
              { label: "+1 Year", days: 365 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const s = new Date(startDate);
                  s.setDate(s.getDate() + preset.days);
                  setEndDate(s.toISOString().split("T")[0]);
                }}
                className="text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Dashboard */}
      {isValid && (
        <div className="space-y-6">
          {/* Highlight Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-blue-200 mb-1">Total Duration</p>
              <h3 className="text-3xl sm:text-5xl font-black font-mono tracking-tight">
                {totalDays.toLocaleString()} <span className="text-xl sm:text-2xl font-bold font-sans">Days</span>
              </h3>
              <p className="text-sm text-blue-100 mt-2 font-medium">
                {yDiff > 0 ? `${yDiff} year${yDiff > 1 ? "s" : ""}, ` : ""}
                {mDiff > 0 ? `${mDiff} month${mDiff > 1 ? "s" : ""}, ` : ""}
                {dDiff} day{dDiff !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={copySummary}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xs font-semibold text-xs text-white border border-white/30 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Summary"}
            </button>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-xs text-slate-400 font-medium block mb-1">Weeks & Days</span>
              <span className="text-lg font-bold text-slate-800 font-mono">
                {weeks}w {remainingDays}d
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-xs text-slate-400 font-medium block mb-1">Working Days</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">{workdays} days</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-xs text-slate-400 font-medium block mb-1">Weekend Days</span>
              <span className="text-lg font-bold text-slate-600 font-mono">{weekends} days</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="text-xs text-slate-400 font-medium block mb-1">Total Hours</span>
              <span className="text-lg font-bold text-indigo-600 font-mono">{hours.toLocaleString()} hrs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
