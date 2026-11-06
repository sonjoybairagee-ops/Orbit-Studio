"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Table2,
  Upload,
  Download,
  Copy,
  Check,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  FileSpreadsheet,
  Code,
  FileText,
  RotateCcw,
  Edit3,
  Database,
  Sparkles,
  ChevronDown,
  X,
  FileCode,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

const SAMPLE_CSV = `id,name,email,department,role,salary,status
1,Sarah Connor,sarah.c@techcorp.io,Engineering,Lead Architect,145000,Active
2,Alex Murphy,alex.m@techcorp.io,Security,Security Director,138000,Active
3,Elena Rostova,elena.r@techcorp.io,Product,Senior PM,122000,Active
4,Marcus Vance,marcus.v@techcorp.io,Design,Staff Designer,115000,On Leave
5,Devon Miles,devon.m@techcorp.io,Operations,VP Operations,160000,Active
6,Kira Yamato,kira.y@techcorp.io,Engineering,Senior Backend Dev,128000,Active
7,Chloe Bennett,chloe.b@techcorp.io,Marketing,Growth Lead,98000,Active
8,Liam Neeson,liam.n@techcorp.io,Support,Support Manager,85000,Active
9,Talia al Ghul,talia.g@techcorp.io,Strategy,Chief Strategist,175000,Active
10,David Lightman,david.l@techcorp.io,Engineering,AI Researcher,142000,Active
11,Wade Wilson,wade.w@techcorp.io,Quality,QA Engineer,92000,Active
12,Dana Scully,dana.s@techcorp.io,Research,Principal Scientist,150000,Active`;

