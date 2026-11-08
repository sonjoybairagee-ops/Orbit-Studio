"use client";

import React from "react";
import { HardDrive, Files, FolderKanban, Users } from "lucide-react";
import {
  formatBytes,
  formatCompactNumber,
  formatPct,
} from "@/lib/agency/analytics-format";

/**
 * AnalyticsOverview — the four compact KPI metric cards.
 * Values arrive from the labelled preview module (UI phase); when real wiring
 * lands, these cards consume the validated aggregation endpoints instead.
 */

export interface OverviewKpiProps {
  usedBytes: number;
  reservedBytes: number;
  quotaBytes: number;
  fileTotal: number;
  fileRecent: number;
  fileChangePct: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  activeMembers: number;
  teamSize: number;
  recentActionCount: number;
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#222838] bg-[#121520] p-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${accent}14`, color: accent }}
          >
            {icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#758195] truncate">
            {label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xl font-black text-white leading-none">{value}</p>
      <p className="mt-1.5 text-[11px] text-[#758195] truncate">{sub}</p>
      {children}
    </div>
  );
}

export function AnalyticsOverview(props: OverviewKpiProps) {
  const usedPct = (props.usedBytes / props.quotaBytes) * 100;
  const reservedPct = (props.reservedBytes / props.quotaBytes) * 100;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Storage Used */}
      <KpiCard
        icon={<HardDrive className="h-3.5 w-3.5" />}
        label="Storage Used"
        value={formatBytes(props.usedBytes)}
        sub={`of ${formatBytes(props.quotaBytes)} quota · ${formatBytes(props.reservedBytes)} reserved`}
        accent="#3cff5f"
      >
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b2234]">
          <div className="relative h-full overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#3cff5f]"
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
            <div
              className="absolute inset-y-0 bg-[#4d6fff]"
              style={{
                left: `${Math.min(usedPct, 100)}%`,
                width: `${Math.min(reservedPct, 100 - Math.min(usedPct, 100))}%`,
              }}
            />
          </div>
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-[#8d9ab2]">
          {formatPct(usedPct)} used
        </p>
      </KpiCard>

      {/* 2. Total Files */}
      <KpiCard
        icon={<Files className="h-3.5 w-3.5" />}
        label="Total Files"
        value={formatCompactNumber(props.fileTotal)}
        sub={`+${props.fileRecent} uploaded in last 7 days`}
        accent="#4d6fff"
      >
        <p className="mt-4 font-mono text-[10px] text-[#3cff5f]">
          ▲ +{formatPct(props.fileChangePct)}
          <span className="ml-1 text-[#758195]">vs prior period</span>
        </p>
      </KpiCard>

      {/* 3. Active Projects */}
      <KpiCard
        icon={<FolderKanban className="h-3.5 w-3.5" />}
        label="Active Projects"
        value={String(props.activeProjects)}
        sub={`${props.completedProjects} delivered all-time`}
        accent="#f5a524"
      >
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1b2234]">
            <div className="h-full rounded-full bg-[#3cff5f]" style={{ width: "72%" }} />
          </div>
          <span className="font-mono text-[10px] text-[#ff5470]">
            {props.overdueProjects} overdue
          </span>
        </div>
      </KpiCard>

      {/* 4. Team Activity */}
      <KpiCard
        icon={<Users className="h-3.5 w-3.5" />}
        label="Team Activity"
        value={`${props.activeMembers}/${props.teamSize}`}
        sub={`active members · ${formatCompactNumber(props.recentActionCount)} recent actions`}
        accent="#ff5470"
      >
        <div className="mt-4 flex items-center gap-1">
          {Array.from({ length: props.teamSize }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < props.activeMembers ? "bg-[#3cff5f]" : "bg-[#1b2234]"
              }`}
            />
          ))}
        </div>
      </KpiCard>
    </div>
  );
}
