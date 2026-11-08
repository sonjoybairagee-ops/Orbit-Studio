/**
 * Analytics PDF report generator (client-side, pdf-lib).
 * Pattern follows src/lib/invoice-pdf-generator.ts — pure client, A4,
 * StandardFonts only, no external template. Compact professional report:
 * header block → KPI summary → storage, project and team tables.
 *
 * Preview phase: the generated PDF is stamped "PREVIEW REPORT — sample data".
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface AnalyticsPdfTable {
  title: string;
  header: string[];
  rows: (string | number)[][];
}

export interface AnalyticsPdfReport {
  workspaceName: string;
  generatedAtIso: string;
  dateRangeLabel: string;
  kpis: { label: string; value: string; sub?: string }[];
  tables: AnalyticsPdfTable[];
}

const GREEN = rgb(0.235, 0.776, 0.427); // #3cff5f-adjusted for print
const INK = rgb(0.055, 0.063, 0.09); // #0e1017
const SUBTLE = rgb(0.45, 0.5, 0.58);
const LINE = rgb(0.85, 0.87, 0.9);
const PANEL = rgb(0.965, 0.973, 0.973);

export async function downloadAnalyticsPdf(report: AnalyticsPdfReport): Promise<void> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const pageW = 595.28; // A4 points
  const pageH = 841.89;
  const marginX = 40;
  let page = doc.addPage([pageW, pageH]);
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y - needed < 48) {
      page = doc.addPage([pageW, pageH]);
      y = 56;
    }
  };

  const text = (
    s: string,
    x: number,
    size = 9,
    f = font,
    color = INK,
    maxW = 0
  ) => {
    if (maxW > 0) {
      while (s && f.widthOfTextAtSize(s, size) > maxW) s = s.slice(0, -1);
    }
    page.drawText(s, { x, y, size, font: f, color });
  };

  // Header band
  page.drawRectangle({ x: 0, y: pageH - 96, width: pageW, height: 96, color: INK });
  page.drawText("CompX Orbit — Workspace Analytics", {
    x: marginX,
    y: pageH - 46,
    size: 15,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Workspace: ${report.workspaceName}`, {
    x: marginX,
    y: pageH - 64,
    size: 9,
    font,
    color: rgb(0.65, 0.75, 0.7),
  });
  page.drawText(`Range: ${report.dateRangeLabel}   Generated: ${report.generatedAtIso}`, {
    x: marginX,
    y: pageH - 78,
    size: 8,
    font: mono,
    color: GREEN,
  });
  page.drawText("PREVIEW REPORT — sample data, not verified production metrics", {
    x: marginX,
    y: pageH - 16,
    size: 7,
    font: bold,
    color: rgb(0.96, 0.65, 0.15),
  });

  y = pageH - 120;

  // KPI grid (4 columns)
  const colCount = Math.max(1, Math.min(4, report.kpis.length));
  const colW = (pageW - marginX * 2) / colCount;
  for (let i = 0; i < report.kpis.length; i++) {
    const kpi = report.kpis[i];
    const cx = marginX + (i % colCount) * colW;
    const cy = y - Math.floor(i / colCount) * 58;
    page.drawRectangle({
      x: cx,
      y: cy - 34,
      width: colW - 10,
      height: 46,
      color: PANEL,
      borderColor: LINE,
      borderWidth: 0.7,
    });
    page.drawText(kpi.label.toUpperCase(), {
      x: cx + 8,
      y: cy - 8,
      size: 6.5,
      font: bold,
      color: SUBTLE,
    });
    page.drawText(kpi.value, {
      x: cx + 8,
      y: cy - 22,
      size: 11,
      font: bold,
      color: INK,
    });
    if (kpi.sub) {
      page.drawText(kpi.sub, {
        x: cx + 8,
        y: cy - 31,
        size: 6.5,
        font: font,
        color: SUBTLE,
      });
    }
  }
  y -= Math.ceil(report.kpis.length / colCount) * 58 + 8;

  // Tables
  for (const table of report.tables) {
    ensureSpace(60);
    y -= 22;
    text(table.title.toUpperCase(), marginX, 10, bold, INK);
    y -= 14;

    const rows = [table.header, ...table.rows].map((r) =>
      r.map((c) => String(c))
    );
    const bodyRows = table.rows.length;
    const rowH = 15;
    ensureSpace((rows.length + 1) * rowH + 12);

    // column widths: distribute, first column wider
    const widths = table.header.map((_, i) =>
      i === 0
        ? 0.34 * (pageW - marginX * 2)
        : 0.66 * (pageW - marginX * 2) / (table.header.length - 1)
    );

    // header row
    let cx = marginX;
    rows[0].forEach((cell, i) => {
      text(cell.toUpperCase(), cx, 7, bold, SUBTLE, widths[i] - 6);
      cx += widths[i];
    });
    y -= 6;
    page.drawLine({
      start: { x: marginX, y: y + 2 },
      end: { x: pageW - marginX, y: y + 2 },
      thickness: 0.7,
      color: LINE,
    });
    y -= rowH;
    rows.slice(1).forEach((row) => {
      let cx2 = marginX;
      row.forEach((cell, i) => {
        text(cell, cx2, 8, i === 0 ? font : mono, INK, widths[i] - 6);
        cx2 += widths[i];
      });
      y -= rowH;
    });
    y -= 4;
  }

  // Footer
  const lastPage = doc.getPages().length;
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`CompX Orbit Agency OS · Analytics preview · page ${i + 1} / ${lastPage}`, {
      x: marginX,
      y: 30,
      size: 7,
      font: mono,
      color: SUBTLE,
    });
  });

  const bytes = await doc.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workspace-analytics-${report.generatedAtIso.slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
