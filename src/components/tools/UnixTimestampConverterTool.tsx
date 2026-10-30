"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Copy,
  Check,
  Pause,
  Play,
  RotateCcw,
  Calendar,
  Globe2,
  ArrowRight,
  Sparkles,
  History,
} from "lucide-react";

export default function UnixTimestampConverterTool() {
  // Live ticking counter
  const [liveSec, setLiveSec] = useState<number>(1700000000);
  const [liveMs, setLiveMs] = useState<number>(1700000000000);
  const [isTicking, setIsTicking] = useState<boolean>(true);

  // Mode 1: Timestamp to Date
  const [inputTs, setInputTs] = useState<string>("1761800000");

  // Mode 2: Date to Timestamp
  const [inputDate, setInputDate] = useState<string>("2026-10-30");
  const [inputTime, setInputTime] = useState<string>("12:00:00");
  const [dateTzMode, setDateTzMode] = useState<"local" | "utc">("utc");

  const [copiedKey, setCopiedKey] = useState<string>("");

  // Initialize and tick live counter in useEffect
  useEffect(() => {
    try {
      const now = Date.now();
      setLiveSec(Math.floor(now / 1000));
      setLiveMs(now);
      setInputTs(Math.floor(now / 1000).toString());

      const d = new Date(now);
      setInputDate(d.toISOString().split("T")[0]);
      setInputTime(d.toISOString().split("T")[1].slice(0, 8));
    } catch {}

    const interval = setInterval(() => {
      if (isTicking) {
        const now = Date.now();
        setLiveSec(Math.floor(now / 1000));
        setLiveMs(now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTicking]);

  // Mode 1: Parse input timestamp
  const timestampConversion = useMemo(() => {
    const raw = inputTs.trim();
    if (!raw) return null;

    let num = Number(raw);
    if (isNaN(num)) return null;

    // Detect if seconds (10 digits or less) vs milliseconds (13 digits) vs microseconds/nanoseconds
    let ms = num;
    let unit: "seconds" | "milliseconds" | "microseconds" = "seconds";

    if (raw.length <= 10) {
      ms = num * 1000;
      unit = "seconds";
    } else if (raw.length <= 13) {
      ms = num;
      unit = "milliseconds";
    } else if (raw.length <= 16) {
      ms = Math.floor(num / 1000);
      unit = "microseconds";
    }

    const dateObj = new Date(ms);
    if (isNaN(dateObj.getTime())) return null;

    // Relative time description
    const diffSec = Math.floor((ms - liveMs) / 1000);
    let relativeStr = "";
    const absDiff = Math.abs(diffSec);

    if (absDiff < 5) {
      relativeStr = "Just now";
    } else if (absDiff < 60) {
      relativeStr = `${absDiff} seconds ${diffSec > 0 ? "from now" : "ago"}`;
    } else if (absDiff < 3600) {
      const mins = Math.floor(absDiff / 60);
      relativeStr = `${mins} minute${mins > 1 ? "s" : ""} ${diffSec > 0 ? "from now" : "ago"}`;
    } else if (absDiff < 86400) {
      const hrs = Math.floor(absDiff / 3600);
      relativeStr = `${hrs} hour${hrs > 1 ? "s" : ""} ${diffSec > 0 ? "from now" : "ago"}`;
    } else {
      const days = Math.floor(absDiff / 86400);
      relativeStr = `${days} day${days > 1 ? "s" : ""} ${diffSec > 0 ? "from now" : "ago"}`;
    }

    const startOfYear = new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 1));
    const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / 86400000) + 1;

    return {
      dateObj,
      unit,
      utcString: dateObj.toUTCString(),
      localString: dateObj.toString(),
      isoString: dateObj.toISOString(),
      relativeStr,
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
      year: dateObj.getUTCFullYear(),
      month: dateObj.getUTCMonth() + 1,
      day: dateObj.getUTCDate(),
      dayOfYear,
      isLeapYear: (dateObj.getUTCFullYear() % 4 === 0 && dateObj.getUTCFullYear() % 100 !== 0) || dateObj.getUTCFullYear() % 400 === 0,
    };
  }, [inputTs, liveMs]);

  // Mode 2: Parse Date into Timestamp
  const dateConversion = useMemo(() => {
    try {
      let isoStr = `${inputDate}T${inputTime}`;
      if (dateTzMode === "utc") {
        isoStr += "Z";
      }
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return null;

      const ms = d.getTime();
      const sec = Math.floor(ms / 1000);

      return {
        seconds: sec,
        milliseconds: ms,
        utcString: d.toUTCString(),
        localString: d.toString(),
      };
    } catch {
      return null;
    }
  }, [inputDate, inputTime, dateTzMode]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // Add/Subtract Offset to input timestamp
  const applyOffset = (seconds: number) => {
    const current = Number(inputTs) || liveSec;
    setInputTs((current + seconds).toString());
  };

  return (
    <div className="space-y-8">
      {/* Live Ticking Unix Epoch Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Unix Timestamp (Epoch)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {liveSec}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  .{liveMs.toString().slice(-3)} ms
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTicking(!isTicking)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isTicking ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isTicking ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => handleCopy(liveSec.toString(), "live")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              {copiedKey === "live" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === "live" ? "Copied!" : "Copy Timestamp"}
            </button>
          </div>
        </div>

        {/* Quick math offsets */}
        <div className="pt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Quick Offsets:</span>
          <button
            type="button"
            onClick={() => applyOffset(3600)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200"
          >
            +1 Hour
          </button>
          <button
            type="button"
            onClick={() => applyOffset(86400)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200"
          >
            +1 Day
          </button>
          <button
            type="button"
            onClick={() => applyOffset(604800)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200"
          >
            +1 Week
          </button>
          <button
            type="button"
            onClick={() => applyOffset(2592000)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200"
          >
            +30 Days
          </button>
          <button
            type="button"
            onClick={() => setInputTs(liveSec.toString())}
            className="rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 font-semibold hover:bg-amber-100"
          >
            Reset to Now
          </button>
        </div>
      </div>

      {/* Dual Converter Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Panel 1: Timestamp to Date */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Mode 1
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Unix Timestamp → Human Date
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Enter Timestamp (Seconds or Milliseconds)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputTs}
                onChange={(e) => setInputTs(e.target.value)}
                placeholder="e.g. 1761800000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 px-4 font-mono text-lg font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            {timestampConversion && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Detected format: <strong>{timestampConversion.unit}</strong> ({timestampConversion.relativeStr})
              </span>
            )}
          </div>

          {timestampConversion ? (
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-semibold">GMT / UTC:</span>
                <span className="font-mono font-bold text-slate-900 text-right">
                  {timestampConversion.utcString}
                </span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-semibold">Local Timezone:</span>
                <span className="font-mono font-bold text-slate-900 text-right">
                  {timestampConversion.localString}
                </span>
              </div>
              <div className="py-2.5 flex flex-col sm:flex-row justify-between gap-1">
                <span className="text-slate-500 font-semibold">ISO 8601:</span>
                <span className="font-mono font-bold text-blue-600 text-right">
                  {timestampConversion.isoString}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Relative Time:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {timestampConversion.relativeStr}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-semibold">Day of Year:</span>
                <span className="font-mono font-bold text-slate-800">
                  Day {timestampConversion.dayOfYear} of {timestampConversion.year} {timestampConversion.isLeapYear ? "(Leap Year)" : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-400">
              Please enter a valid numeric Unix timestamp.
            </div>
          )}
        </div>

        {/* Panel 2: Human Date to Timestamp */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Mode 2
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Human Date → Unix Timestamp
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Time (HH:MM:SS)
              </label>
              <input
                type="time"
                step="1"
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interpret In:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDateTzMode("utc")}
                className={`rounded-lg px-3 py-1 font-semibold ${
                  dateTzMode === "utc" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                UTC / GMT
              </button>
              <button
                type="button"
                onClick={() => setDateTzMode("local")}
                className={`rounded-lg px-3 py-1 font-semibold ${
                  dateTzMode === "local" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Local Timezone
              </button>
            </div>
          </div>

          {dateConversion ? (
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-5 space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Unix Timestamp (Seconds)
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-2xl font-black text-emerald-950">
                    {dateConversion.seconds}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(dateConversion.seconds.toString(), "sec")}
                    className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100"
                  >
                    {copiedKey === "sec" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Unix Timestamp (Milliseconds)
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-base font-bold text-emerald-900">
                    {dateConversion.milliseconds}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(dateConversion.milliseconds.toString(), "ms")}
                    className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100"
                  >
                    {copiedKey === "ms" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-400">
              Invalid date or time entered.
            </div>
          )}
        </div>
      </div>

      {/* Famous Milestones Reference Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-600" />
          Historic & Future Unix Epoch Milestones
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { label: "Unix Epoch Start", ts: 0, date: "Thu, 01 Jan 1970 00:00:00 GMT" },
            { label: "1 Billion Seconds", ts: 1000000000, date: "Sun, 09 Sep 2001 01:46:40 GMT" },
            { label: "1,234,567,890 Sequential", ts: 1234567890, date: "Fri, 13 Feb 2009 23:31:30 GMT" },
            { label: "1.5 Billion Seconds", ts: 1500000000, date: "Fri, 14 Jul 2017 02:40:00 GMT" },
            { label: "2 Billion Seconds", ts: 2000000000, date: "Wed, 18 May 2033 03:33:20 GMT" },
            { label: "Year 2038 32-bit Limit", ts: 2147483647, date: "Tue, 19 Jan 2038 03:14:07 GMT" },
          ].map((m) => (
            <div
              key={m.label}
              onClick={() => setInputTs(m.ts.toString())}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{m.label}</span>
                <span className="font-mono text-blue-600 font-bold">{m.ts}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">{m.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
