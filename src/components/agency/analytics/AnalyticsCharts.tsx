"use client";

import React, { useMemo, useRef, useState } from "react";
import { formatBytes, formatPct, formatDateShort } from "@/lib/agency/analytics-format";
import type { GrowthPoint } from "@/lib/agency/analytics-mock";

/**
 * Lightweight hand-rolled SVG charts for the Analytics dashboard.
 * Repo has no charting dependency; this follows the existing pattern
 * (cf. AdminAnalyticsChart) but adds real vector charts with hover states.
 * All components are self-contained and dependency-free.
 *
 * Palette inside charts mirrors the agency shell:
 *   green #3cff5f (primary / used), #4d6fff (reserved), amber #f5a524,
 *   red #ff5470, muted #758195.
 */

// ---------------------------------------------------------------------------
// Line chart with hover crosshair + tooltip (used for storage growth)
// ---------------------------------------------------------------------------

export interface GrowthLineChartProps {
  points: GrowthPoint[];
  height?: number;
  showReserved?: boolean;
}

export function GrowthLineChart({
  points,
  height = 208,
  showReserved = true,
}: GrowthLineChartProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 640;
  const PAD = { top: 12, right: 12, bottom: 22, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const { maxY, pathUsed, pathReserved, areaPath, coords } = useMemo(() => {
    if (points.length === 0) {
      return { maxY: 1, pathUsed: "", pathReserved: "", areaPath: "", coords: [] as { x: number; y: number; p: GrowthPoint }[] };
    }
    const maxVal = Math.max(...points.map((p) => p.usedBytes + (showReserved ? p.reservedBytes : 0)));
    const maxY = maxVal * 1.08;
    const step = innerW / Math.max(points.length - 1, 1);
    const coords = points.map((p, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - (p.usedBytes / maxY) * innerH,
      p,
    }));
    const pathUsed = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const reservedCoords = points.map((p, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - ((p.usedBytes + (showReserved ? p.reservedBytes : 0)) / maxY) * innerH,
    }));
    const pathReserved = reservedCoords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");
    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${pathUsed} L${last.x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${first.x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;
    return { maxY, pathUsed, pathReserved, areaPath, coords };
  }, [points, showReserved, innerW, innerH]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el || coords.length === 0) return;
    const rect = el.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const d = Math.abs(coords[i].x - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setHoverIdx(nearest);
  };

  const hp = hoverIdx !== null ? points[hoverIdx] : null;
  const hc = hoverIdx !== null ? coords[hoverIdx] : null;

  // Y axis ticks (3)
  const ticks = [0, 0.5, 1].map((f) => ({
    y: PAD.top + innerH - f * innerH,
    label: formatBytes(maxY * f),
  }));

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
      className="relative w-full"
    >
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3cff5f" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3cff5f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={t.y}
              y2={t.y}
              stroke="#1b2234"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize="8.5"
              fill="#758195"
              fontFamily="ui-monospace, monospace"
            >
              {t.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#growthArea)" />
        {showReserved && (
          <path d={pathReserved} fill="none" stroke="#4d6fff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
        )}
        <path d={pathUsed} fill="none" stroke="#3cff5f" strokeWidth="1.6" />

        {hc && (
          <g>
            <line x1={hc.x} x2={hc.x} y1={PAD.top} y2={PAD.top + innerH} stroke="#3cff5f" strokeWidth="0.8" opacity="0.5" />
            <circle cx={hc.x} cy={hc.y} r="3" fill="#0d0f15" stroke="#3cff5f" strokeWidth="1.6" />
          </g>
        )}

        {/* X labels: first / middle / last */}
        {points.length > 2 &&
          [0, Math.floor(points.length / 2), points.length - 1].map((i) => (
            <text
              key={i}
              x={coords[i].x}
              y={height - 6}
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              fontSize="8.5"
              fill="#758195"
            >
              {formatDateShort(points[i].date)}
            </text>
          ))}
      </svg>

      {hp && hc && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-[#23293a] bg-[#141824] px-3 py-2 shadow-xl"
          style={{
            left: `${(hc.x / W) * 100}%`,
            top: 0,
            transform:
              (hc.x / W) > 0.75 ? "translateX(calc(-100% - 10px))" : "translateX(10px)",
          }}
        >
          <p className="text-[10px] font-bold text-white">{formatDateShort(hp.date)}</p>
          <p className="mt-0.5 text-[10px] font-mono text-[#3cff5f]">
            Used {formatBytes(hp.usedBytes)}
          </p>
          {showReserved && (
            <p className="text-[10px] font-mono text-[#4d6fff]">
              Reserved {formatBytes(hp.reservedBytes)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut chart (category distribution)
// ---------------------------------------------------------------------------

export interface DonutSlice {
  label: string;
  pct: number;
  color: string;
}

export function DonutChart({
  slices,
  centerLabel,
  centerSub,
}: {
  slices: DonutSlice[];
  centerLabel: string;
  centerSub?: string;
}) {
  const R = 42;
  const CIRC = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 110 110" className="h-28 w-28 shrink-0 -rotate-90">
        <circle cx="55" cy="55" r={R} fill="none" stroke="#1b2234" strokeWidth="10" />
        {slices.map((s, i) => {
          const len = (s.pct / 100) * CIRC;
          const offset = acc;
          acc += len;
          return (
            <circle
              key={i}
              cx="55"
              cy="55"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeDasharray={`${len.toFixed(2)} ${(CIRC - len).toFixed(2)}`}
              strokeDashoffset={-offset.toFixed(2)}
              className="transition-all"
            />
          );
        })}
        <circle cx="55" cy="55" r="30" fill="#121520" />
      </svg>
      <div className="min-w-0">
        <p className="text-lg font-black text-white leading-none">{centerLabel}</p>
        {centerSub && <p className="mt-1 text-[10px] text-[#758195]">{centerSub}</p>}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[#8d9ab2] truncate">{s.label}</span>
              <span className="font-mono text-[#e7eee9]">{formatPct(s.pct, 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal bars (storage by project / file types / member comparison)
// ---------------------------------------------------------------------------

export interface BarItem {
  label: string;
  sub?: string;
  valueLabel: string;
  pct: number; // 0..100
  color?: string;
  danger?: boolean;
}

export function HorizontalBars({ items, max = 100 }: { items: BarItem[]; max?: number }) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 truncate text-[11px] font-semibold text-[#e7eee9]">
              {it.label}
              {it.sub && <span className="ml-2 text-[10px] font-normal text-[#758195]">{it.sub}</span>}
            </p>
            <p
              className={`shrink-0 font-mono text-[10px] ${
                it.danger ? "text-[#ff5470]" : "text-[#8d9ab2]"
              }`}
            >
              {it.valueLabel}
            </p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1b2234]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((it.pct / max) * 100, 100)}%`,
                background: it.color ?? (it.danger ? "#ff5470" : "#3cff5f"),
                opacity: 0.9,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column chart (project completion by month, cleanup job status, etc.)
// ---------------------------------------------------------------------------

export interface ColumnItem {
  label: string;
  value: number;
  color?: string;
}

export function ColumnChart({
  columns,
  height = 96,
  valueSuffix = "",
}: {
  columns: ColumnItem[];
  height?: number;
  valueSuffix?: string;
}) {
  const maxV = Math.max(...columns.map((c) => c.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {columns.map((c, i) => {
          const h = Math.max((c.value / maxV) * (height - 18), 2);
          return (
            <div key={i} className="group relative flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                style={{ height: h, background: c.color ?? "#3cff5f", opacity: 0.85 }}
              />
              <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block rounded-lg border border-[#23293a] bg-[#141824] px-2 py-1 whitespace-nowrap z-10">
                <span className="text-[10px] font-bold text-white">
                  {c.label}: {c.value}
                  {valueSuffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {columns.map((c, i) => (
          <span
            key={i}
            className="flex-1 truncate text-center text-[8px] text-[#5f6b82]"
            title={c.label}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
