"use client";

import { useState } from "react";
import { imagesToPdf, PdfResult } from "@/lib/pdf-utils";
import { formatBytes } from "@/lib/image-utils";
import { 
  FileImage, 
  UploadCloud, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  Sliders
} from "lucide-react";

interface ImageItem {
  file: File;
  previewUrl: string;
}

export default function ImagesToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImagesAdded = (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const validFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setError("Please select valid image files (JPG or PNG).");
      return;
    }

    const newItems: ImageItem[] = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
    setResult(null);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const newImgs = [...images];
    const [moved] = newImgs.splice(index, 1);
    newImgs.splice(target, 0, moved);
    setImages(newImgs);
    setResult(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
    setResult(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    try {
      setIsProcessing(true);
      setError(null);
      const res = await imagesToPdf(
        images.map((img) => img.file),
        pageSize,
        orientation
      );
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to create PDF from images.");
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
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {images.length === 0 ? (
        <label className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center cursor-pointer hover:border-teal-400 hover:bg-slate-50 transition-all">
          <input
            type="file"
            multiple
            accept="image/jpeg, image/jpg, image/png"
            onChange={(e) => handleImagesAdded(e.target.files)}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25 transition-transform group-hover:scale-110">
            <FileImage className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">
            Select Images to Convert into PDF
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Select one or multiple JPG / PNG pictures to compile into a neat document
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-teal-600 shadow-2xs border border-slate-200 group-hover:border-teal-300">
            <Plus className="h-3.5 w-3.5" />
            <span>Select Photos</span>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-4">
                {/* Page Size Selection */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Page Size:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: "fit", label: "Fit Image" },
                      { id: "a4", label: "A4 Standard" },
                      { id: "letter", label: "US Letter" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPageSize(opt.id as any);
                          setResult(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          pageSize === opt.id
                            ? "border-teal-500 bg-teal-50 text-teal-800"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation if A4/Letter */}
                {pageSize !== "fit" && (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">Orientation:</span>
                    <div className="flex items-center gap-1.5">
                      {["portrait", "landscape"].map((orient) => (
                        <button
                          key={orient}
                          type="button"
                          onClick={() => {
                            setOrientation(orient as any);
                            setResult(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                            orientation === orient
                              ? "border-teal-500 bg-teal-50 text-teal-800"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {orient}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/jpg, image/png"
                    onChange={(e) => handleImagesAdded(e.target.files)}
                    className="hidden"
                  />
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
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
                  onClick={handleConvert}
                  disabled={images.length === 0 || isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      <span>Create PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Grid with Thumbnails and Reorder */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="group relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 overflow-hidden transition-all hover:bg-slate-50 hover:shadow-xs"
                >
                  <div className="relative aspect-3/4 w-full rounded-xl bg-white overflow-hidden border border-slate-200/60 flex items-center justify-center">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/80 text-[11px] font-bold text-white backdrop-blur-xs">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[100px] text-slate-600 font-medium">
                      {item.file.name}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, "up")}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                        title="Move Earlier"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, "down")}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20"
                        title="Move Later"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="rounded-md p-1 text-red-500 hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                      PDF Created Successfully!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Compiled {result.pageCount} photos into PDF document ({formatBytes(result.size)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
