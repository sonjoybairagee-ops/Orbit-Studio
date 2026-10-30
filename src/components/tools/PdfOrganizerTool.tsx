"use client";

import { useState } from "react";
import { getPdfInfo, organizePdf, PageAction, PdfResult } from "@/lib/pdf-utils";
import { formatBytes } from "@/lib/image-utils";
import { 
  FileText, 
  RotateCw, 
  Trash2, 
  Undo, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  AlertCircle 
} from "lucide-react";

export default function PdfOrganizerTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageAction[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    try {
      const info = await getPdfInfo(file);
      setPages(info.pages);
      setResult(null);
    } catch (e: any) {
      setError("Failed to parse PDF pages: " + e.message);
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        rotation: (copy[index].rotation + 90) % 360,
      };
      return copy;
    });
    setResult(null);
  };

  const toggleDeletePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        deleted: !copy[index].deleted,
      };
      return copy;
    });
    setResult(null);
  };

  const movePage = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setPages(copy);
    setResult(null);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    const active = pages.filter((p) => !p.deleted);
    if (active.length === 0) {
      setError("You cannot delete all pages. At least one page must remain.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const res = await organizePdf(selectedFile, pages);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to organize PDF.");
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
    setPages([]);
    setResult(null);
    setError(null);
  };

  const activeCount = pages.filter((p) => !p.deleted).length;

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center cursor-pointer hover:border-violet-400 hover:bg-slate-50 transition-all">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 transition-transform group-hover:scale-110">
            <Layers className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Select a PDF document to Organize
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Reorder pages, rotate sideways sheets, and delete unwanted pages with zero server upload
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-violet-600 shadow-2xs border border-slate-200 group-hover:border-violet-300">
            <FileText className="h-3.5 w-3.5" />
            <span>Select PDF File</span>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Header / Actions bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCount} of {pages.length} pages included ({pages.length - activeCount} deleted)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Choose Another
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={activeCount === 0 || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving PDF...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="h-3.5 w-3.5" />
                      <span>Apply & Export PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Page Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex flex-col rounded-2xl border p-3 transition-all ${
                    p.deleted
                      ? "border-red-200 bg-red-50/50 opacity-60"
                      : "border-slate-200 bg-slate-50/80 hover:border-violet-300"
                  }`}
                >
                  {/* Visual Page Sheet Mockup */}
                  <div className="relative aspect-3/4 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-100 text-[10px] font-bold text-violet-800">
                        {idx + 1}
                      </span>
                      {p.rotation !== 0 && (
                        <span className="rounded bg-slate-100 px-1 text-[9px] font-semibold text-slate-600">
                          {p.rotation}°
                        </span>
                      )}
                    </div>

                    <div
                      className="flex-1 flex items-center justify-center transition-transform"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    >
                      <FileText className={`h-10 w-10 ${p.deleted ? "text-red-300" : "text-slate-300"}`} />
                    </div>

                    <div className="text-center text-[10px] text-slate-400 font-medium truncate">
                      Original p.{p.originalIndex + 1}
                    </div>

                    {p.deleted && (
                      <div className="absolute inset-0 bg-red-100/40 backdrop-blur-2xs flex items-center justify-center">
                        <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Deleted
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions for this page */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <button
                      type="button"
                      onClick={() => rotatePage(idx)}
                      disabled={p.deleted}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                      title="Rotate 90° Clockwise"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0 || p.deleted}
                        onClick={() => movePage(idx, "left")}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                        title="Move Left"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pages.length - 1 || p.deleted}
                        onClick={() => movePage(idx, "right")}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-20"
                        title="Move Right"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDeletePage(idx)}
                      className={`rounded-lg p-1 transition-colors ${
                        p.deleted
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      title={p.deleted ? "Restore Page" : "Delete Page"}
                    >
                      {p.deleted ? <Undo className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Banner */}
          {result && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      PDF Successfully Organized!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      New organized PDF ready with {result.pageCount} pages ({formatBytes(result.size)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Organized PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
