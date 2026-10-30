"use client";

import { useState, useCallback, useRef } from "react";
import { encodeBase64, decodeBase64 } from "@/lib/dev-utils";
import { Copy, Check, Repeat, Trash2, Upload, Binary } from "lucide-react";

export default function Base64EncoderTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  let output = "";
  let error = "";
  try {
    output = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
  } catch (e: any) {
    error = e?.message || "Invalid Base64 string";
  }

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleSwap = () => {
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");
    if (file.size > 1024 * 1024) {
      setFileError("File too large. Max 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix: "data:...;base64,"
      const base64Part = result.split(",")[1] ?? "";
      setInput(base64Part);
      setMode("decode"); // show as raw base64 in input field
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? "bg-white shadow text-cyan-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={() => setInput("Hello, World! 🌍")}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-cyan-600 border border-slate-200 rounded-lg hover:border-cyan-300 transition-all"
        >
          Load Sample
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-cyan-600 border border-slate-200 rounded-lg hover:border-cyan-300 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          File to Base64
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileRead} />

        <button
          onClick={() => { setInput(""); setFileError(""); }}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-300 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {fileError && (
        <div className="px-4 py-2 rounded-xl text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          {fileError}
        </div>
      )}

      {error && input.trim() && (
        <div className="px-4 py-2 rounded-xl text-sm font-medium border bg-rose-50 border-rose-200 text-rose-700">
          ✗ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">
            {mode === "encode" ? "Plain Text (UTF-8)" : "Base64 String"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type text to encode to Base64..."
                : "Paste a Base64 string to decode..."
            }
            className="w-full h-64 font-mono text-sm p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-600">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                disabled={!!error}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-cyan-100 hover:text-cyan-700 text-slate-600 transition-all disabled:opacity-40"
              >
                <Repeat className="w-3 h-3" />
                Swap
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-cyan-100 hover:text-cyan-700 text-slate-600 transition-all disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className={`h-64 font-mono text-sm p-4 rounded-2xl border overflow-auto whitespace-pre-wrap break-all ${
            output && !error
              ? "bg-slate-900 text-cyan-300 border-slate-700"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {output && !error ? output : <span className="text-slate-400">Output will appear here...</span>}
          </div>
        </div>
      </div>

      {output && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Input Length", value: input.length },
            { label: "Output Length", value: output.length },
            { label: "Input Bytes", value: `${new Blob([input]).size} B` },
            { label: "Output Bytes", value: `${new Blob([output]).size} B` },
          ].map((s) => (
            <div key={s.label} className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 text-center">
              <p className="text-xl font-bold text-cyan-700">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
