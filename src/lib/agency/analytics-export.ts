/**
 * Analytics export builders.
 *
 * - `buildAnalyticsCsv` is pure and reusable from both a server route and the
 *   browser (no DOM in here).
 * - `triggerCsvDownload` is the browser-only trigger (Blob + object URL).
 * - PDF generation lives in `analytics-pdf.ts` (pdf-lib, client-side), which
 *   follows the existing invoice-pdf-generator.ts pattern.
 */

export interface CsvRow {
  cells: (string | number)[];
}

export function csvEscape(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Pure CSV string builder. The preview notice is embedded as a comment row so
 * no one mistakes preview exports for production reports.
 */
export function buildAnalyticsCsv(
  reportTitle: string,
  headerRow: string[],
  rows: CsvRow[],
  opts: { previewNotice?: boolean } = { previewNotice: true }
): string {
  const lines: string[] = [];
  if (opts.previewNotice) {
    lines.push(`# PREVIEW EXPORT — generated from sample data, not verified production metrics`);
    lines.push(`# ${reportTitle}`);
    lines.push(`# generated_at,${new Date().toISOString()}`);
  }
  lines.push(headerRow.map(csvEscape).join(","));
  for (const row of rows) {
    lines.push(row.cells.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export function triggerCsvDownload(filename: string, csv: string): void {
  if (typeof window === "undefined" || typeof Blob === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
