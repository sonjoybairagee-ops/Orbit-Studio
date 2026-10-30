"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, Copy, Check, Briefcase } from "lucide-react";

interface TimeRow {
  id: string;
  hours: number;
  minutes: number;
  seconds: number;
  operation: "add" | "subtract";
}

export default function TimeDurationCalculatorTool() {
  const [activeTab, setActiveTab] = useState<"diff" | "adder">("diff");

  // Mode 1: Start to End clock
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:30");
  const [breakMins, setBreakMins] = useState<number>(30);
  const [hourlyRate, setHourlyRate] = useState<string>("25");

  // Mode 2: Multi-row adder
  const [rows, setRows] = useState<TimeRow[]>([
    { id: "1", hours: 2, minutes: 45, seconds: 0, operation: "add" },
    { id: "2", hours: 1, minutes: 30, seconds: 0, operation: "add" },
  ]);

  const [copied, setCopied] = useState<string>("");

  // Mode 1 Calculation
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let startTotalMins = startH * 60 + startM;
  let endTotalMins = endH * 60 + endM;

  if (endTotalMins < startTotalMins) {
    // Overnight shift (e.g. 10 PM to 6 AM)
    endTotalMins += 24 * 60;
  }

  const grossMins = Math.max(0, endTotalMins - startTotalMins);
  const netMins = Math.max(0, grossMins - (breakMins || 0));

  const diffHours = Math.floor(netMins / 60);
  const diffRemainingMins = netMins % 60;
  const decimalHours = (netMins / 60).toFixed(2);
  const rate = parseFloat(hourlyRate) || 0;
  const earnings = (parseFloat(decimalHours) * rate).toFixed(2);

  // Mode 2 Calculation
  let totalAdderSeconds = 0;
  rows.forEach((r) => {
    const sec = (r.hours * 3600) + (r.minutes * 60) + r.seconds;
    if (r.operation === "add") totalAdderSeconds += sec;
    else totalAdderSeconds -= sec;
  });
  totalAdderSeconds = Math.max(0, totalAdderSeconds);

  const addH = Math.floor(totalAdderSeconds / 3600);
  const addM = Math.floor((totalAdderSeconds % 3600) / 60);
  const addS = totalAdderSeconds % 60;
  const addDecimal = (totalAdderSeconds / 3600).toFixed(2);

  const addRow = () => {
    setRows([
      ...rows,
      { id: Math.random().toString(36).substring(7), hours: 1, minutes: 0, seconds: 0, operation: "add" },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const copyVal = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("diff")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "diff" ? "bg-white text-sky-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Clock Time Difference & Timesheet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("adder")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "adder" ? "bg-white text-sky-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Add & Subtract Time Durations
          </button>
        </div>
      </div>

      {/* Tab 1: Clock Time Difference */}
      {activeTab === "diff" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Unpaid Break (Minutes)</label>
              <input
                type="number"
                min="0"
                value={breakMins}
                onChange={(e) => setBreakMins(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Hourly Rate ($)</label>
              <input
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="25"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:outline-sky-500"
              />
            </div>
          </div>

          {/* Results Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            <div className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-800 font-bold uppercase tracking-wider mb-1">Total Net Time</p>
                <p className="text-2xl sm:text-3xl font-black text-sky-950 font-mono">
                  {diffHours}h {diffRemainingMins}m
                </p>
              </div>
              <button
                onClick={() => copyVal("net", `${diffHours}h ${diffRemainingMins}m`)}
                className="p-2 text-sky-700 hover:bg-sky-100 rounded-xl transition-colors"
              >
                {copied === "net" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Decimal Hours</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                  {decimalHours} <span className="text-sm font-bold">hrs</span>
                </p>
              </div>
              <button
                onClick={() => copyVal("dec", decimalHours)}
                className="p-2 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors"
              >
                {copied === "dec" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">Total Pay</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                  ${earnings}
                </p>
              </div>
              <button
                onClick={() => copyVal("pay", `$${earnings}`)}
                className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                {copied === "pay" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-row adder */}
      {activeTab === "adder" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div key={row.id} className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <select
                  value={row.operation}
                  onChange={(e) => {
                    const val = e.target.value as "add" | "subtract";
                    setRows(rows.map((r) => (r.id === row.id ? { ...r, operation: val } : r)));
                  }}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 text-slate-800 focus:outline-sky-500"
                >
                  <option value="add">+ Add</option>
                  <option value="subtract">- Subtract</option>
                </select>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <input
                    type="number"
                    min="0"
                    value={row.hours}
                    onChange={(e) => {
                      const h = Math.max(0, parseInt(e.target.value) || 0);
                      setRows(rows.map((r) => (r.id === row.id ? { ...r, hours: h } : r)));
                    }}
                    className="w-16 bg-white border border-slate-200 rounded-xl p-2 text-center font-bold"
                  />
                  <span>hrs</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={row.minutes}
                    onChange={(e) => {
                      const m = Math.max(0, parseInt(e.target.value) || 0);
                      setRows(rows.map((r) => (r.id === row.id ? { ...r, minutes: m } : r)));
                    }}
                    className="w-16 bg-white border border-slate-200 rounded-xl p-2 text-center font-bold"
                  />
                  <span>mins</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={row.seconds}
                    onChange={(e) => {
                      const s = Math.max(0, parseInt(e.target.value) || 0);
                      setRows(rows.map((r) => (r.id === row.id ? { ...r, seconds: s } : r)));
                    }}
                    className="w-16 bg-white border border-slate-200 rounded-xl p-2 text-center font-bold"
                  />
                  <span>secs</span>
                </div>

                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(row.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              onClick={addRow}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 px-4 py-2 rounded-xl border border-sky-200 hover:bg-sky-50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Duration Row
            </button>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Total Calculated Time</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {addH}h {addM}m {addS}s <span className="text-xs font-semibold text-slate-500">({addDecimal} hrs)</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