// Parse CSV line handling quotes and escaped quotes (RFC 4180 standard)
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Convert table data to CSV/TSV string with proper RFC 4180 escaping
function serializeToCsv(headers: string[], rows: string[][], delimiter: string, hasHeader: boolean): string {
  const formatCell = (val: string) => {
    const str = val ?? "";
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  if (hasHeader && headers.length > 0) {
    lines.push(headers.map(formatCell).join(delimiter));
  }
  rows.forEach((row) => {
    lines.push(row.map(formatCell).join(delimiter));
  });
  return lines.join("\n");
}

export default function CsvViewerTool() {
  // Core Grid State
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [rawText, setRawText] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [hasHeader, setHasHeader] = useState<boolean>(true);

  // View & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isRawOpen, setIsRawOpen] = useState<boolean>(false);

  // In-Grid Editing State
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colIdx: number } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editingHeaderIdx, setEditingHeaderIdx] = useState<number | null>(null);
  const [editHeaderValue, setEditHeaderValue] = useState<string>("");

  // Notification / Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showCopyMenu, setShowCopyMenu] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Parse raw text into headers & rows
  const parseRawToGrid = (text: string, delim: string, useHeader: boolean) => {
    if (!text.trim()) {
      setHeaders([]);
      setRows([]);
      return;
    }
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setHeaders([]);
      setRows([]);
      return;
    }

    const allParsed = lines.map((l) => parseCsvLine(l, delim));
    if (useHeader && allParsed.length > 0) {
      const h = allParsed[0];
      const r = allParsed.slice(1);
      // Ensure all rows match header length
      const normalizedRows = r.map((row) => {
        const newRow = [...row];
        while (newRow.length < h.length) newRow.push("");
        return newRow.slice(0, h.length);
      });
      setHeaders(h);
      setRows(normalizedRows);
    } else {
      const maxCols = Math.max(...allParsed.map((r) => r.length), 1);
      const generatedHeaders = Array.from({ length: maxCols }, (_, i) => `Col_${i + 1}`);
      const normalizedRows = allParsed.map((row) => {
        const newRow = [...row];
        while (newRow.length < maxCols) newRow.push("");
        return newRow.slice(0, maxCols);
      });
      setHeaders(generatedHeaders);
      setRows(normalizedRows);
    }
  };

  // Initial load
  useEffect(() => {
    parseRawToGrid(SAMPLE_CSV, ",", true);
  }, []);

  // Sync back to raw text whenever headers or rows change via grid editing
  const syncRawFromGrid = (newHeaders: string[], newRows: string[][]) => {
    const csv = serializeToCsv(newHeaders, newRows, delimiter, hasHeader);
    setRawText(csv);
  };

  // Focus input on edit
  useEffect(() => {
    if (editingCell) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingHeaderIdx !== null) {
      headerInputRef.current?.focus();
      headerInputRef.current?.select();
    }
  }, [editingHeaderIdx]);

  // -------------------------------------------------------------
  // Data Filtering & Sorting
  // -------------------------------------------------------------
  const filteredRowIndices = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows.map((_, idx) => idx);
    }
    const q = searchQuery.toLowerCase();
    const matches: number[] = [];
    rows.forEach((row, idx) => {
      if (row.some((cell) => cell.toLowerCase().includes(q))) {
        matches.push(idx);
      }
    });
    return matches;
  }, [rows, searchQuery]);

  const sortedRowIndices = useMemo(() => {
    if (sortCol === null) return filteredRowIndices;

    return [...filteredRowIndices].sort((idxA, idxB) => {
      const valA = rows[idxA]?.[sortCol] ?? "";
      const valB = rows[idxB]?.[sortCol] ?? "";
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB) && valA !== "" && valB !== "") {
        return sortAsc ? numA - numB : numB - numA;
      }
      return sortAsc
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  }, [filteredRowIndices, rows, sortCol, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRowIndices.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRowIndices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRowIndices.slice(start, start + pageSize);
  }, [sortedRowIndices, currentPage, pageSize]);

  // -------------------------------------------------------------
  // Column Statistics (For Numeric and Text Columns)
  // -------------------------------------------------------------
  const columnStats = useMemo(() => {
    return headers.map((header, colIdx) => {
      const values = rows.map((r) => r[colIdx] ?? "").filter((v) => v !== "");
      const nums = values.map((v) => Number(v)).filter((n) => !isNaN(n));

      const isNumeric = nums.length > 0 && nums.length === values.length;
      if (isNumeric) {
        const sum = nums.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / nums.length;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        return {
          header,
          isNumeric: true,
          count: nums.length,
          sum: sum % 1 === 0 ? sum : Number(sum.toFixed(2)),
          avg: Number(avg.toFixed(2)),
          min,
          max,
        };
      }
      const uniqueCount = new Set(values).size;
      return {
        header,
        isNumeric: false,
        count: values.length,
        uniqueCount,
      };
    });
  }, [headers, rows]);

  // -------------------------------------------------------------
  // In-Grid Editing Handlers
  // -------------------------------------------------------------
  const startEditCell = (rowIdx: number, colIdx: number) => {
    setEditingCell({ rowIdx, colIdx });
    setEditValue(rows[rowIdx]?.[colIdx] ?? "");
  };

  const commitEditCell = () => {
    if (!editingCell) return;
    const { rowIdx, colIdx } = editingCell;
    const updatedRows = rows.map((r, rIndex) => {
      if (rIndex !== rowIdx) return r;
      const updatedRow = [...r];
      updatedRow[colIdx] = editValue;
      return updatedRow;
    });
    setRows(updatedRows);
    syncRawFromGrid(headers, updatedRows);
    setEditingCell(null);
  };

  const cancelEditCell = () => {
    setEditingCell(null);
  };

  const startEditHeader = (colIdx: number) => {
    setEditingHeaderIdx(colIdx);
    setEditHeaderValue(headers[colIdx] ?? "");
  };

  const commitEditHeader = () => {
    if (editingHeaderIdx === null) return;
    const trimmed = editHeaderValue.trim() || `Col_${editingHeaderIdx + 1}`;
    const updatedHeaders = [...headers];
    updatedHeaders[editingHeaderIdx] = trimmed;
    setHeaders(updatedHeaders);
    syncRawFromGrid(updatedHeaders, rows);
    setEditingHeaderIdx(null);
  };

  const cancelEditHeader = () => {
    setEditingHeaderIdx(null);
  };

  // Add / Delete Row
  const handleAddRow = () => {
    const emptyRow = Array.from({ length: headers.length }, () => "");
    const updated = [...rows, emptyRow];
    setRows(updated);
    syncRawFromGrid(headers, updated);
    // Move to last page
    const newTotalPages = Math.ceil(updated.length / pageSize);
    setPage(newTotalPages);
    showToast("Added new row at bottom");
  };

  const handleDeleteRow = (originalRowIdx: number) => {
    const updated = rows.filter((_, idx) => idx !== originalRowIdx);
    setRows(updated);
    syncRawFromGrid(headers, updated);
    showToast("Deleted row");
  };

  // Add / Delete Column
  const handleAddColumn = () => {
    const newColName = `Col_${headers.length + 1}`;
    const updatedHeaders = [...headers, newColName];
    const updatedRows = rows.map((r) => [...r, ""]);
    setHeaders(updatedHeaders);
    setRows(updatedRows);
    syncRawFromGrid(updatedHeaders, updatedRows);
    showToast(`Added column "${newColName}"`);
  };

  const handleDeleteColumn = (colIdx: number) => {
    if (headers.length <= 1) {
      showToast("Table must have at least 1 column");
      return;
    }
    const colName = headers[colIdx];
    const updatedHeaders = headers.filter((_, idx) => idx !== colIdx);
    const updatedRows = rows.map((r) => r.filter((_, idx) => idx !== colIdx));
    setHeaders(updatedHeaders);
    setRows(updatedRows);
    syncRawFromGrid(updatedHeaders, updatedRows);
    if (sortCol === colIdx) setSortCol(null);
    showToast(`Deleted column "${colName}"`);
  };

  // Clear / Reset
  const handleClearTable = () => {
    const defaultHeaders = ["Column 1", "Column 2", "Column 3"];
    const emptyRows = [["", "", ""]];
    setHeaders(defaultHeaders);
    setRows(emptyRows);
    syncRawFromGrid(defaultHeaders, emptyRows);
    setSearchQuery("");
    setSortCol(null);
    setPage(1);
    showToast("Cleared table data");
  };

  const handleResetSample = () => {
    setDelimiter(",");
    setHasHeader(true);
    setRawText(SAMPLE_CSV);
    parseRawToGrid(SAMPLE_CSV, ",", true);
    setSearchQuery("");
    setSortCol(null);
    setPage(1);
    showToast("Reset to sample dataset");
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let targetDelim = delimiter;
    if (file.name.endsWith(".tsv")) {
      targetDelim = "\t";
      setDelimiter("\t");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        parseRawToGrid(content, targetDelim, hasHeader);
        setPage(1);
        setSearchQuery("");
        setSortCol(null);
        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Raw Text Change
  const handleRawChange = (text: string) => {
    setRawText(text);
    parseRawToGrid(text, delimiter, hasHeader);
  };

  // Handle Delimiter Switch
  const handleDelimiterChange = (newDelim: string) => {
    setDelimiter(newDelim);
    const updatedRaw = serializeToCsv(headers, rows, newDelim, hasHeader);
    setRawText(updatedRaw);
    showToast(`Switched delimiter to "${newDelim === "\t" ? "Tab" : newDelim}"`);
  };

  // -------------------------------------------------------------
  // Data Generation for Copy & Export Formats
  // -------------------------------------------------------------
  const generateFormatContent = (format: "csv" | "tsv" | "json" | "markdown" | "html" | "sql" | "yaml"): string => {
    switch (format) {
      case "csv":
        return serializeToCsv(headers, rows, ",", hasHeader);

      case "tsv":
        return serializeToCsv(headers, rows, "\t", hasHeader);

      case "json": {
        const objArray = rows.map((row) => {
          const obj: Record<string, any> = {};
          headers.forEach((h, i) => {
            const rawVal = row[i] ?? "";
            const num = Number(rawVal);
            obj[h || `col_${i + 1}`] = rawVal !== "" && !isNaN(num) ? num : rawVal;
          });
          return obj;
        });
        return JSON.stringify(objArray, null, 2);
      }

      case "markdown": {
        if (headers.length === 0) return "";
        const headerLine = `| ${headers.map((h) => (h || "").replace(/\|/g, "\\|")).join(" | ")} |`;
        const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
        const rowLines = rows
          .map((r) => `| ${headers.map((_, i) => ((r[i] ?? "").replace(/\|/g, "\\|"))).join(" | ")} |`)
          .join("\n");
        return `${headerLine}\n${sepLine}\n${rowLines}`;
      }

      case "html": {
        const thead = headers.map((h) => `        <th>${h}</th>`).join("\n");
        const tbody = rows
          .map(
            (r) =>
              `      <tr>\n${r.map((c) => `        <td>${(c ?? "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`).join("\n")}\n      </tr>`
          )
          .join("\n");

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported CSV Data Table</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; background: #f8fafc; color: #1e293b; }
    .table-container { max-width: 1200px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); overflow: hidden; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background: #0f172a; color: #f8fafc; padding: 12px 16px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) { background: #f8fafc; }
    tr:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <div class="table-container">
    <table>
      <thead>
        <tr>
${thead}
        </tr>
      </thead>
      <tbody>
${tbody}
      </tbody>
    </table>
  </div>
</body>
</html>`;
      }

      case "sql": {
        const tableName = "imported_dataset";
        const colDefinitions = headers
          .map((h, i) => {
            const cleanName = (h || `col_${i + 1}`).toLowerCase().replace(/[^a-z0-9_]/g, "_");
            return `  ${cleanName} TEXT`;
          })
          .join(",\n");

        const colList = headers
          .map((h, i) => (h || `col_${i + 1}`).toLowerCase().replace(/[^a-z0-9_]/g, "_"))
          .join(", ");

        const valueRows = rows
          .map((r) => {
            const vals = headers.map((_, i) => {
              const val = r[i] ?? "";
              return `'${val.replace(/'/g, "''")}'`;
            });
            return `  (${vals.join(", ")})`;
          })
          .join(",\n");

        return `-- Auto-generated SQL Export from CompX Orbit CSV Engine
CREATE TABLE IF NOT EXISTS ${tableName} (
${colDefinitions}
);

INSERT INTO ${tableName} (${colList}) VALUES
${valueRows};`;
      }

      case "yaml": {
        const yamlLines: string[] = [];
        rows.forEach((row) => {
          yamlLines.push(`- ${headers[0] || "col_1"}: "${row[0] ?? ""}"`);
          headers.slice(1).forEach((h, i) => {
            yamlLines.push(`  ${h || `col_${i + 2}`}: "${row[i + 1] ?? ""}"`);
          });
        });
        return yamlLines.join("\n");
      }
    }
  };

  // 1-Click Copy Handler
  const handleCopy = async (format: "csv" | "tsv" | "json" | "markdown" | "html" | "sql") => {
    const content = generateFormatContent(format);
    await navigator.clipboard.writeText(content);
    const labelMap = {
      csv: "CSV",
      tsv: "TSV (Excel)",
      json: "JSON Array",
      markdown: "Markdown Table",
      html: "HTML Table",
      sql: "SQL Inserts",
    };
    showToast(`Copied ${labelMap[format]} to clipboard!`);
    setShowCopyMenu(false);
  };

  // File Download Handler
  const handleDownload = (format: "csv" | "excel" | "tsv" | "json" | "markdown" | "html" | "sql" | "yaml") => {
    let content = "";
    let mimeType = "text/plain;charset=utf-8;";
    let ext: string = format;

    if (format === "excel") {
      // Excel CSV with UTF-8 BOM so Excel opens accents correctly
      const csvStr = serializeToCsv(headers, rows, ",", hasHeader);
      content = "\uFEFF" + csvStr;
      mimeType = "text/csv;charset=utf-8;";
      ext = "csv";
    } else if (format === "csv") {
      content = generateFormatContent("csv");
      mimeType = "text/csv;charset=utf-8;";
    } else if (format === "tsv") {
      content = generateFormatContent("tsv");
      mimeType = "text/tab-separated-values;charset=utf-8;";
    } else if (format === "json") {
      content = generateFormatContent("json");
      mimeType = "application/json;charset=utf-8;";
    } else if (format === "markdown") {
      content = generateFormatContent("markdown");
      mimeType = "text/markdown;charset=utf-8;";
      ext = "md";
    } else if (format === "html") {
      content = generateFormatContent("html");
      mimeType = "text/html;charset=utf-8;";
    } else if (format === "sql") {
      content = generateFormatContent("sql");
      mimeType = "application/sql;charset=utf-8;";
    } else if (format === "yaml") {
      content = generateFormatContent("yaml");
      mimeType = "text/yaml;charset=utf-8;";
      ext = "yaml";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded dataset.${ext}`);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Action Controls Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200/50">
              <Table2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  CSV Data Viewer & Interactive Editor
                </h2>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  100% Client-Side
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">{rows.length} rows</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{headers.length} columns</span>
                <span>•</span>
                <span>{new Blob([rawText]).size.toLocaleString()} bytes</span>
                <span>•</span>
                <span className="text-blue-600">Double click any cell to edit</span>
              </div>
            </div>
          </div>

          {/* Action Hub: Upload, Add Row/Col, 1-Click Copy, Multi-Format Export */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              Upload CSV
            </button>

            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100/70 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>

            <button
              type="button"
              onClick={handleAddColumn}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-slate-500" />
              Add Col
            </button>

            {/* 1-Click Copy Dropdown / Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowCopyMenu(!showCopyMenu);
                  setShowExportMenu(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Copy className="h-3.5 w-3.5 text-blue-600" />
                <span>1-Click Copy</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showCopyMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Copy to Clipboard
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("tsv")}
                    className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      Excel / Sheets (TSV)
                    </span>
                    <span className="rounded bg-emerald-100 px-1 text-[10px] text-emerald-800">Best</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("csv")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Standard CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("json")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Code className="h-3.5 w-3.5 text-amber-600" />
                    JSON Array
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("markdown")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileCode className="h-3.5 w-3.5 text-purple-600" />
                    Markdown Table
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("html")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Table2 className="h-3.5 w-3.5 text-rose-600" />
                    HTML Table
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy("sql")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Database className="h-3.5 w-3.5 text-indigo-600" />
                    SQL INSERTs
                  </button>
                </div>
              )}
            </div>

            {/* Export Multi-Format Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                  setShowCopyMenu(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export File</span>
                <ChevronDown className="h-3 w-3 text-blue-200" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Download Formats
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload("csv")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    CSV File (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("excel")}
                    className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      Excel CSV (BOM UTF-8)
                    </span>
                    <span className="rounded bg-emerald-100 px-1 text-[10px] text-emerald-800">Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("tsv")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Table2 className="h-3.5 w-3.5 text-teal-600" />
                    TSV File (.tsv)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("json")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Code className="h-3.5 w-3.5 text-amber-600" />
                    JSON Document (.json)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("html")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Table2 className="h-3.5 w-3.5 text-rose-600" />
                    Standalone HTML (.html)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("markdown")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileCode className="h-3.5 w-3.5 text-purple-600" />
                    Markdown Table (.md)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("sql")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Database className="h-3.5 w-3.5 text-indigo-600" />
                    SQL Script (.sql)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("yaml")}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-orange-600" />
                    YAML Document (.yaml)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Delimiter Selector, Header Toggle, Reset */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all cells in real time..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-7 flex flex-wrap items-center justify-start md:justify-end gap-3 text-xs">
            {/* Delimiter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => handleDelimiterChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={"\t"}>Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            {/* Header toggle */}
            <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => {
                  setHasHeader(e.target.checked);
                  parseRawToGrid(rawText, delimiter, e.target.checked);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Header Row
            </label>

            <button
              type="button"
              onClick={handleClearTable}
              className="font-semibold text-rose-600 hover:text-rose-700 hover:underline px-1"
            >
              Clear Table
            </button>

            <button
              type="button"
              onClick={handleResetSample}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1"
            >
              Reset Sample
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Data Grid Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-md border-b border-slate-200 shadow-2xs z-20">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-[10px] font-mono text-slate-400 select-none">#</th>
                {headers.map((header, colIdx) => {
                  const isSorted = sortCol === colIdx;
                  const isEditingHeader = editingHeaderIdx === colIdx;
                  const stats = columnStats[colIdx];

                  return (
                    <th
                      key={colIdx}
                      className="py-2.5 px-3 font-bold uppercase tracking-wider text-slate-700 select-none group border-r border-slate-200/60 last:border-r-0 min-w-[130px]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        {isEditingHeader ? (
                          <div className="flex items-center gap-1 w-full">
                            <input
                              ref={headerInputRef}
                              type="text"
                              value={editHeaderValue}
                              onChange={(e) => setEditHeaderValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEditHeader();
                                if (e.key === "Escape") cancelEditHeader();
                              }}
                              onBlur={commitEditHeader}
                              className="w-full rounded bg-white px-1.5 py-1 text-xs font-bold text-slate-900 border border-blue-500 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (sortCol === colIdx) {
                                if (sortAsc) setSortAsc(false);
                                else {
                                  setSortCol(null);
                                  setSortAsc(true);
                                }
                              } else {
                                setSortCol(colIdx);
                                setSortAsc(true);
                              }
                            }}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors flex-1 truncate"
                            title="Click to sort column"
                          >
                            <span className="truncate">{header || `Col ${colIdx + 1}`}</span>
                            {isSorted ? (
                              sortAsc ? (
                                <ArrowUp className="h-3 w-3 text-blue-600 shrink-0" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-blue-600 shrink-0" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-40 group-hover:opacity-100 shrink-0" />
                            )}
                          </div>
                        )}

                        {/* Column Header Controls */}
                        {!isEditingHeader && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditHeader(colIdx);
                              }}
                              title="Rename column"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-200 rounded"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteColumn(colIdx);
                              }}
                              title="Delete column"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Summary Stat Pill */}
                      {stats && (
                        <div className="mt-1 text-[10px] font-normal normal-case text-slate-500 font-mono">
                          {stats.isNumeric ? (
                            <span title={`Sum: ${stats.sum} | Avg: ${stats.avg} | Min: ${stats.min} | Max: ${stats.max}`}>
                              Avg: {stats.avg}
                            </span>
                          ) : (
                            <span>{stats.uniqueCount} unique</span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="py-3 px-3 w-12 text-center text-slate-400 font-normal">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRowIndices.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 2}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-6 w-6 text-slate-300" />
                      <p className="font-semibold text-sm">No matching records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query or reset the filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRowIndices.map((origRowIdx, displayIdx) => {
                  const row = rows[origRowIdx] || [];
                  const rowNumber = (currentPage - 1) * pageSize + displayIdx + 1;

                  return (
                    <tr
                      key={origRowIdx}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400 bg-slate-50/40 select-none">
                        {rowNumber}
                      </td>

                      {/* Data Cells */}
                      {headers.map((_, colIdx) => {
                        const cellValue = row[colIdx] ?? "";
                        const isEditing =
                          editingCell?.rowIdx === origRowIdx && editingCell?.colIdx === colIdx;

                        return (
                          <td
                            key={colIdx}
                            onDoubleClick={() => startEditCell(origRowIdx, colIdx)}
                            className="py-1.5 px-3 text-slate-800 font-mono whitespace-nowrap border-r border-slate-100 last:border-r-0 relative cursor-text"
                            title="Double-click to edit cell"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitEditCell();
                                    if (e.key === "Escape") cancelEditCell();
                                  }}
                                  onBlur={commitEditCell}
                                  className="w-full rounded bg-white px-2 py-1 text-xs font-mono text-slate-900 border-2 border-blue-600 shadow-sm focus:outline-none"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between min-h-[22px]">
                                <span className={cellValue === "" ? "text-slate-300 italic" : ""}>
                                  {cellValue === "" ? "empty" : cellValue}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditCell(origRowIdx, colIdx);
                                  }}
                                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
                                  title="Edit cell"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Delete Action */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(origRowIdx)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                          title="Delete this row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60">
          <div className="text-slate-500 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {sortedRowIndices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, sortedRowIndices.length)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{sortedRowIndices.length}</span> rows
            {searchQuery && (
              <span className="ml-2 text-blue-600 font-semibold">
                (filtered from {rows.length} total)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
            >
              Prev
            </button>
            <span className="font-semibold text-slate-700 px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Raw CSV Synchronized Source Drawer */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setIsRawOpen(!isRawOpen)}
          className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-600" />
            <span>Raw CSV / TSV Source Editor (Two-Way Live Sync)</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isRawOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isRawOpen && (
          <div className="mt-4 space-y-2 animate-in fade-in duration-150">
            <p className="text-xs text-slate-500">
              Any edits made in this textarea immediately update the interactive spreadsheet grid above, and vice versa.
            </p>
            <textarea
              rows={9}
              value={rawText}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="Paste raw CSV content here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
