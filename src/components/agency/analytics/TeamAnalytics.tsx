"use client";

import React from "react";
import {
  Upload as UploadIcon,
  Trash2,
  FolderPlus,
  Send,
  PencilRuler,
  MessageSquare,
} from "lucide-react";
import { ColumnChart, HorizontalBars } from "@/components/agency/analytics/AnalyticsCharts";
import {
  MOCK_RECENT_ACTIVITY,
  MOCK_SECTION_NOTE,
  MOCK_TEAM_ACTIVITY,
  type ActivityAction,
} from "@/lib/agency/analytics-mock";
import {
  formatCompactNumber,
  formatDateShort,
  formatDateTimeShort,
} from "@/lib/agency/analytics-format";

/**
 * TeamAnalytics — member leaderboards, uploads split, activity type mix and
 * the workspace activity timeline. Sensitive/billing data is never shown.
 */

const ACTION_META: Record<
  ActivityAction,
  { label: string; color: string; icon: React.ReactNode }
> = {
  upload: { label: "Upload", color: "#3cff5f", icon: <UploadIcon className="h-3 w-3" /> },
  delete: { label: "Delete", color: "#ff5470", icon: <Trash2 className="h-3 w-3" /> },
  project_created: { label: "Project Created", color: "#4d6fff", icon: <FolderPlus className="h-3 w-3" /> },
  delivery: { label: "Delivery", color: "#f5a524", icon: <Send className="h-3 w-3" /> },
  revision: { label: "Revision", color: "#ff9d5c", icon: <PencilRuler className="h-3 w-3" /> },
  comment: { label: "Comment", color: "#8d9ab2", icon: <MessageSquare className="h-3 w-3" /> },
};

const ROLE_BADGE: Record<string, string> = {
  owner: "text-[#3cff5f] bg-[#12291a] border-[#1f3d28]",
  admin: "text-[#4d6fff] bg-[#131a30] border-[#22305a]",
  editor: "text-[#8bffaf] bg-[#12291a] border-[#1f3d28]",
  reviewer: "text-[#f5a524] bg-[#2a2113] border-[#3d2f12]",
  client: "text-[#758195] bg-[#12141d] border-[#232838]",
};

export function TeamAnalytics() {
  const maxActions = Math.max(...MOCK_TEAM_ACTIVITY.map((m) => m.actions));
  const maxUploads = Math.max(...MOCK_TEAM_ACTIVITY.map((m) => m.uploads));

  const countsByAction = MOCK_RECENT_ACTIVITY.reduce<Record<string, number>>((acc, e) => {
    acc[e.action] = (acc[e.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Most active members */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Most Active Members
            </h3>
            <span className="text-[10px] text-[#5f6b82]">sample set</span>
          </div>
          <div className="space-y-2">
            {MOCK_TEAM_ACTIVITY.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                    i === 0
                      ? "bg-gradient-to-br from-[#3cff5f] to-[#128a32] text-[#050a08]"
                      : "bg-[#1b2234] text-[#8d9ab2]"
                  }`}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold text-[#e7eee9]">{m.name}</p>
                    <span className="shrink-0 font-mono text-[10px] text-[#8d9ab2]">
                      {formatCompactNumber(m.actions)} actions
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#1b2234]">
                    <div
                      className="h-full rounded-full bg-[#3cff5f] transition-all duration-500"
                      style={{ width: `${(m.actions / maxActions) * 100}%`, opacity: i === 0 ? 0.95 : 0.6 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Uploads by member */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Uploads by Member
            </h3>
            <span className="text-[10px] text-[#5f6b82]">sample set</span>
          </div>
          <HorizontalBars
            items={MOCK_TEAM_ACTIVITY.map((m) => ({
              label: m.name,
              sub: m.role,
              valueLabel: `${m.uploads} files`,
              pct: (m.uploads / maxUploads) * 100,
            }))}
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {/* Activity type mix */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Activity Types
            </h3>
            <span className="text-[10px] text-[#5f6b82]">recent window (sample)</span>
          </div>
          <div className="space-y-2">
            {(Object.keys(ACTION_META) as ActivityAction[]).map((a) => (
              <div key={a} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${ACTION_META[a].color}14`, color: ACTION_META[a].color }}
                >
                  {ACTION_META[a].icon}
                </span>
                <span className="flex-1 text-[11px] text-[#8d9ab2]">{ACTION_META[a].label}</span>
                <div className="h-1.5 w-24 rounded-full bg-[#1b2234]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((countsByAction[a] ?? 0) / MOCK_RECENT_ACTIVITY.length) * 160}%`,
                      background: ACTION_META[a].color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="w-5 text-right font-mono text-[10px] text-white">
                  {countsByAction[a] ?? 0}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[#1b2234] pt-3">
            <p className="text-[10px] text-[#5f6b82] leading-relaxed">
              During real wiring this counts from <span className="font-mono text-[#758195]">agency_activity_logs</span>.
              Sensitive or billing details are excluded by design.
            </p>
          </div>
        </section>

        {/* Activity timeline */}
        <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
              Recent Workspace Activity
            </h3>
            <span className="text-[10px] text-[#5f6b82]">timeline preview</span>
          </div>
          <div className="relative space-y-0 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-[#1b2234]">
            {MOCK_RECENT_ACTIVITY.map((e) => {
              const meta = ACTION_META[e.action];
              return (
                <div key={e.id} className="relative flex items-start gap-3 py-2">
                  <div
                    className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      background: "#121520",
                      borderColor: `${meta.color}44`,
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug">
                      <span className="font-semibold text-[#e7eee9]">{e.actor}</span>
                      <span className="text-[#758195]"> · </span>
                      <span className="text-[#8d9ab2]" title={e.target}>{e.target}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] text-[#5f6b82]">
                      {meta.label.toUpperCase()} · {formatDateTimeShort(e.at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Member comparison strip */}
      <section className="rounded-2xl border border-[#222838] bg-[#121520] p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#e7eee9]">
            Member Comparison
          </h3>
          <span className="text-[10px] text-[#5f6b82]">uploads vs actions (sample)</span>
        </div>
        <ColumnChart
          columns={MOCK_TEAM_ACTIVITY.map((m) => ({ label: m.name.split(" ")[0], value: m.actions }))}
          height={72}
          valueSuffix=" actions"
        />
        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#1b2234] pt-3">
          {MOCK_TEAM_ACTIVITY.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 rounded-full border bg-[#0f1219] px-2.5 py-1 text-[10px]"
            >
              <span className="font-semibold text-[#e7eee9]">{m.name.split(" ")[0]}</span>
              <span className={`rounded-full border px-1.5 py-px text-[8px] font-black uppercase ${ROLE_BADGE[m.role] ?? ""}`}>
                {m.role}
              </span>
              <span className="font-mono text-[#758195]">{m.uploads} up</span>
              <span className="text-[#5f6b82]">·</span>
              <span className="font-mono text-[#758195]">{formatDateShort(m.lastActive)}</span>
            </span>
          ))}
        </div>
      </section>

      <p className="text-center text-[9px] text-[#4a5468]">{MOCK_SECTION_NOTE}</p>
    </div>
  );
}
