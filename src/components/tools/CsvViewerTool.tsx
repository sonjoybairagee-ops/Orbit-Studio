"use client";

import { useState, useMemo, useRef } from "react";
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
  FileSpreadsheet,
  Code,
  FileText,
  RotateCcw,
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

// Parse CSV line handling quotes and escaped quotes
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
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export default function CsvViewerTool() {
  const [csvText, setCsvText] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw text into grid
  const parsedData = useMemo(() => {
    if (!csvText.trim()) return { headers: [], rows: [] };

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const allRows = lines.map((line) => parseCsvLine(line, delimiter));

    if (hasHeader && allRows.length > 0) {
      const headers = allRows[0];
      const rows = allRows.slice(1);
      return { headers, rows };
    } else {
      const colCount = Math.max(...allRows.map((r) => r.length), 0);
      const headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
      return { headers, rows: allRows };
    }
  }, [csvText, delimiter, hasHeader]);

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return parsedData.rows;
    const q = searchQuery.toLowerCase();
    return parsedData.rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(q))
    );
  }, [parsedData.rows, searchQuery]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sortCol === null) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortCol] ?? "";
      const valB = b[sortCol] ?? "";
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB) && valA !== "" && valB !== "") {
        return sortAsc ? numA - numB : numB - numA;
      }
      return sortAsc
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    });
  }, [filteredRows, sortCol, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (colIndex: number) => {
    if (sortCol === colIndex) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortCol(null);
        setSortAsc(true);
      }
    } else {
      setSortCol(colIndex);
      setSortAsc(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".tsv")) {
      setDelimiter("\t");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setPage(1);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Export as CSV
  const handleDownloadCsv = () => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const handleDownloadJson = () => {
    const objArray = parsedData.rows.map((row) => {
      const obj: Record<string, string> = {};
      parsedData.headers.forEach((h, i) => {
        obj[h || `col_${i}`] = row[i] ?? "";
      });
      return obj;
    });
    const jsonStr = JSON.stringify(objArray, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Markdown Table
  const handleCopyMarkdown = () => {
    if (parsedData.headers.length === 0) return;
    const headerLine = `| ${parsedData.headers.join(" | ")} |`;
    const sepLine = `| ${parsedData.headers.map(() => "---").join(" | ")} |`;
    const rowsLines = parsedData.rows
      .map((r) => `| ${parsedData.headers.map((_, i) => r[i] ?? "").join(" | ")} |`)
      .join("\n");
    const md = `${headerLine}\n${sepLine}\n${rowsLines}`;
    navigator.clipboard.writeText(md);
    setCopiedKey("md");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Stats */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Table2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Interactive CSV & TSV Data Grid
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{parsedData.rows.length} total rows</span>
                <span>•</span>
                <span>{parsedData.headers.length} columns</span>
                <span>•</span>
                <span>{new Blob([csvText]).size.toLocaleString()} bytes</span>
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Code className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              {copiedKey === "md" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === "md" ? "Copied MD!" : "Copy MD Table"}
            </button>
          </div>
        </div>

        {/* Delimiter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search data in all cells..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-7 flex flex-wrap items-center justify-start sm:justify-end gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={"\t"}>Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              First Row as Header
            </label>

            <button
              type="button"
              onClick={() => {
                setCsvText(SAMPLE_CSV);
                setSearchQuery("");
                setSortCol(null);
                setPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Sample
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Table View */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 shadow-2xs z-10">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-[10px] font-mono text-slate-400">#</th>
                {parsedData.headers.map((header, idx) => {
                  const isSorted = sortCol === idx;
                  return (
                    <th
                      key={idx}
                      onClick={() => handleSort(idx)}
                      className="py-3 px-4 font-bold uppercase tracking-wider text-slate-700 cursor-pointer select-none hover:bg-slate-200/60 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{header || `Col ${idx + 1}`}</span>
                        {isSorted ? (
                          sortAsc ? (
                            <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(1, parsedData.headers.length + 1)}
                    className="py-12 text-center text-slate-400"
                  >
                    No matching rows found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => {
                  const absoluteIndex = (currentPage - 1) * pageSize + rowIdx + 1;
                  return (
                    <tr key={rowIdx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400 bg-slate-50/50">
                        {absoluteIndex}
                      </td>
                      {parsedData.headers.map((_, colIdx) => {
                        const cellValue = row[colIdx] ?? "";
                        return (
                          <td
                            key={colIdx}
                            className="py-2.5 px-4 text-slate-800 font-mono whitespace-nowrap"
                          >
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50">
          <div className="text-slate-500 font-medium">
            Showing {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} filtered rows
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Raw CSV Textarea Editor */}
      <details className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <summary className="text-sm font-bold text-slate-800 cursor-pointer select-none">
          View & Edit Raw CSV Source
        </summary>
        <div className="mt-4">
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setPage(1);
            }}
            placeholder="Paste raw CSV content here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </details>
    </div>
  );
}
