"use client";

import { useState } from "react";
import { Search, Monitor, Smartphone, Copy, Check, Sparkles, Globe, Star, Calendar } from "lucide-react";

export function SerpSnippetPreviewTool() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [title, setTitle] = useState("10 Best Design Tools for Modern Web Developers (2026)");
  const [description, setDescription] = useState(
    "Explore the top web design and SEO utilities of 2026. Compare visual builders, color checkers, grid generators, and schema tools for maximum efficiency."
  );
  const [url, setUrl] = useState("https://iformat.io/blog/best-design-tools");
  const [siteName, setSiteName] = useState("iformat.io");
  const [highlightKeyword, setHighlightKeyword] = useState("design tools");
  const [showRating, setShowRating] = useState(true);
  const [ratingVal, setRatingVal] = useState("4.9");
  const [reviewsCount, setReviewsCount] = useState("142");
  const [showDate, setShowDate] = useState(true);
  const [dateStr, setDateStr] = useState("Oct 28, 2026");
  const [copied, setCopied] = useState(false);

  // Approximate Google pixel calculation (avg char width ~9.5px in Arial 20px)
  const titlePixels = Math.round(title.length * 9.5);
  const maxTitlePixels = 600;
  const isTitleOver = titlePixels > maxTitlePixels;

  const descChars = description.length;
  const maxDescChars = 160;
  const isDescOver = descChars > maxDescChars;

  // URL breadcrumb formatting
  let displayDomain = "example.com";
  let displayBreadcrumb = "";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    displayDomain = parsed.hostname;
    displayBreadcrumb = parsed.pathname.split("/").filter(Boolean).join(" › ");
  } catch {
    displayDomain = url;
  }

  // Highlight keywords in preview
  const renderHighlighted = (text: string) => {
    if (!highlightKeyword.trim()) return text;
    const parts = text.split(new RegExp(`(${highlightKeyword.trim()})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightKeyword.trim().toLowerCase() ? (
        <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const htmlTags = `<!-- Primary SEO Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />`;

  const copyTags = () => {
    navigator.clipboard.writeText(htmlTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Device Toggle & Preset Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">SERP Preview Mode:</span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                device === "desktop"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                device === "mobile"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showRating}
              onChange={(e) => setShowRating(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            Rich Snippet (Stars)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            Publish Date
          </label>
        </div>
      </div>

      {/* Main Grid: Form Inputs vs SERP Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Snippet Fields
            </h3>

            {/* Title Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Page SEO Title</label>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isTitleOver ? "text-rose-600" : "text-slate-500"
                  }`}
                >
                  {title.length} chars (~{titlePixels}px / 600px max)
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title tag..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  isTitleOver
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
              />
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTitleOver ? "bg-rose-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, (titlePixels / maxTitlePixels) * 100)}%` }}
                />
              </div>
            </div>

            {/* Meta Description Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Meta Description</label>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isDescOver ? "text-amber-600" : "text-slate-500"
                  }`}
                >
                  {descChars} / {maxDescChars} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter meta description tag..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  isDescOver
                    ? "border-amber-400 focus:ring-amber-500"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
              />
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDescOver ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (descChars / maxDescChars) * 100)}%` }}
                />
              </div>
            </div>

            {/* URL & Site Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Focus Keyword & Rich Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Focus Keyword (Bold Test)
                </label>
                <input
                  type="text"
                  value={highlightKeyword}
                  onChange={(e) => setHighlightKeyword(e.target.value)}
                  placeholder="e.g. design tools"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
              {showRating && (
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rating (1-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={ratingVal}
                      onChange={(e) => setRatingVal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vote Count
                    </label>
                    <input
                      type="text"
                      value={reviewsCount}
                      onChange={(e) => setReviewsCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live SERP Mockup Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Google {device === "desktop" ? "Desktop Search Result" : "Mobile Search Result"}
              </span>
              <span className="text-[11px] text-slate-400">Authentic UI Simulation</span>
            </div>

            {/* The Google Card Mockup */}
            <div
              className={`p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 transition-all ${
                device === "mobile" ? "max-w-sm mx-auto shadow-md" : "w-full"
              }`}
            >
              {/* Favicon & Breadcrumb Header */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] text-slate-900 dark:text-slate-200 font-normal leading-tight truncate">
                    {siteName || displayDomain}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate leading-tight font-mono">
                    {displayDomain} {displayBreadcrumb ? `› ${displayBreadcrumb}` : ""}
                  </div>
                </div>
              </div>

              {/* Blue Clickable Title */}
              <h3 className="text-[20px] font-normal leading-snug cursor-pointer hover:underline text-[#1a0dab] dark:text-[#8ab4f8] pt-1">
                {title || "Untitled Document"}
              </h3>

              {/* Rich Snippet Rating Stars */}
              {showRating && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 my-1">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rating: {ratingVal}/5
                  </span>
                  <span>· {reviewsCount} reviews</span>
                </div>
              )}

              {/* Snippet Description */}
              <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed pt-1">
                {showDate && (
                  <span className="text-slate-500 dark:text-slate-400 mr-1.5 text-[13px]">
                    {dateStr} —
                  </span>
                )}
                {renderHighlighted(description || "No description provided.")}
              </p>
            </div>

            {/* Status alerts */}
            <div className="mt-4 space-y-2">
              {isTitleOver && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <span className="font-bold shrink-0">⚠️ Title Warning:</span>
                  <span>
                    Your title exceeds Google's ~600px desktop display limit and may be truncated with ellipses (...) on search pages.
                  </span>
                </div>
              )}
              {isDescOver && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="font-bold shrink-0">ℹ️ Description Note:</span>
                  <span>
                    Snippet exceeds 160 characters. Mobile devices generally truncate after 120-150 characters.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Code Copy Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">HTML Head Tags</h4>
              <button
                onClick={copyTags}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Tags!" : "Copy Meta Tags"}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 text-blue-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <code>{htmlTags}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
