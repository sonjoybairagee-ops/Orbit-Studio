"use client";

import React from "react";
import { ColumnChart, HorizontalBars } from "@/components/agency/analytics/AnalyticsCharts";
import {
  MOCK_PROJECT_COMPLETION_BY_MONTH,
  MOCK_PROJECT_PERFORMANCE,
  MOCK_PROJECT_STATUS_COUNTS,
  MOCK_SECTION_NOTE,
} from "@/lib/agency/analytics-mock";
import { formatBytes, formatDateShort } from "@/lib/agency/analytics-format";

/**
 * ProjectAnalytics — status mix, completion trend, per-project storage
 * consumption and the performance table. Sample-labelled values only.
 */

const STATUS_TILE_META: { key: keyof typeof MOCK_PROJECT_STATUS_COUNTS; label: string; color: string }[] = [
  { key: "in_progress", label: "In Progress", color: "#3cff5f" },
  { key: "client_review", label: "Client Review", color: "#f5a524" },
  { key: "delivered", label: "Delivered", color: "#4d6fff" },
  { key: "revision_required", label: "Revisions", color: "#ff5470" },
];

const STATUS_BADGE: Record<string, string> = {
  in_progress: "text-[#3cff5f] bg-[#12291a] border-[#1f3d28]",
  internal_review: "text-[#8bffaf] bg-[#12291a] border-[#1f3d28]",
  client_review: "text-[#f5a524] bg-[#2a2113] border-[#3d2f12]",
  approved: "text-[#4d6fff] bg-[#131a30] border-[#22305a]",
  delivered: "text-[#4d6fff] bg-[#131a30] border-[#22305a]",
  archived: "text-[#758195] bg-[#12141d] border-[#232838]",
  planning: "text-[#8d9ab2] bg-[#12141d] border-[#232838]",
  revision_required: "text-[#ff5470] bg-[#2a1418] border-[#3d1e25]",
};

const RECENT_KEYS = ["p1", "p2", "p3", "p6", "p5"] as const;

export function ProjectAnalytics() {
  const maxSize = Math.max(...MOCK_PROJECT_PERFORMANCE.map((p) => p.sizeBytes));
  const recent = RECENT_KEYS.map((id) => MOCK_PROJECT_PERFORMANCE.find((p) => p.id === id)!).filter(Boolean);

  return (
    <div className="space-y-3">
      {/* Status tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_TILE_META.map((t) => (
          <div
            key={t.key}
            className="rounded-2xl border border-[#222838] bg-[#121520] p-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#758195] truncate">
                {t.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-black text-white leading-none">
              {MOCK_PROJECT_STATUS_COUNTS[t.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Completion trend */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Project Completion
            </h3>
            <span className="text-[10px] text-[#5f6b82]">delivered per month (sample)</span>
          </div>
          <ColumnChart
            columns={MOCK_PROJECT_COMPLETION_BY_MONTH.map((m) => ({
              label: m.month,
              value: m.delivered,
            }))}
            valueSuffix=" delivered"
          />
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#1b2234] pt-3 text-center">
            {[
              { label: "Completed", value: 27, color: "text-[#4d6fff]" },
              { label: "In-flight", value: 21, color: "text-[#3cff5f]" },
              { label: "Overdue", value: 2, color: "text-[#ff5470]" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-[#5f6b82]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Storage consumption per project */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Project-wise Storage
            </h3>
            <span className="text-[10px] text-[#5f6b82]">sample set</span>
          </div>
          <HorizontalBars
            items={MOCK_PROJECT_PERFORMANCE.slice(0, 6).map((p) => ({
              label: p.name,
              sub: p.overdue ? "overdue" : undefined,
              valueLabel: formatBytes(p.sizeBytes),
              pct: (p.sizeBytes / maxSize) * 100,
              danger: p.overdue,
            }))}
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {/* Recent project activity */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Recent Project Activity
            </h3>
            <span className="text-[10px] text-[#5f6b82]">sample</span>
          </div>
          <div className="space-y-0">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-[#1b2234]/50 py-2.5 last:border-0">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: p.overdue ? "#ff5470" : "#3cff5f" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[#e7eee9]">{p.name}</p>
                  <p className="text-[10px] text-[#758195]">
                    {p.client} · {formatBytes(p.sizeBytes)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-[#5f6b82]">
                  {formatDateShort(p.lastActivity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Performance table */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Project Performance
            </h3>
            <span className="text-[10px] text-[#5f6b82]">sample set</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-[#1b2234]">
                  {["Project", "Status", "Storage", "Progress", "Updated"].map((h) => (
                    <th key={h} className="pb-2 text-[10px] font-bold uppercase tracking-wider text-[#5f6b82]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PROJECT_PERFORMANCE.map((p) => (
                  <tr key={p.id} className="border-b border-[#1b2234]/50 last:border-0 hover:bg-[#151b29] transition-colors">
                    <td className="py-2 pr-3 max-w-[170px]">
                      <p className="truncate text-[11px] font-semibold text-[#e7eee9]" title={`${p.name} · ${p.client}`}>
                        {p.name}
                        {p.overdue && <span className="ml-1.5 text-[9px] font-black text-[#ff5470]">OVERDUE</span>}
                      </p>
                      <p className="truncate text-[10px] text-[#758195]">{p.client}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold capitalize ${STATUS_BADGE[p.status] ?? ""}`}>
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-[#8d9ab2] whitespace-nowrap">
                      {formatBytes(p.sizeBytes)}
                    </td>
                    <td className="py-2 pr-3 w-24">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[#1b2234]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.progressPct}%`,
                              background: p.overdue ? "#ff5470" : "#3cff5f",
                              opacity: 0.85,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#8d9ab2]">
                          {p.progressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 font-mono text-[10px] text-[#758195] whitespace-nowrap">
                      {formatDateShort(p.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="text-center text-[9px] text-[#4a5468]">{MOCK_SECTION_NOTE}</p>
    </div>
  );
}

