"use client";

import { useState } from "react";
import { Tag, Copy, Check, RotateCcw, Sparkles, Globe, Share2, ShieldCheck, Code2 } from "lucide-react";

export function MetaTagGeneratorTool() {
  const [activeTab, setActiveTab] = useState<"primary" | "social" | "robots">("primary");
  const [outputFormat, setOutputFormat] = useState<"html" | "nextjs">("html");
  const [copied, setCopied] = useState(false);

  // Primary SEO fields
  const [siteTitle, setSiteTitle] = useState("ToolHub — Free Online Browser File Tools");
  const [description, setDescription] = useState(
    "Free, fast, and 100% private browser tools. Compress images, merge PDFs, generate CSS grids, format subtitles, and optimize SEO."
  );
  const [keywords, setKeywords] = useState("file tools, pdf editor, image compressor, css grid generator, seo tools");
  const [author, setAuthor] = useState("ToolHub Team");
  const [canonicalUrl, setCanonicalUrl] = useState("https://iformat.io");
  const [language, setLanguage] = useState("English");
  const [charset, setCharset] = useState("UTF-8");

  // Social / Open Graph & Twitter
  const [ogTitle, setOgTitle] = useState("CompX Orbit — Free Online Creative Tools");
  const [ogDescription, setOgDescription] = useState(
    "Fast, secure online utilities for video creators, editors, and designers. 100% Free."
  );
  const [ogImage, setOgImage] = useState("https://iformat.io/og-cover.png");
  const [ogType, setOgType] = useState("website");
  const [siteName, setSiteName] = useState("ToolHub");
  const [twitterCard, setTwitterCard] = useState<"summary_large_image" | "summary">("summary_large_image");
  const [twitterHandle, setTwitterHandle] = useState("@toolhub_app");

  // Robots directives
  const [allowIndex, setAllowIndex] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);
  const [noarchive, setNoarchive] = useState(false);
  const [nosnippet, setNosnippet] = useState(false);
  const [maxImagePreview, setMaxImagePreview] = useState(true);

  const robotsDirective = [
    allowIndex ? "index" : "noindex",
    allowFollow ? "follow" : "nofollow",
    noarchive ? "noarchive" : "",
    nosnippet ? "nosnippet" : "",
    maxImagePreview ? "max-image-preview:large" : "",
  ]
    .filter(Boolean)
    .join(", ");

  // HTML Output
  const htmlOutput = `<!-- Primary Meta Tags -->
<title>${siteTitle}</title>
<meta name="title" content="${siteTitle}" />
<meta name="description" content="${description}" />
${keywords ? `<meta name="keywords" content="${keywords}" />\n` : ""}<meta name="author" content="${author}" />
<meta name="robots" content="${robotsDirective}" />
<link rel="canonical" href="${canonicalUrl}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${ogTitle || siteTitle}" />
<meta property="og:description" content="${ogDescription || description}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter / X -->
<meta property="twitter:card" content="${twitterCard}" />
<meta property="twitter:url" content="${canonicalUrl}" />
<meta property="twitter:title" content="${ogTitle || siteTitle}" />
<meta property="twitter:description" content="${ogDescription || description}" />
<meta property="twitter:image" content="${ogImage}" />
${twitterHandle ? `<meta name="twitter:site" content="${twitterHandle}" />\n<meta name="twitter:creator" content="${twitterHandle}" />` : ""}`;

  // Next.js Metadata Output
  const nextjsOutput = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${siteTitle}',
  description: '${description}',
  keywords: [${keywords.split(",").map((k) => `'${k.trim()}'`).join(", ")}],
  authors: [{ name: '${author}' }],
  alternates: {
    canonical: '${canonicalUrl}',
  },
  robots: {
    index: ${allowIndex},
    follow: ${allowFollow},
  },
  openGraph: {
    type: '${ogType}',
    url: '${canonicalUrl}',
    title: '${ogTitle || siteTitle}',
    description: '${ogDescription || description}',
    siteName: '${siteName}',
    images: [
      {
        url: '${ogImage}',
        width: 1200,
        height: 630,
        alt: '${ogTitle || siteTitle}',
      },
    ],
  },
  twitter: {
    card: '${twitterCard}',
    title: '${ogTitle || siteTitle}',
    description: '${ogDescription || description}',
    images: ['${ogImage}'],
    creator: '${twitterHandle}',
  },
};`;

  const copyCode = () => {
    navigator.clipboard.writeText(outputFormat === "html" ? htmlOutput : nextjsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDefaults = () => {
    setSiteTitle("ToolHub — Free Online Browser File Tools");
    setDescription("Free, fast, and 100% private browser tools.");
    setCanonicalUrl("https://iformat.io");
    setAllowIndex(true);
    setAllowFollow(true);
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("primary")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "primary"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            1. Primary SEO
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "social"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            2. Open Graph & Social
          </button>
          <button
            onClick={() => setActiveTab("robots")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "robots"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Robots Directives
          </button>
        </div>

        <button
          onClick={resetDefaults}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2.5 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            {/* TAB 1: Primary SEO */}
            {activeTab === "primary" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Primary Search Engine Tags
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Page Title (50-60 chars)
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Description (150-160 chars)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Author / Organization
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Keywords (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Social / Open Graph */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Open Graph & Twitter Cards
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    OG / Social Title
                  </label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    OG Image URL (1200×630px recommended)
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      OG Content Type
                    </label>
                    <select
                      value={ogType}
                      onChange={(e) => setOgType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                      <option value="product">product</option>
                      <option value="video.movie">video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Twitter Card Type
                    </label>
                    <select
                      value={twitterCard}
                      onChange={(e) => setTwitterCard(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                    >
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Twitter / X Handle
                    </label>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Robots Directives */}
            {activeTab === "robots" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Search Engine Crawler Directives
                </h3>
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Index Page</div>
                      <div className="text-[11px] text-slate-500">Allow search engines to index this page (index / noindex)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowIndex}
                      onChange={(e) => setAllowIndex(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Follow Links</div>
                      <div className="text-[11px] text-slate-500">Allow bots to crawl links on this page (follow / nofollow)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowFollow}
                      onChange={(e) => setAllowFollow(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Max Image Preview (Large)</div>
                      <div className="text-[11px] text-slate-500">Enable Google Discover and high-res image previews in SERPs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={maxImagePreview}
                      onChange={(e) => setMaxImagePreview(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">No Archive (noarchive)</div>
                      <div className="text-[11px] text-slate-500">Do not show cached version of this page</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={noarchive}
                      onChange={(e) => setNoarchive(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setOutputFormat("html")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    outputFormat === "html"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  HTML Tags
                </button>
                <button
                  onClick={() => setOutputFormat("nextjs")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    outputFormat === "nextjs"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Next.js App Router
                </button>
              </div>

              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Code!" : "Copy Code"}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[460px] overflow-y-auto">
              <code>{outputFormat === "html" ? htmlOutput : nextjsOutput}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
