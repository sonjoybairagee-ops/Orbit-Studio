"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { formatFileSize } from "@/lib/audio-file-utils";
import { Archive, Upload, Download, Trash2, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  file: File;
}

export default function ZipCreatorTool() {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [zipName, setZipName] = useState<string>("archive");
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [status, setStatus] = useState<"idle" | "zipping" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const items: UploadedFileItem[] = Array.from(newFiles).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      file,
    }));
    setFiles((prev) => [...prev, ...items]);
    setStatus("idle");
    setResultBlob(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setStatus("idle");
    setResultBlob(null);
  };

  const clearAll = () => {
    setFiles([]);
    setStatus("idle");
    setResultBlob(null);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const handleCreateZip = async () => {
    if (files.length === 0) return;
    setStatus("zipping");
    setProgress(0);
    setError("");

    try {
      const zip = new JSZip();
      for (const item of files) {
        zip.file(item.name, item.file);
      }

      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: compressionLevel === 0 ? "STORE" : "DEFLATE",
          compressionOptions: {
            level: compressionLevel,
          },
        },
        (metadata) => {
          setProgress(Math.round(metadata.percent));
        }
      );

      setResultBlob(blob);
      setStatus("done");
    } catch (err: any) {
      setError(err?.message || "Failed to create ZIP archive.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${zipName.trim() || "archive"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-amber-200 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
          <Archive className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Drag & drop files or click to browse</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add any files (images, documents, PDFs, videos) to bundle into a ZIP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Files List & Configurations */}
      {files.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Files to Compress ({files.length})</h4>
              <p className="text-xs text-slate-400">Total Uncompressed: {formatFileSize(totalSize)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors"
              >
                + Add More Files
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3 truncate pr-4">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-mono">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Archive File Name</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="archive"
                  className="w-full bg-white border border-slate-200 text-xs font-medium rounded-l-xl p-2.5 focus:outline-amber-500"
                />
                <span className="bg-slate-200 text-slate-600 px-3 py-2.5 text-xs font-bold rounded-r-xl border-y border-r border-slate-200">
                  .zip
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Compression Level</label>
              <select
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-xs font-medium rounded-xl p-2.5 focus:outline-amber-500"
              >
                <option value={0}>Store (0% compression — fastest)</option>
                <option value={1}>Fast (Level 1)</option>
                <option value={6}>Standard (Level 6 — Recommended)</option>
                <option value={9}>Maximum (Level 9 — Smallest archive)</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleCreateZip}
              disabled={status === "zipping"}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {status === "zipping" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing ({progress}%)...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Create ZIP Archive
                </>
              )}
            </button>

            {status === "zipping" && (
              <div className="w-full sm:w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {status === "done" && resultBlob && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">
                    {zipName.trim() || "archive"}.zip Ready!
                  </h4>
                  <p className="text-xs text-amber-700">
                    Archive Size: {formatFileSize(resultBlob.size)} (packed {files.length} files)
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download .ZIP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
