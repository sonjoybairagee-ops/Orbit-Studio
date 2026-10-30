"use client";

import { useState } from "react";
import { mergePdfFiles, PdfResult } from "@/lib/pdf-utils";
import { formatBytes } from "@/lib/image-utils";
import { 
  FileText, 
  UploadCloud, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Combine 
} from "lucide-react";

export default function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError(null);
    const validPdfs = Array.from(newFiles).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (validPdfs.length === 0) {
      setError("Please select valid PDF documents.");
      return;
    }
    setFiles((prev) => [...prev, ...validPdfs]);
    setResult(null);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const newFiles = [...files];
    const [moved] = newFiles.splice(index, 1);
    newFiles.splice(targetIndex, 0, moved);
    setFiles(newFiles);
    setResult(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    try {
      setIsProcessing(true);
      setError(null);
      const res = await mergePdfFiles(files);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to merge PDF files.");
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
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {files.length === 0 ? (
        <label className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center cursor-pointer hover:border-rose-400 hover:bg-slate-50 transition-all">
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => handleFilesAdded(e.target.files)}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 transition-transform group-hover:scale-110">
            <Combine className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Select PDF files to Merge
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Choose 2 or more PDF documents from your computer or drag & drop here
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs border border-slate-200 group-hover:border-rose-300">
            <FileText className="h-3.5 w-3.5" />
            <span>Select PDF Files</span>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          {/* File management bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {files.length} {files.length === 1 ? "PDF File" : "PDF Files"} Selected
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arrange documents in the exact order you want them merged.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={(e) => handleFilesAdded(e.target.files)}
                    className="hidden"
                  />
                  <Plus className="h-3.5 w-3.5 text-rose-600" />
                  <span>Add More</span>
                </label>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/25 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Merging...</span>
                    </>
                  ) : (
                    <>
                      <Combine className="h-3.5 w-3.5" />
                      <span>Merge PDFs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of files with move up/down */}
            <div className="mt-6 space-y-2.5">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xs font-bold text-rose-800">
                      {idx + 1}
                    </span>
                    <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatBytes(file.size)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-3">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFile(idx, "up")}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === files.length - 1}
                      onClick={() => moveFile(idx, "down")}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Merge Success Card */}
          {result && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      PDFs Merged Successfully!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Combined into a single document ({result.pageCount} total pages, {formatBytes(result.size)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Merged PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
