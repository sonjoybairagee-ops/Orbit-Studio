"use client";

import { useState, useMemo, useCallback } from "react";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Search,
} from "lucide-react";

// Cryptographically secure UUID v4 generator
function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  buf[6] = (buf[6] & 0x0f) | 0x40; // v4
  buf[8] = (buf[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Pseudo UUID v1 (time-based)
function generateUuidV1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  const low = timeHex.slice(-8);
  const mid = timeHex.slice(-12, -8);
  const hi = `1${timeHex.slice(0, 3)}`; // v1
  return `${low}-${mid}-${hi}-8${rand.slice(0, 3)}-${rand.slice(3, 15)}`;
}

// Compact URL-safe NanoID (21 chars)
function generateShortId(len = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export default function UuidGeneratorTool() {
  const [activeTab, setActiveTab] = useState<"generator" | "validator">("generator");

  // Generator Options
  const [version, setVersion] = useState<"v4" | "v1" | "short" | "nil">("v4");
  const [quantity, setQuantity] = useState<number>(5);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(true);
  const [wrapFormat, setWrapFormat] = useState<"none" | "braces" | "quotes" | "array">("none");

  // Output list of UUIDs
  const [uuids, setUuids] = useState<string[]>(() => [
    "4a1f3c82-9e45-42d1-817c-b63920c8de15",
    "9f3c7b12-a1b4-4e92-94bc-87e419b16523",
    "7c2e8a91-45cd-4f10-b981-d102f9c84411",
    "2d8f9104-e341-4567-91a2-cb3847291845",
    "f182c490-12ab-4432-881c-99238471b029",
  ]);

  // Inspector / Validator
  const [inspectInput, setInspectInput] = useState<string>("4a1f3c82-9e45-42d1-817c-b63920c8de15");
  const [copiedKey, setCopiedKey] = useState<string>("");

  const handleGenerate = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let id = "";
      if (version === "v4") id = generateUuidV4();
      else if (version === "v1") id = generateUuidV1();
      else if (version === "short") id = generateShortId();
      else if (version === "nil") id = "00000000-0000-0000-0000-000000000000";

      if (!includeHyphens && version !== "short") {
        id = id.replace(/-/g, "");
      }
      if (isUppercase) {
        id = id.toUpperCase();
      } else {
        id = id.toLowerCase();
      }
      list.push(id);
    }
    setUuids(list);
  }, [quantity, version, includeHyphens, isUppercase]);

  // Formatted output text
  const formattedOutput = useMemo(() => {
    if (wrapFormat === "braces") {
      return uuids.map((id) => `{${id}}`).join("\n");
    }
    if (wrapFormat === "quotes") {
      return uuids.map((id) => `"${id}"`).join(",\n");
    }
    if (wrapFormat === "array") {
      return JSON.stringify(uuids, null, 2);
    }
    return uuids.join("\n");
  }, [uuids, wrapFormat]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopiedKey("all");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const handleCopySingle = (id: string, index: number) => {
    navigator.clipboard.writeText(id);
    setCopiedKey(index.toString());
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedOutput], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids_${quantity}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Inspector validation
  const inspectedData = useMemo(() => {
    const clean = inspectInput.trim().replace(/[{}"']/g, "");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-([89ab])[0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isNil = clean === "00000000-0000-0000-0000-000000000000";
    const match = clean.match(uuidRegex);

    if (isNil) {
      return {
        isValid: true,
        version: "Nil UUID (Special Empty UUID)",
        variant: "N/A",
        clean,
      };
    }

    if (!match) {
      // Check if 32-char unhyphenated hex
      if (/^[0-9a-f]{32}$/i.test(clean)) {
        const hyphenated = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
        return {
          isValid: true,
          version: `Version ${clean.charAt(12)} (Unhyphenated)`,
          variant: "RFC 4122 / DCE 1.1",
          clean: hyphenated,
        };
      }
      return { isValid: false, version: "Unknown", variant: "Unknown", clean };
    }

    const versionNum = match[1];
    let versionDesc = `Version ${versionNum}`;
    if (versionNum === "4") versionDesc = "Version 4 (Cryptographically Random)";
    else if (versionNum === "1") versionDesc = "Version 1 (Timestamp & Node MAC)";
    else if (versionNum === "3") versionDesc = "Version 3 (MD5 Namespace)";
    else if (versionNum === "5") versionDesc = "Version 5 (SHA-1 Namespace)";

    return {
      isValid: true,
      version: versionDesc,
      variant: "RFC 4122 (Leach-Salz)",
      clean,
    };
  }, [inspectInput]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "generator"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="h-4 w-4 text-emerald-600" />
            UUID / GUID Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("validator")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "validator"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="h-4 w-4 text-blue-600" />
            UUID Validator & Inspector
          </button>
        </div>
      </div>

      {activeTab === "generator" && (
        <div className="space-y-6">
          {/* Options & Controls */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Bulk UUID / GUID Generator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate RFC 4122 compliant unique identifiers using Web Crypto API.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copiedKey === "all" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === "all" ? "Copied All!" : "Copy All"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  UUID Version
                </label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="v4">UUID v4 (Random)</option>
                  <option value="v1">UUID v1 (Time-based)</option>
                  <option value="short">Short ID (NanoID)</option>
                  <option value="nil">Nil UUID (Zeros)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={1}>1 ID</option>
                  <option value={5}>5 IDs</option>
                  <option value={10}>10 IDs</option>
                  <option value={25}>25 IDs</option>
                  <option value={50}>50 IDs</option>
                  <option value={100}>100 IDs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Casing
                </label>
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIsUppercase(false)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold ${
                      !isUppercase ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    lower
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUppercase(true)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold ${
                      isUppercase ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    UPPER
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Hyphens
                </label>
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIncludeHyphens(true)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold ${
                      includeHyphens ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    With
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeHyphens(false)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold ${
                      !includeHyphens ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    None
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Wrapping
                </label>
                <select
                  value={wrapFormat}
                  onChange={(e) => setWrapFormat(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="none">Plain Text</option>
                  <option value="quotes">"Quotes",</option>
                  <option value="braces">&#123;Braces&#125;</option>
                  <option value="array">JSON Array</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2.5">
              <span>Generated Output ({uuids.length})</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Crypto.getRandomValues
              </span>
            </div>

            <div className="space-y-2">
              {uuids.map((id, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="font-mono text-[11px] text-slate-400 w-6 text-right">
                      {index + 1}.
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {id}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySingle(id, index)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white transition-colors"
                    title="Copy UUID"
                  >
                    {copiedKey === index.toString() ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Validator & Inspector */}
      {activeTab === "validator" && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              UUID / GUID Validator & Inspector
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Check if an identifier is valid RFC 4122 syntax and inspect its version and variant bits.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Paste Any UUID Here
            </label>
            <input
              type="text"
              value={inspectInput}
              onChange={(e) => setInspectInput(e.target.value)}
              placeholder="e.g. 4a1f3c82-9e45-42d1-817c-b63920c8de15"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 font-mono text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div
            className={`rounded-2xl border p-6 space-y-4 ${
              inspectedData.isValid
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-rose-50/70 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2">
              {inspectedData.isValid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-900">Valid RFC 4122 UUID</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                  <span className="font-bold text-sm text-rose-900">Invalid UUID Format</span>
                </>
              )}
            </div>

            <div className="divide-y divide-slate-200/60 text-xs sm:text-sm">
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Standard Hyphenated:</span>
                <span className="font-mono font-bold">{inspectedData.clean}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Version:</span>
                <span className="font-bold">{inspectedData.version}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Variant:</span>
                <span className="font-bold">{inspectedData.variant}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
