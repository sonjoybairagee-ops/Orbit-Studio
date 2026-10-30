"use client";

import { useState } from "react";
import { compressPdf } from "@/lib/pdf-utils";
import { formatBytes } from "@/lib/image-utils";
import { 
  FileText, 
  UploadCloud, 
  Minimize2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  ArrowDownRight,
  AlertCircle 
} from "lucide-react";

export default function CompressPdfTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    savedPercentage: number;
    pageCount: number;
    filename: string;
  } | null>(null);
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
    processCompression(file);
  };

  const processCompression = async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);
      const res = await compressPdf(file);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to compress PDF.");
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
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center cursor-pointer hover:border-amber-400 hover:bg-slate-50 transition-all">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/25 transition-transform group-hover:scale-110">
            <Minimize2 className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Select a PDF document to Compress
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Optimize streams, remove unused metadata, and reduce file weight locally
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-amber-600 shadow-2xs border border-slate-200 group-hover:border-amber-300">
            <FileText className="h-3.5 w-3.5" />
            <span>Choose PDF File</span>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Original Size: {formatBytes(selectedFile.size)}
                  </p>
                </div>
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
                  onClick={handleDownload}
                  disabled={!result || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/25 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Processing state or Results */}
            {isProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
                <span className="text-sm font-semibold">Optimizing PDF streams & metadata...</span>
              </div>
            ) : result ? (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Original Size</div>
                  <div className="text-base font-bold text-slate-700 mt-0.5">
                    {formatBytes(result.originalSize)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Compressed Size</div>
                  <div className="text-base font-bold text-amber-700 mt-0.5">
                    {formatBytes(result.compressedSize)}
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-200/60 p-4">
                  <div className="text-xs text-amber-700 font-semibold">Total Saved</div>
                  <div className="text-base font-black text-amber-800 mt-0.5 flex items-center justify-center gap-1">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>{result.savedPercentage}%</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-400">Page Count</div>
                  <div className="text-base font-bold text-slate-700 mt-0.5">
                    {result.pageCount} Pages
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
