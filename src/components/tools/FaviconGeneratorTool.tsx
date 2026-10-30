"use client";

import { useState, useRef } from "react";
import { Globe, Download, Copy, Check, Archive, Smartphone, Laptop } from "lucide-react";
import { createZipArchive } from "@/lib/audio-file-utils";

interface FaviconSpec {
  size: number;
  filename: string;
  label: string;
}

const SIZES: FaviconSpec[] = [
  { size: 16, filename: "favicon-16x16.png", label: "Browser Tab (16x16)" },
  { size: 32, filename: "favicon-32x32.png", label: "Desktop & Bookmark (32x32)" },
  { size: 48, filename: "favicon-48x48.png", label: "Windows Shortcut (48x48)" },
  { size: 180, filename: "apple-touch-icon.png", label: "Apple iOS Touch (180x180)" },
  { size: 192, filename: "android-chrome-192x192.png", label: "Android Chrome (192x192)" },
  { size: 512, filename: "android-chrome-512x512.png", label: "PWA Splash Icon (512x512)" },
];

export default function FaviconGeneratorTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview180, setPreview180] = useState<string>("");
  const [preview32, setPreview32] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      // Generate previews
      setPreview180(renderToDataUrl(img, 180));
      setPreview32(renderToDataUrl(img, 32));
    };
    img.src = url;
  };

  const renderToDataUrl = (img: HTMLImageElement, size: number): string => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  };

  const renderToBlob = (img: HTMLImageElement, size: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    });
  };

  const downloadSingle = async (spec: FaviconSpec) => {
    if (!imgRef.current) return;
    const dataUrl = renderToDataUrl(imgRef.current, spec.size);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = spec.filename;
    a.click();
  };

  const downloadZip = async () => {
    if (!imgRef.current) return;
    setIsZipping(true);
    const img = imgRef.current;

    const filesToZip: { name: string; file: Blob }[] = [];
    for (const spec of SIZES) {
      const blob = await renderToBlob(img, spec.size);
      filesToZip.push({ name: spec.filename, file: blob });
    }

    // Also add README with HTML snippet
    const htmlSnippet = `<!-- Favicon HTML Tags -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
    filesToZip.push({
      name: "favicon-instructions.html",
      file: new Blob([htmlSnippet], { type: "text/html" }),
    });

    const zipBlob = await createZipArchive(filesToZip);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicon-package.zip";
    a.click();
    URL.revokeObjectURL(url);
    setIsZipping(false);
  };

  const htmlCode = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;

  const copyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Choose a logo or image for your Favicon</h3>
            <p className="text-sm text-slate-500 mt-1">Generates all web, Apple iOS, and Android PWA icon sizes in 1 click</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Editor & Preview */}
      {imageFile && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm truncate max-w-xs">{imageFile.name}</h4>
                  <p className="text-xs text-slate-400">High-resolution multi-size favicon suite</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  Change Logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Mockups Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Browser Tab Mockup */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  Browser Tab Mockup
                </span>
                <div className="bg-slate-200 rounded-xl p-2">
                  <div className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 max-w-[200px] shadow-2xs">
                    {preview32 ? (
                      <img src={preview32} alt="Favicon preview" className="w-4 h-4 rounded-xs shrink-0" />
                    ) : (
                      <div className="w-4 h-4 bg-slate-300 rounded-xs" />
                    )}
                    <span className="text-xs font-medium text-slate-800 truncate">My Awesome Website</span>
                  </div>
                </div>
              </div>

              {/* Mobile Home Screen Mockup */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  iOS / Android Touch Icon
                </span>
                <div className="flex items-center gap-3">
                  {preview180 ? (
                    <img
                      src={preview180}
                      alt="App icon preview"
                      className="w-16 h-16 rounded-2xl shadow-md border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-300 rounded-2xl" />
                  )}
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Home Screen Icon</h5>
                    <p className="text-[11px] text-slate-500">180x180px rounded square app icon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes List */}
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Icon Sizes ({SIZES.length})
                </h4>
                <button
                  onClick={downloadZip}
                  disabled={isZipping}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  {isZipping ? "Packaging ZIP..." : "Download Complete ZIP Bundle"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SIZES.map((spec) => (
                  <div
                    key={spec.filename}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      {preview180 ? (
                        <img
                          src={preview180}
                          alt={spec.label}
                          className="w-6 h-6 rounded-md object-contain shrink-0"
                        />
                      ) : null}
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{spec.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{spec.filename}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadSingle(spec)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HTML Tags Snippet */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">HTML Code Snippet</span>
                <button
                  onClick={copyCode}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "Copied HTML!" : "Copy HTML"}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-2xl overflow-x-auto font-mono">
                {htmlCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
