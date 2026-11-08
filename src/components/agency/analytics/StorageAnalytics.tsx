"use client";

import React from "react";
import {
  DonutChart,
  GrowthLineChart,
  HorizontalBars,
} from "@/components/agency/analytics/AnalyticsCharts";
import {
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_FILE_TYPE_DISTRIBUTION,
  MOCK_LARGEST_FILES,
  MOCK_QUOTA_BYTES,
  MOCK_RESERVED_BYTES,
  MOCK_SECTION_NOTE,
  MOCK_USED_BYTES,
} from "@/lib/agency/analytics-mock";
import {
  formatBytes,
  formatDateShort,
  formatPct,
} from "@/lib/agency/analytics-format";
import type { GrowthPoint } from "@/lib/agency/analytics-mock";

/**
 * StorageAnalytics — growth, split, per-project usage, distribution by
 * category and type, largest files.
 *
 * UI-PHASE source note: category/type data uses the type categories the
 * engine already knows (original/deliverable/preview/revision…), while the
 * "file type" split derives from the r2_key extension — the production
 * agency_project_files table has no mime/column yet (audit note moved into
 * the wiring spec). All values are the labelled sample set.
 */

const CATEGORY_COLORS = ["#3cff5f", "#4d6fff", "#f5a524", "#8bffaf", "#ff5470", "#758195", "#23293a"];

function Panel({
  title,
  note,
  children,
  className = "",
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">{title}</h3>
        {note && <span className="text-[10px] text-[#5f6b82]">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function StorageAnalytics({ growthPoints }: { growthPoints: GrowthPoint[] }) {
  const available = MOCK_QUOTA_BYTES - MOCK_USED_BYTES - MOCK_RESERVED_BYTES;
  const usedPct = (MOCK_USED_BYTES / MOCK_QUOTA_BYTES) * 100;
  const reservedPct = (MOCK_RESERVED_BYTES / MOCK_QUOTA_BYTES) * 100;
  const availablePct = 100 - usedPct - reservedPct;

  const maxProject = Math.max(...MOCK_STORAGE_BY_PROJECT.map((p) => p.bytes));
  const maxFile = Math.max(...MOCK_LARGEST_FILES.map((f) => f.sizeBytes));
  const categoryTotal = MOCK_CATEGORY_DISTRIBUTION.reduce((a, c) => a + c.bytes, 0);

  return (
    <div className="space-y-3">
      {/* Growth line chart */}
      <Panel title="Storage Growth" note={`Showing ${growthPoints.length} daily points (sample series)`}>
        <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px] text-[#758195]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[#3cff5f]" /> Used
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[#4d6fff] opacity-70" style={{ backgroundImage: "repeating-linear-gradient(90deg,#4d6fff 0 3px,transparent 3px 6px)" }} />
            Used + Reserved
          </span>
        </div>
        <GrowthLineChart points={growthPoints} showReserved />
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Used vs Reserved vs Available */}
        <Panel title="Used · Reserved · Available">
          {/* stacked bar */}
          <div className="mb-4 flex h-4 w-full overflow-hidden rounded-full bg-[#0f1219] border border-[#1b2234]">
            <div className="h-full bg-[#3cff5f] transition-all" style={{ width: `${usedPct}%` }} title="Used" />
            <div className="h-full bg-[#4d6fff]" style={{ width: `${reservedPct}%` }} title="Reserved" />
            <div className="h-full bg-[#1e2638]" style={{ width: `${Math.max(availablePct, 0)}%` }} title="Available" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Used", bytes: MOCK_USED_BYTES, pct: usedPct, color: "#3cff5f" },
              { label: "Reserved", bytes: MOCK_RESERVED_BYTES, pct: reservedPct, color: "#4d6fff" },
              { label: "Available", bytes: available, pct: availablePct, color: "#8d9ab2" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[#1b2234] bg-[#0f1219] p-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#758195]">
                    {s.label}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-xs font-bold text-white">
                  {formatBytes(s.bytes)}
                </p>
                <p className="font-mono text-[10px] text-[#758195]">{formatPct(s.pct)}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Category donut */}
        <Panel title="Storage by Category">
          <DonutChart
            slices={MOCK_CATEGORY_DISTRIBUTION.map((c, i) => ({
              label: c.label,
              pct: (c.bytes / categoryTotal) * 100,
              color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
            }))}
            centerLabel={formatBytes(categoryTotal)}
            centerSub="across 7 categories"
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* By project */}
        <Panel title="Storage by Project" note="top 8 (sample)">
          <HorizontalBars
            items={MOCK_STORAGE_BY_PROJECT.map((p) => ({
              label: p.projectName,
              sub: `${p.files} files`,
              valueLabel: formatBytes(p.bytes),
              pct: (p.bytes / maxProject) * 100,
            }))}
          />
        </Panel>

        {/* File type distribution */}
        <Panel title="File Type Distribution" note="derived from key extension (sample)">
          <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
            {MOCK_FILE_TYPE_DISTRIBUTION.map((t, i) => (
              <div
                key={t.ext}
                className="h-full"
                style={{
                  width: `${t.pct}%`,
                  background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  opacity: i === 0 ? 0.9 : 0.6,
                }}
                title={`${t.ext}: ${formatPct(t.pct)}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
            {MOCK_FILE_TYPE_DISTRIBUTION.map((t, i) => (
              <div key={t.ext} className="flex items-center gap-2 text-[10px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{
                    background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    opacity: i === 0 ? 0.9 : 0.6,
                  }}
                />
                <span className="font-mono text-[#8d9ab2]">.{t.ext}</span>
                <span className="ml-auto font-mono text-white">{formatPct(t.pct, 0)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Largest files table */}
      <Panel title="Largest Files" note="sample set">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-[#1b2234]">
                {["File", "Project", "Size Bar", "Size", "Uploaded", "Uploader"].map((h) => (
                  <th key={h} className="pb-2 text-[10px] font-bold uppercase tracking-wider text-[#5f6b82]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LARGEST_FILES.map((f, i) => (
                <tr key={f.id} className="border-b border-[#1b2234]/50 last:border-0 hover:bg-[#151b29] transition-colors">
                  <td className="py-2 pr-3 max-w-[220px] truncate font-mono text-[11px] text-[#e7eee9]" title={f.fileName}>
                    {f.fileName}
                  </td>
                  <td className="py-2 pr-3 text-[11px] text-[#8d9ab2] max-w-[150px] truncate">{f.project}</td>
                  <td className="py-2 pr-3 w-32">
                    <div className="h-1.5 w-full rounded-full bg-[#1b2234]">
                      <div
                        className="h-full rounded-full bg-[#3cff5f] opacity-80"
                        style={{ width: `${(f.sizeBytes / maxFile) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono text-[11px] text-white whitespace-nowrap">
                    {formatBytes(f.sizeBytes)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-[10px] text-[#758195] whitespace-nowrap">
                    {formatDateShort(f.uploadedAt)}
                  </td>
                  <td className="py-2 text-[10px] text-[#8d9ab2] whitespace-nowrap">{f.uploader}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="text-center text-[9px] text-[#4a5468]">{MOCK_SECTION_NOTE}</p>
    </div>
  );
}
