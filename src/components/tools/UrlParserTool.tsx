"use client";

import { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Plus,
  Sparkles,
  ExternalLink,
  Code,
  FileCode,
} from "lucide-react";

const SAMPLE_URL =
  "https://admin:secret@api.toolhub.io:8443/v2/products/search?query=react+developer&sort=rating_desc&page=2&filter=active&utm_source=newsletter&utm_medium=email&fbclid=IwAR2XYZ#review-summary";

interface ParamRow {
  key: string;
  value: string;
  enabled: boolean;
}

export default function UrlParserTool() {
  const [rawUrl, setRawUrl] = useState<string>(SAMPLE_URL);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [urlParams, setUrlParams] = useState<ParamRow[]>(() => [
    { key: "query", value: "react developer", enabled: true },
    { key: "sort", value: "rating_desc", enabled: true },
    { key: "page", value: "2", enabled: true },
    { key: "filter", value: "active", enabled: true },
    { key: "utm_source", value: "newsletter", enabled: true },
    { key: "utm_medium", value: "email", enabled: true },
    { key: "fbclid", value: "IwAR2XYZ", enabled: true },
  ]);

  // Parse URL components using standard URL web API
  const parsedUrl = useMemo(() => {
    try {
      const u = new URL(rawUrl.trim());
      const pathSegments = u.pathname.split("/").filter(Boolean);

      return {
        isValid: true,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? "443" : u.protocol === "http:" ? "80" : ""),
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        origin: u.origin,
        username: u.username,
        password: u.password,
        pathSegments,
        isSecure: u.protocol === "https:",
      };
    } catch {
      return {
        isValid: false,
        protocol: "",
        hostname: "",
        port: "",
        pathname: "",
        search: "",
        hash: "",
        origin: "",
        username: "",
        password: "",
        pathSegments: [],
        isSecure: false,
      };
    }
  }, [rawUrl]);

  // Sync params when rawUrl is modified by user typing
  const handleRawUrlChange = (newVal: string) => {
    setRawUrl(newVal);
    try {
      const u = new URL(newVal.trim());
      const rows: ParamRow[] = [];
      u.searchParams.forEach((val, key) => {
        rows.push({ key, value: val, enabled: true });
      });
      setUrlParams(rows);
    } catch {}
  };

  // Reconstruct URL from current params
  const updateUrlFromParams = (updatedParams: ParamRow[]) => {
    setUrlParams(updatedParams);
    try {
      const u = new URL(rawUrl.trim());
      // clear search params
      const keys = Array.from(u.searchParams.keys());
      keys.forEach((k) => u.searchParams.delete(k));

      // append enabled params
      updatedParams.forEach((p) => {
        if (p.enabled && p.key.trim()) {
          u.searchParams.append(p.key.trim(), p.value);
        }
      });
      setRawUrl(u.toString());
    } catch {}
  };

  // Add param row
  const handleAddParam = () => {
    const updated = [...urlParams, { key: "new_param", value: "value", enabled: true }];
    updateUrlFromParams(updated);
  };

  // Delete param row
  const handleDeleteParam = (idx: number) => {
    const updated = urlParams.filter((_, i) => i !== idx);
    updateUrlFromParams(updated);
  };

  // Toggle param row
  const handleToggleParam = (idx: number) => {
    const updated = urlParams.map((p, i) =>
      i === idx ? { ...p, enabled: !p.enabled } : p
    );
    updateUrlFromParams(updated);
  };

  // Update param field
  const handleEditParam = (idx: number, field: "key" | "value", val: string) => {
    const updated = urlParams.map((p, i) =>
      i === idx ? { ...p, [field]: val } : p
    );
    updateUrlFromParams(updated);
  };

  // Strip tracking parameters (UTM, Facebook, Google, Mailchimp)
  const handleStripTracking = () => {
    const trackingRegex = /^(utm_|fbclid|gclid|_ga|mc_eid|ref|source)/i;
    const updated = urlParams.filter((p) => !trackingRegex.test(p.key));
    updateUrlFromParams(updated);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // JSON representation of query params
  const queryJson = useMemo(() => {
    const obj: Record<string, string> = {};
    urlParams.forEach((p) => {
      if (p.enabled && p.key.trim()) obj[p.key.trim()] = p.value;
    });
    return JSON.stringify(obj, null, 2);
  }, [urlParams]);

  return (
    <div className="space-y-6">
      {/* URL Input Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                URL Parser & Query String Studio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deconstruct URLs, inspect ports and protocols, and edit query strings with real-time synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStripTracking}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Strip Tracking (UTM)
            </button>
            <button
              type="button"
              onClick={() => handleCopy(rawUrl, "url")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              {copiedKey === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === "url" ? "Copied URL!" : "Copy Clean URL"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Full Target URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={rawUrl}
              onChange={(e) => handleRawUrlChange(e.target.value)}
              placeholder="https://example.com/path?key=value"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 px-4 font-mono text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {parsedUrl.isValid ? (
        <div className="space-y-6">
          {/* Component Breakdown Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protocol</span>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900">
                {parsedUrl.isSecure ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                )}
                <span>{parsedUrl.protocol}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hostname</span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate" title={parsedUrl.hostname}>
                {parsedUrl.hostname}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Port</span>
              <div className="font-mono text-sm font-bold text-slate-900">
                {parsedUrl.port || "None"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Path Length</span>
              <div className="font-mono text-sm font-bold text-slate-900">
                {parsedUrl.pathSegments.length} segments
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Params</span>
              <div className="font-mono text-sm font-bold text-blue-600">
                {urlParams.filter((p) => p.enabled).length} active
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hash / Anchor</span>
              <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate" title={parsedUrl.hash}>
                {parsedUrl.hash || "None"}
              </div>
            </div>
          </div>

          {/* Path Hierarchy & Auth Details */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Path Segments & Origin
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 px-3 py-1.5 border border-slate-200">
                {parsedUrl.origin}
              </span>
              {parsedUrl.pathSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">/</span>
                  <span className="rounded-xl bg-blue-50 font-mono text-xs font-bold text-blue-700 px-3 py-1.5 border border-blue-200/60">
                    {seg}
                  </span>
                </div>
              ))}
              {parsedUrl.hash && (
                <span className="rounded-xl bg-purple-50 font-mono text-xs font-bold text-purple-700 px-3 py-1.5 border border-purple-200/60 ml-2">
                  {parsedUrl.hash}
                </span>
              )}
            </div>

            {(parsedUrl.username || parsedUrl.password) && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center gap-3">
                <span className="font-bold">Credentials in URL:</span>
                <span className="font-mono">User: {parsedUrl.username}</span>
                <span className="font-mono">Password: {parsedUrl.password ? "••••••" : "None"}</span>
              </div>
            )}
          </div>

          {/* Interactive Query Parameters Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Query Parameters Studio</h3>
                <p className="text-xs text-slate-500">
                  Toggle, modify, or add query string parameters. Changes automatically update the URL.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Parameter
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(queryJson, "json")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copiedKey === "json" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Code className="h-3.5 w-3.5" />}
                  {copiedKey === "json" ? "Copied JSON!" : "Copy as JSON"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 w-12 text-center">Active</th>
                    <th className="py-3 px-4 w-1/3">Key / Parameter</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4 w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {urlParams.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No query parameters in this URL. Click &quot;Add Parameter&quot; to append one.
                      </td>
                    </tr>
                  ) : (
                    urlParams.map((p, idx) => (
                      <tr key={idx} className={p.enabled ? "hover:bg-slate-50/60" : "opacity-40 bg-slate-50/30"}>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.enabled}
                            onChange={() => handleToggleParam(idx)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={p.key}
                            onChange={(e) => handleEditParam(idx, "key", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            value={p.value}
                            onChange={(e) => handleEditParam(idx, "value", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteParam(idx)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete parameter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-2">
          <h3 className="text-base font-bold text-rose-900">Invalid URL Format</h3>
          <p className="text-xs text-rose-700">
            Please make sure the URL includes a valid protocol (e.g. <code>https://</code> or <code>http://</code>).
          </p>
        </div>
      )}
    </div>
  );
}
