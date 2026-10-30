"use client";

import { useState, useMemo } from "react";
import {
  Briefcase,
  Clock,
  DollarSign,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Percent,
  Sliders,
  Calendar,
} from "lucide-react";

interface DayEntry {
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakMins: number;
}

const DEFAULT_DAYS: DayEntry[] = [
  { dayName: "Monday", enabled: true, startTime: "09:00", endTime: "17:30", breakMins: 30 },
  { dayName: "Tuesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMins: 30 },
  { dayName: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMins: 30 },
  { dayName: "Thursday", enabled: true, startTime: "09:00", endTime: "17:30", breakMins: 30 },
  { dayName: "Friday", enabled: true, startTime: "09:00", endTime: "17:00", breakMins: 30 },
  { dayName: "Saturday", enabled: false, startTime: "09:00", endTime: "13:00", breakMins: 0 },
  { dayName: "Sunday", enabled: false, startTime: "09:00", endTime: "13:00", breakMins: 0 },
];

export default function WorkHoursCalculatorTool() {
  const [days, setDays] = useState<DayEntry[]>(DEFAULT_DAYS);
  const [hourlyWage, setHourlyWage] = useState<string>("25.00");
  const [overtimeRule, setOvertimeRule] = useState<"weekly_40" | "daily_8">("weekly_40");
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<string>("1.5");
  const [taxPercent, setTaxPercent] = useState<string>("15");
  const [includeTax, setIncludeTax] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Update a single day's property
  const handleUpdateDay = (index: number, updates: Partial<DayEntry>) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  // Preset quick fills
  const handleFillStandard9To5 = () => {
    setDays(
      DEFAULT_DAYS.map((d, i) =>
        i < 5
          ? { ...d, enabled: true, startTime: "09:00", endTime: "17:00", breakMins: 30 }
          : { ...d, enabled: false }
      )
    );
  };

  const handleFill40HourWeek = () => {
    setDays(
      DEFAULT_DAYS.map((d, i) =>
        i < 5
          ? { ...d, enabled: true, startTime: "08:30", endTime: "17:00", breakMins: 30 }
          : { ...d, enabled: false }
      )
    );
  };

  const handleClearAll = () => {
    setDays(
      DEFAULT_DAYS.map((d) => ({
        ...d,
        enabled: false,
        startTime: "09:00",
        endTime: "17:00",
        breakMins: 0,
      }))
    );
  };

  // Calculations
  const calculatedDays = useMemo(() => {
    return days.map((day) => {
      if (!day.enabled) {
        return {
          ...day,
          grossMinutes: 0,
          netMinutes: 0,
          netHours: 0,
          regularHours: 0,
          overtimeHours: 0,
        };
      }

      const [startH, startM] = day.startTime.split(":").map(Number);
      const [endH, endM] = day.endTime.split(":").map(Number);

      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;

      // Handle overnight shift (e.g. 10:00 PM to 06:00 AM)
      if (endTotal < startTotal) {
        endTotal += 24 * 60;
      }

      const grossMinutes = Math.max(0, endTotal - startTotal);
      const netMinutes = Math.max(0, grossMinutes - (day.breakMins || 0));
      const netHours = netMinutes / 60;

      let regularHours = netHours;
      let overtimeHours = 0;

      if (overtimeRule === "daily_8") {
        if (netHours > 8) {
          regularHours = 8;
          overtimeHours = netHours - 8;
        }
      }

      return {
        ...day,
        grossMinutes,
        netMinutes,
        netHours,
        regularHours,
        overtimeHours,
      };
    });
  }, [days, overtimeRule]);

  // Overall totals
  const summary = useMemo(() => {
    const totalNetHours = calculatedDays.reduce((acc, d) => acc + d.netHours, 0);
    const wage = parseFloat(hourlyWage) || 0;
    const otMult = parseFloat(overtimeMultiplier) || 1.5;
    const taxRate = parseFloat(taxPercent) || 0;

    let regularHours = 0;
    let overtimeHours = 0;

    if (overtimeRule === "daily_8") {
      regularHours = calculatedDays.reduce((acc, d) => acc + d.regularHours, 0);
      overtimeHours = calculatedDays.reduce((acc, d) => acc + d.overtimeHours, 0);
    } else {
      // Weekly over 40
      if (totalNetHours > 40) {
        regularHours = 40;
        overtimeHours = totalNetHours - 40;
      } else {
        regularHours = totalNetHours;
        overtimeHours = 0;
      }
    }

    const regularPay = regularHours * wage;
    const overtimePay = overtimeHours * (wage * otMult);
    const grossPay = regularPay + overtimePay;

    const estimatedTaxDeduction = includeTax ? (grossPay * taxRate) / 100 : 0;
    const netTakeHome = Math.max(0, grossPay - estimatedTaxDeduction);

    return {
      totalNetHours,
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay,
      estimatedTaxDeduction,
      netTakeHome,
      wage,
    };
  }, [calculatedDays, hourlyWage, overtimeRule, overtimeMultiplier, taxPercent, includeTax]);

  // Export to CSV
  const handleExportCsv = () => {
    const header = "Day,Status,Start Time,End Time,Unpaid Break (mins),Net Hours\n";
    const rows = calculatedDays
      .map(
        (d) =>
          `${d.dayName},${d.enabled ? "Worked" : "Off"},${d.startTime},${d.endTime},${
            d.breakMins
          },${d.netHours.toFixed(2)}`
      )
      .join("\n");

    const totals = `\nTotal Hours,${summary.totalNetHours.toFixed(
      2
    )}\nRegular Hours,${summary.regularHours.toFixed(
      2
    )}\nOvertime Hours,${summary.overtimeHours.toFixed(
      2
    )}\nGross Earnings,$${summary.grossPay.toFixed(2)}`;

    const blob = new Blob([header + rows + totals], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timesheet_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy text timesheet report
  const handleCopyReport = () => {
    const lines = [
      `📋 Timesheet Report (${summary.totalNetHours.toFixed(2)} Total Hours)`,
      "------------------------------------------",
      ...calculatedDays.map((d) =>
        d.enabled
          ? `• ${d.dayName}: ${d.startTime} - ${d.endTime} (${d.breakMins}m break) = ${d.netHours.toFixed(2)} hrs`
          : `• ${d.dayName}: Off`
      ),
      "------------------------------------------",
      `Regular Hours: ${summary.regularHours.toFixed(2)} hrs ($${summary.regularPay.toFixed(2)})`,
      `Overtime Hours: ${summary.overtimeHours.toFixed(2)} hrs ($${summary.overtimePay.toFixed(2)})`,
      `Total Gross Pay: $${summary.grossPay.toFixed(2)}`,
      includeTax ? `Estimated Net Pay: $${summary.netTakeHome.toFixed(2)}` : "",
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Configuration & Wage Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Timesheet & Work Hours Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Track weekly punch times, deduct unpaid lunches, and calculate regular vs. overtime wages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFillStandard9To5}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Fill 9-5 Mon-Fri
            </button>
            <button
              type="button"
              onClick={handleFill40HourWeek}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Fill 40hr Week
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Rates & Overtime Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Hourly Wage ($/hr)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.5"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Overtime Threshold
            </label>
            <select
              value={overtimeRule}
              onChange={(e) => setOvertimeRule(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="weekly_40">Weekly (Over 40 hrs/wk)</option>
              <option value="daily_8">Daily (Over 8 hrs/day)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Overtime Multiplier
            </label>
            <select
              value={overtimeMultiplier}
              onChange={(e) => setOvertimeMultiplier(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              <option value="1.5">1.5x (Time & a half)</option>
              <option value="2.0">2.0x (Double time)</option>
              <option value="1.25">1.25x</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tax Deduction Est.
              </label>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Apply
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                disabled={!includeTax}
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Hours</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {summary.totalNetHours.toFixed(2)}{" "}
            <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Reg: {summary.regularHours.toFixed(1)}h | OT: {summary.overtimeHours.toFixed(1)}h
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Regular Pay</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ${summary.regularPay.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.regularHours.toFixed(2)} hrs @ ${summary.wage}/hr
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Overtime Pay</span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">
            ${summary.overtimePay.toFixed(2)}
          </div>
          <div className="text-xs text-amber-700/80 mt-1">
            {summary.overtimeHours.toFixed(2)} hrs @ ${(summary.wage * parseFloat(overtimeMultiplier)).toFixed(2)}/hr
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {includeTax ? "Estimated Net Pay" : "Total Gross Pay"}
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            ${includeTax ? summary.netTakeHome.toFixed(2) : summary.grossPay.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-800/80 mt-1">
            {includeTax
              ? `Gross: $${summary.grossPay.toFixed(2)} (-${taxPercent}%)`
              : "Before taxes & deductions"}
          </div>
        </div>
      </div>

      {/* Daily Timesheet Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Weekly Shift Breakdown</h3>
            <p className="text-xs text-slate-500">Configure start and end timestamps for each day.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Report"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Day</th>
                <th className="py-3.5 px-3">Start Time</th>
                <th className="py-3.5 px-3">End Time</th>
                <th className="py-3.5 px-3">Break (Mins)</th>
                <th className="py-3.5 px-4 text-right">Net Hours</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Day Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {calculatedDays.map((day, idx) => {
                const dayPay = day.netHours * (parseFloat(hourlyWage) || 0);
                return (
                  <tr
                    key={day.dayName}
                    className={`transition-colors ${
                      day.enabled ? "hover:bg-slate-50/60" : "bg-slate-50/40 opacity-60"
                    }`}
                  >
                    {/* Day / Checkbox */}
                    <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => handleUpdateDay(idx, { enabled: e.target.checked })}
                          className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className={day.enabled ? "text-slate-900" : "text-slate-400"}>
                          {day.dayName}
                        </span>
                      </label>
                    </td>

                    {/* Start Time */}
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={!day.enabled}
                        value={day.startTime}
                        onChange={(e) => handleUpdateDay(idx, { startTime: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>

                    {/* End Time */}
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={!day.enabled}
                        value={day.endTime}
                        onChange={(e) => handleUpdateDay(idx, { endTime: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </td>

                    {/* Break (mins) */}
                    <td className="py-3 px-3">
                      <select
                        disabled={!day.enabled}
                        value={day.breakMins}
                        onChange={(e) =>
                          handleUpdateDay(idx, { breakMins: parseInt(e.target.value) || 0 })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value={0}>0 min</option>
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                      </select>
                    </td>

                    {/* Net Hours */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {day.enabled ? `${day.netHours.toFixed(2)} h` : "—"}
                    </td>

                    {/* Day Earnings */}
                    <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700">
                      {day.enabled ? `$${dayPay.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/70 border-t-2 border-slate-200 font-bold text-slate-900">
                <td className="py-3.5 px-4 sm:px-6">Weekly Total</td>
                <td colSpan={3}></td>
                <td className="py-3.5 px-4 text-right font-mono text-base text-slate-900">
                  {summary.totalNetHours.toFixed(2)} h
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-base text-emerald-700">
                  ${summary.grossPay.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
