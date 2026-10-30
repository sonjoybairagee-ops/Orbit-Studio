"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  allowedFormatsText?: string;
  maxSizeMB?: number;
}

export default function Dropzone({
  onFileSelect,
  accept = "image/png, image/jpeg, image/webp",
  allowedFormatsText = "JPG, PNG, or WebP (up to 25 MB)",
  maxSizeMB = 25,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcess = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-[#3cff5f] bg-[#102a16] scale-[1.01] shadow-[0_0_30px_rgba(60,255,95,0.2)]"
            : "border-[#29392f] bg-[#0c1510]/80 hover:border-[#3cff5f]/60 hover:bg-[#102016]/90"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#102a16] to-[#1b4326] border border-[#2d5738] text-[#3cff5f] shadow-lg shadow-emerald-950/50 transition-transform duration-300 group-hover:scale-110 group-hover:border-[#3cff5f]/50">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base font-bold text-[#e7eee9] transition-colors group-hover:text-white">
          Choose an image or drag &amp; drop here
        </h3>
        <p className="mt-1.5 text-xs text-[#9baaa1]">
          {allowedFormatsText}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16221a] px-4.5 py-1.5 text-xs font-semibold text-[#3cff5f] border border-[#29392f] shadow-xs group-hover:border-[#3cff5f]/50 group-hover:bg-[#1b2b20] transition-colors">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Browse from computer</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#2b1215] p-3 text-xs text-[#f87171] border border-[#4a2225]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
