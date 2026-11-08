/**
 * Preview PDF report builder — extracts a compact PDF report shape from the
 * labelled sample dataset. Split from AnalyticsExport.tsx so the route
 * handler's mock usage and the client PDF path share exactly one source.
 *
 * ⚠ Sample data only — never ship as verified numbers.
 */

import { formatBytes, formatDateTimeShort } from "@/lib/agency/analytics-format";
import {
  MOCK_QUOTA_BYTES,
  MOCK_USED_BYTES,
  MOCK_RESERVED_BYTES,
  MOCK_FILE_TOTAL,
  MOCK_FILE_RECENT_7D,
  MOCK_ACTIVE_MEMBERS,
  MOCK_STORAGE_BY_PROJECT,
  MOCK_PROJECT_PERFORMANCE,
  MOCK_TEAM_ACTIVITY,
} from "@/lib/agency/analytics-mock";
import type { AnalyticsPdfReport } from "@/lib/agency/analytics-pdf";

export async function buildPreviewAnalyticsPdfReport(): Promise<AnalyticsPdfReport> {
  const usedPct = ((MOCK_USED_BYTES / MOCK_QUOTA_BYTES) * 100).toFixed(1);

  return {
    workspaceName: "CompX Orbit Studio (preview workspace)",
    generatedAtIso: formatDateTimeShort(new Date().toISOString()),
    dateRangeLabel: "Last 30 days",
    kpis: [
      {
        label: "Storage Used",
        value: formatBytes(MOCK_USED_BYTES),
        sub: `${usedPct}% of ${formatBytes(MOCK_QUOTA_BYTES)} quota`,
      },
      {
        label: "Total Files",
        value: String(MOCK_FILE_TOTAL),
        sub: `+${MOCK_FILE_RECENT_7D} in last 7 days`,
      },
      {
        label: "Active Projects",
        value: String(
          MOCK_PROJECT_PERFORMANCE.filter(
            (p) => p.status !== "archived" && p.status !== "delivered"
          ).length
        ),
        sub: "27 delivered · 2 overdue (sample)",
      },
      {
        label: "Team Activity",
        value: `${MOCK_ACTIVE_MEMBERS} active`,
        sub: "Sample member set",
      },
    ],
    tables: [
      {
        title: "Storage by project",
        header: ["Project", "Files", "Storage"],
        rows: MOCK_STORAGE_BY_PROJECT.map((s) => [s.projectName, s.files, formatBytes(s.bytes)]),
      },
      {
        title: "Project performance",
        header: ["Project", "Status", "Progress", "Overdue"],
        rows: MOCK_PROJECT_PERFORMANCE.map((p) => [
          p.name,
          p.status,
          `${p.progressPct}%`,
          p.overdue ? "YES" : "—",
        ]),
      },
      {
        title: "Team activity",
        header: ["Member", "Role", "Uploads", "Actions"],
        rows: MOCK_TEAM_ACTIVITY.map((m) => [m.name, m.role, m.uploads, m.actions]),
      },
      {
        title: "Reserved vs available",
        header: ["Reserved", "Available", "Quota"],
        rows: [
          [
            formatBytes(MOCK_RESERVED_BYTES),
            formatBytes(MOCK_QUOTA_BYTES - MOCK_USED_BYTES - MOCK_RESERVED_BYTES),
            formatBytes(MOCK_QUOTA_BYTES),
          ],
        ],
      },
    ],
  } as AnalyticsPdfReport;
}
