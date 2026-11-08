/**
 * /api/agency/analytics/export — server CSV export endpoint.
 *
 * Authorization is enforced HERE, independently of the UI (per the analytics
 * access-control requirement): session → workspace role → Owner/Admin only.
 * Editors, reviewers and clients are rejected with 403 even if they manage to
 * call this endpoint directly.
 *
 * UI-PHASE NOTE: the CSV currently reflects the labelled preview dataset
 * (analytics-mock.ts). No production tables are read or modified in this
 * phase. When real analytics wiring is approved this file is the place where
 * data aggregation gets validated against the actual schema.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { canManageWorkspace } from "@/lib/agency/permissions";
import { buildAnalyticsCsv, CsvRow } from "@/lib/agency/analytics-export";
import { formatBytes } from "@/lib/agency/analytics-format";
import {
  MOCK_STORAGE_BY_PROJECT,
  MOCK_PROJECT_PERFORMANCE,
  MOCK_TEAM_ACTIVITY,
} from "@/lib/agency/analytics-mock";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const report = request.nextUrl.searchParams.get("report") ?? "workspace-storage";

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  const role = await getWorkspaceMemberRole(workspaceId, user.id);
  if (!role || !canManageWorkspace(role)) {
    return NextResponse.json(
      { error: "Analytics is restricted to workspace owners and admins." },
      { status: 403 }
    );
  }

  let header: string[];
  let rows: CsvRow[];
  let filename: string;

  if (report === "project-performance") {
    header = ["Project", "Client", "Status", "Storage", "Progress %", "Last Activity", "Overdue"];
    rows = MOCK_PROJECT_PERFORMANCE.map((p) => ({
      cells: [p.name, p.client, p.status, formatBytes(p.sizeBytes), p.progressPct, p.lastActivity, p.overdue ? "Yes" : "No"],
    }));
    filename = "project-performance-preview.csv";
  } else if (report === "team-activity") {
    header = ["Member", "Role", "Uploads", "Total Actions", "Last Active"];
    rows = MOCK_TEAM_ACTIVITY.map((m) => ({
      cells: [m.name, m.role, m.uploads, m.actions, m.lastActive],
    }));
    filename = "team-activity-preview.csv";
  } else {
    header = ["Project", "Files", "Storage Bytes", "Storage"];
    rows = MOCK_STORAGE_BY_PROJECT.map((s) => ({
      cells: [s.projectName, s.files, s.bytes, formatBytes(s.bytes)],
    }));
    filename = "workspace-storage-preview.csv";
  }

  const csv = buildAnalyticsCsv(
    `CompX Orbit Analytics — ${report}`,
    header,
    rows
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
