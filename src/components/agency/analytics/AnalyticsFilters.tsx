"use client";

import React, { useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { AnalyticsExport } from "@/components/agency/analytics/AnalyticsExport";

/**
 * AnalyticsFilters — header controls.
 * - Workspace selector: shows the current workspace; multi-workspace switching
 *   is preview-only for now (the shell pattern is single-default-workspace).
 * - Date range: switches the growth chart data slice (7/30/90/365 points from
 *   the same labelled sample series). Custom is preview-disabled.
 * - Refresh: replays the loading skeleton (clearly a preview affordance).
 */

export type AnalyticsRange = "7d" | "30d" | "90d" | "12m" | "custom";

const RANGES: { key: AnalyticsRange; label: string; days: number }[] = [
  { key: "7d", label: "7 Days", days: 7 },
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
  { key: "12m", label: "12 Months", days: 365 },
  { key: "custom", label: "Custom", days: 0 },
];

export const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
  custom: 0,
};

export const RANGE_LABEL: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  custom: "Custom range",
};

export function AnalyticsFilters({
  workspaceName,
  range,
  onRangeChange,
  onRefresh,
  refreshing,
}: {
  workspaceName: string;
  range: AnalyticsRange;
  onRangeChange: (r: AnalyticsRange) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [wsOpen, setWsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Workspace selector (single workspace shell for now) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setWsOpen((v: boolean) => !v)}
          title="Workspace selector — additional workspaces will appear here"
          className="inline-flex items-center gap-2 rounded-xl border border-[#222838] bg-[#121520] px-3 py-2 text-xs font-bold text-[#e7eee9] hover:border-[#2b354d] transition-colors cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-[#3cff5f]" />
          {workspaceName}
          <ChevronDown className={`h-3 w-3 text-[#758195] transition-transform ${wsOpen ? "rotate-180" : ""}`} />
        </button>
        {wsOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setWsOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-[#23293a] bg-[#121520] p-2 shadow-2xl">
              <div className="flex items-center gap-2 rounded-xl bg-[#181d2a] px-2 py-2">
                <span className="h-2 w-2 rounded-full bg-[#3cff5f]" />
                <span className="text-xs font-bold text-white truncate">{workspaceName}</span>
                <span className="ml-auto text-[9px] font-black uppercase text-[#3cff5f]">current</span>
              </div>
              <p className="px-2 py-2 text-[10px] leading-relaxed text-[#5f6b82]">
                Preview shell — your plan's default workspace is shown. Multi-workspace
                switching arrives with real analytics wiring.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Date range segmented control */}
      <div className="inline-flex rounded-xl border border-[#222838] bg-[#121520] p-0.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onRangeChange(r.key)}
            title={r.key === "custom" ? "Custom range — preview only" : undefined}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
              range === r.key
                ? "bg-[#181d2a] text-white shadow-sm"
                : r.key === "custom"
                ? "text-[#758195] opacity-60 cursor-not-allowed"
                : "text-[#758195] hover:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-xl border border-[#222838] bg-[#121520] px-3 py-2 text-xs font-bold text-[#e7eee9] hover:border-[#2b354d] hover:text-white transition-colors cursor-pointer"
        title="Refresh (replays loading state in preview)"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-[#3cff5f] ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>

      <AnalyticsExport workspaceId="preview-workspace" />
    </div>
  );
}
