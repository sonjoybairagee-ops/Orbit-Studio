"use client";

import { useState } from "react";
import { csvToJson } from "@/lib/audio-file-utils";
import { Table2, Copy, Check, Download, Upload, AlertCircle, FileSpreadsheet } from "lucide-react";

const SAMPLE_CSV = `name,age,email,role,status
Alice Johnson,28,alice@example.com,Developer,Active
Bob Smith,34,bob@example.com,Designer,Active
Charlie Brown,42,charlie@example.com,Manager,Pending
Diana Prince,31,diana@example.com,Architect,Active`;

export default function CsvToJsonTool() {
  const [csvText, setCsvText] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [parseNumbers, setParseNumbers] = useState<boolean>(true);
  const [indentation, setIndentation] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute JSON from CSV
  const parseResult = csvToJson(csvText, delimiter);

  let processedData: any[] = parseResult.data;
  if (parseNumbers && processedData.length > 0) {
    processedData = processedData.map((row) => {
      const newRow: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        const strVal = String(v ?? "");
        if (strVal !== "" && !isNaN(Number(strVal))) {
          newRow[k] = Number(strVal);
        } else if (strVal.toLowerCase() === "true") {
          newRow[k] = true;
        } else if (strVal.toLowerCase() === "false") {
          newRow[k] = false;
        } else {
          newRow[k] = strVal;
        }
      }
      return newRow;
    });
  }

  const jsonOutput =
    indentation === 0
      ? JSON.stringify(processedData)
      : JSON.stringify(processedData, null, indentation);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setCsvText(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          {/* Delimiter */}
          <div className="flex items-center gap-1.5">
            <span>Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-teal-500"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {/* Indentation */}
          <div className="flex items-center gap-1.5">
            <span>Format:</span>
            <select
              value={indentation}
              onChange={(e) => setIndentation(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-teal-500"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
              <option value={0}>Minified</option>
            </select>
          </div>

          {/* Number parsing */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={parseNumbers}
              onChange={(e) => setParseNumbers(e.target.checked)}
              className="rounded accent-teal-600"
            />
            <span>Parse numbers & booleans</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200 transition-colors flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={() => setCsvText(SAMPLE_CSV)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1.5 transition-colors"
          >
            Load Sample
          </button>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              CSV Input
            </div>
            <span className="text-[11px] text-slate-400">
              {parseResult.rowCount} rows • {parseResult.headers.length} columns
            </span>
          </div>

          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your CSV text here..."
            rows={14}
            className="w-full font-mono text-xs text-slate-800 bg-slate-50/50 p-3 rounded-xl border border-slate-200 focus:outline-teal-500 resize-y flex-1"
          />

          {parseResult.error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseResult.error}</span>
            </div>
          )}
        </div>

        {/* JSON Output Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Table2 className="w-4 h-4 text-teal-600" />
              JSON Output
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-600 hover:text-teal-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-200 transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download .json
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={jsonOutput}
            rows={14}
            className="w-full font-mono text-xs text-slate-800 bg-slate-50/80 p-3 rounded-xl border border-slate-200 focus:outline-teal-500 resize-y flex-1"
          />

          {/* Quick Stats Footer */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>JSON size: {new Blob([jsonOutput]).size} bytes</span>
            <span>Objects generated: {processedData.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
