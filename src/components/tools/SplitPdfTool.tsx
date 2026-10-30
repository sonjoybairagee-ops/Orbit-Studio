"use client";

import { useState } from "react";
import { splitPdf, getPdfInfo, PdfResult } from "@/lib/pdf-utils";
import { formatBytes } from "@/lib/image-utils";
import { 
  FileText, 
  UploadCloud, 
  Split, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  AlertCircle 
} from "lucide-react";

export default function SplitPdfTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please choose a valid PDF file.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    try {
      const info = await getPdfInfo(file);
      setTotalPages(info.pageCount);
      // Default extraction: page 1
      setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : "1");
    } catch (e: any) {
      setError("Could not read PDF metadata: " + e.message);
    }
  };

  const handleSplit = async () => {
    if (!selectedFile || !rangeInput.trim()) return;
    try {
      setIsProcessing(true);
      setError(null);
      const res = await splitPdf(selectedFile, rangeInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTotalPages(0);
    setRangeInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-slate-50 transition-all">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 transition-transform group-hover:scale-110">
            <Split className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Select a PDF document to Split
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Separate pages, extract intervals or custom sheets with 100% client-side privacy
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-orange-600 shadow-2xs border border-slate-200 group-hover:border-orange-300">
            <FileText className="h-3.5 w-3.5" />
            <span>Choose PDF File</span>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total: {totalPages} pages • {formatBytes(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Choose Another
              </button>
            </div>

            {/* Split Page Range Input */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Specify Pages or Ranges to Extract:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7-10"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                />
                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={!rangeInput.trim() || isProcessing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/25 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Split className="h-3.5 w-3.5" />
                      <span>Split & Extract</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick shortcut buttons */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400">Quick ranges:</span>
                <button
                  type="button"
                  onClick={() => setRangeInput("1")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  First Page Only (1)
                </button>
                {totalPages >= 3 && (
                  <button
                    type="button"
                    onClick={() => setRangeInput(`1-${Math.min(3, totalPages)}`)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Pages 1 to 3
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRangeInput(`1-${totalPages}`)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  All Pages (1-{totalPages})
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success result */}
          {result && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      Pages Extracted Successfully!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      New PDF created with {result.pageCount} {result.pageCount === 1 ? "page" : "pages"} ({formatBytes(result.size)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Extracted PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
