"use client";

import { useState } from "react";
import { Network, Copy, Check, Download, Plus, Trash2, Sparkles, FileText } from "lucide-react";

interface SitemapEntry {
  id: string;
  url: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

const DEFAULT_URLS: SitemapEntry[] = [
  { id: "1", url: "https://iformat.io/", lastmod: "2026-10-30", changefreq: "daily", priority: "1.0" },
  { id: "2", url: "https://iformat.io/image-tools", lastmod: "2026-10-30", changefreq: "weekly", priority: "0.9" },
  { id: "3", url: "https://iformat.io/pdf-tools", lastmod: "2026-10-30", changefreq: "weekly", priority: "0.9" },
  { id: "4", url: "https://iformat.io/seo-tools", lastmod: "2026-10-30", changefreq: "weekly", priority: "0.9" },
  { id: "5", url: "https://iformat.io/about", lastmod: "2026-10-15", changefreq: "monthly", priority: "0.5" },
];

export function XmlSitemapGeneratorTool() {
  const [entries, setEntries] = useState<SitemapEntry[]>(DEFAULT_URLS);
  const [mode, setMode] = useState<"visual" | "bulk">("visual");
  const [bulkText, setBulkText] = useState(
    "https://example.com/\nhttps://example.com/blog\nhttps://example.com/about\nhttps://example.com/contact"
  );
  const [defaultFreq, setDefaultFreq] = useState<SitemapEntry["changefreq"]>("weekly");
  const [defaultPriority, setDefaultPriority] = useState("0.8");
  const [copied, setCopied] = useState(false);

  // New URL input
  const [newUrl, setNewUrl] = useState("");
  const [newFreq, setNewFreq] = useState<SitemapEntry["changefreq"]>("weekly");
  const [newPriority, setNewPriority] = useState("0.8");

  const addUrl = () => {
    if (!newUrl.trim()) return;
    const formattedUrl = newUrl.startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`;
    const nextEntry: SitemapEntry = {
      id: String(Date.now()),
      url: formattedUrl,
      lastmod: "2026-10-30",
      changefreq: newFreq,
      priority: newPriority,
    };
    setEntries((prev) => [...prev, nextEntry]);
    setNewUrl("");
  };

  const removeUrl = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleBulkImport = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const newItems: SitemapEntry[] = lines.map((line, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: line.startsWith("http") ? line : `https://${line}`,
      lastmod: "2026-10-30",
      changefreq: defaultFreq,
      priority: defaultPriority,
    }));
    if (newItems.length > 0) {
      setEntries(newItems);
      setMode("visual");
    }
  };

  // Build XML String
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemapXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: "application/xml;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">XML Sitemap Builder:</span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode("visual")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mode === "visual"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Visual URL List ({entries.length})
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mode === "bulk"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Bulk Import
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy XML"}
          </button>
          <button
            onClick={downloadSitemap}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download sitemap.xml
          </button>
        </div>
      </div>

      {/* Main Grid: Management vs XML Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* URL Management Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            {mode === "visual" ? (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Manage URL Entries
                </h3>

                {/* Add new URL form */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Add Page URL
                    </label>
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/new-page"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Change Frequency
                      </label>
                      <select
                        value={newFreq}
                        onChange={(e) => setNewFreq(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      >
                        <option value="always">always</option>
                        <option value="hourly">hourly</option>
                        <option value="daily">daily</option>
                        <option value="weekly">weekly</option>
                        <option value="monthly">monthly</option>
                        <option value="yearly">yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Priority (0.1 - 1.0)
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      >
                        <option value="1.0">1.0 (Homepage / Main)</option>
                        <option value="0.9">0.9 (Primary category)</option>
                        <option value="0.8">0.8 (Important pages)</option>
                        <option value="0.7">0.7 (Standard articles)</option>
                        <option value="0.5">0.5 (Utility / About)</option>
                        <option value="0.3">0.3 (Low priority)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={addUrl}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add URL to Sitemap
                  </button>
                </div>

                {/* Existing URLs list */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {entries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-slate-900 dark:text-slate-100 truncate font-semibold">
                          {item.url}
                        </div>
                        <div className="flex gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>Freq: {item.changefreq}</span>
                          <span>Priority: {item.priority}</span>
                          <span>Modified: {item.lastmod}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUrl(item.id)}
                        className="text-slate-400 hover:text-rose-500 shrink-0 p-1"
                        title="Remove URL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Bulk Import Mode */
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Bulk Paste URLs
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paste one URL per line
                  </label>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Default Frequency
                    </label>
                    <select
                      value={defaultFreq}
                      onChange={(e) => setDefaultFreq(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="weekly">weekly</option>
                      <option value="daily">daily</option>
                      <option value="monthly">monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Default Priority
                    </label>
                    <select
                      value={defaultPriority}
                      onChange={(e) => setDefaultPriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="0.8">0.8</option>
                      <option value="0.9">0.9</option>
                      <option value="1.0">1.0</option>
                      <option value="0.5">0.5</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleBulkImport}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Generate Sitemap from List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live XML Output Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Valid XML Sitemaps 0.9</h4>
              <span className="text-xs text-slate-400 font-mono">{entries.length} URLs included</span>
            </div>

            <textarea
              readOnly
              rows={16}
              value={sitemapXml}
              className="w-full p-4 rounded-2xl bg-slate-950 text-amber-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
