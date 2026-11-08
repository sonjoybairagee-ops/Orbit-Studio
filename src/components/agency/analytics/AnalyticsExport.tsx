"use client";

import React, { useState } from "react";
import { ChevronDown, Download, FileText } from "lucide-react";

/**
 * AnalyticsExport — export menu for the Analytics dashboard.
 *
 * UI-PHASE rules honoured here:
 *  - Only exports that can be implemented reliably: CSV (pure string builder,
 *    served through the Owner/Admin-guarded /api/agency/analytics/export route)
 *    and a client-side A4 PDF (pdf-lib pattern from invoice-pdf-generator.ts).
 *  - Every export is stamped as a preview of sample data.
 */

export type AnalyticsReportKind = "workspace-storage" | "project-performance" | "team-activity";

const CSV_ITEMS: { kind: AnalyticsReportKind; label: string; desc: string }[] = [
  {
    kind: "workspace-storage",
    label: "Workspace Storage Report",
    desc: "Storage by project (CSV)",
  },
  {
    kind: "project-performance",
    label: "Project Performance Report",
    desc: "Status, progress, overdue (CSV)",
  },
  {
    kind: "team-activity",
    label: "Team Activity Report",
    desc: "Uploads & actions per member (CSV)",
  },
];

export function AnalyticsExport({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadCsv = (kind: AnalyticsReportKind) => {
    // Full navigation triggers a file download via Content-Disposition; the
    // route handler independently re-checks Owner/Admin authorization.
    window.location.href = `/api/agency/analytics/export?workspaceId=${encodeURIComponent(
      workspaceId
    )}&report=${kind}`;
    setOpen(false);
  };

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      // Build the preview report from the labelled sample module (kept in the
      // same file that the CSV route uses, so both stay consistent).
      const { buildPreviewAnalyticsPdfReport } = await import(
        "@/lib/agency/analytics-export-preview"
      );
      const report = await buildPreviewAnalyticsPdfReport();
      const { downloadAnalyticsPdf } = await import("@/lib/agency/analytics-pdf");
      await downloadAnalyticsPdf(report);
    } finally {
      setPdfBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#4d6fff] px-3.5 py-2 text-xs font-black text-white hover:bg-[#5f7eff] transition-all shadow-lg shadow-[#4d6fff]/20 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        Export Report
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* click-away layer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-[#121520] border border-[#23293a] p-2 shadow-2xl">
            <p className="px-2 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#758195]">
              CSV exports
            </p>
            {CSV_ITEMS.map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => downloadCsv(item.kind)}
                className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#1a2030] transition-colors text-left cursor-pointer"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1b2234] text-[#3cff5f] text-[10px] font-black">
                  CSV
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-white truncate">{item.label}</span>
                  <span className="block text-[10px] text-[#758195]">{item.desc}</span>
                </span>
              </button>
            ))}

            <div className="my-1.5 border-t border-[#1f2537]" />
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#758195]">
              PDF report
            </p>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfBusy}
              className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#1a2030] transition-colors text-left cursor-pointer disabled:opacity-50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1b2234] text-[#4d6fff]">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <span>
                <span className="block text-xs font-bold text-white">
                  {pdfBusy ? "Building PDF…" : "Full Analytics PDF"}
                </span>
                <span className="block text-[10px] text-[#758195]">KPIs + storage + projects + team</span>
              </span>
            </button>

            <div className="mt-1.5 border-t border-[#1f2537] px-2 py-2">
              <p className="text-[9px] leading-relaxed text-[#5f6b82]">
                Preview exports contain <span className="text-[#f5a524]">sample data</span> —
                not verified production metrics.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
