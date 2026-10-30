"use client";

import { useState } from "react";
import { Share2, Copy, Check, Upload, Globe, MessageSquare } from "lucide-react";

export function OpenGraphPreviewTool() {
  const [platform, setPlatform] = useState<"facebook" | "twitter" | "linkedin" | "discord">("facebook");
  const [title, setTitle] = useState("CompX Orbit — The Ultimate Suite of Free Creative Tools");
  const [description, setDescription] = useState(
    "Supercharge your video and content workflow with 90+ free creative tools. 100% Free with zero registration and total privacy."
  );
  const [url, setUrl] = useState("https://compxorbit.com/tools");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80");
  const [siteName, setSiteName] = useState("ToolHub");
  const [copied, setCopied] = useState(false);

  // Extract domain
  let domain = "iformat.io";
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    domain = u.hostname;
  } catch {
    domain = url;
  }

  // Handle local image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ogTags = `<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${siteName}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />`;

  const copyTags = () => {
    navigator.clipboard.writeText(ogTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Platform Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">Social Platform:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlatform("facebook")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              platform === "facebook"
                ? "bg-[#1877F2] text-white border-[#1877F2] shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
          <button
            onClick={() => setPlatform("twitter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              platform === "twitter"
                ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </button>
          <button
            onClick={() => setPlatform("linkedin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              platform === "linkedin"
                ? "bg-[#0A66C2] text-white border-[#0A66C2] shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            LinkedIn
          </button>
          <button
            onClick={() => setPlatform("discord")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              platform === "discord"
                ? "bg-[#5865F2] text-white border-[#5865F2] shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Discord
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Card Content
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                og:title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                og:description
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
                og:url
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                og:image URL or Local File
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
                <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 text-cyan-600" />
                  <span>Upload test image from computer</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-xs text-cyan-800 dark:text-cyan-300 space-y-1">
              <div className="font-bold">📐 Optimal Social Media Dimensions:</div>
              <div>• Recommended resolution: <strong>1200 × 630 pixels</strong></div>
              <div>• Aspect ratio: <strong>1.91 : 1</strong></div>
              <div>• Maximum file size: <strong>&lt; 8 MB</strong></div>
            </div>
          </div>
        </div>

        {/* Live Social Card Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              {platform.toUpperCase()} Live Sharing Card Preview
            </h4>

            {/* FACEBOOK PREVIEW */}
            {platform === "facebook" && (
              <div className="max-w-lg mx-auto rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-[#F0F2F5] dark:bg-slate-950 shadow-md">
                <div className="w-full h-56 bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">
                    {domain}
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-0.5">
                    {title}
                  </div>
                  <div className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-1">
                    {description}
                  </div>
                </div>
              </div>
            )}

            {/* TWITTER / X PREVIEW */}
            {platform === "twitter" && (
              <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black text-white shadow-md">
                <div className="w-full h-56 bg-slate-800 overflow-hidden relative">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-semibold text-slate-200">
                    {domain}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-950">
                  <div className="text-[14px] font-bold text-white line-clamp-1">
                    {title}
                  </div>
                  <div className="text-[12px] text-slate-400 line-clamp-2 mt-1">
                    {description}
                  </div>
                </div>
              </div>
            )}

            {/* LINKEDIN PREVIEW */}
            {platform === "linkedin" && (
              <div className="max-w-lg mx-auto rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md">
                <div className="w-full h-56 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1">
                    {title}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {domain}
                  </div>
                </div>
              </div>
            )}

            {/* DISCORD PREVIEW */}
            {platform === "discord" && (
              <div className="max-w-lg mx-auto p-4 rounded-xl bg-[#313338] text-white shadow-md">
                <div className="border-l-4 border-[#5865F2] pl-3 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-semibold">{siteName}</div>
                  <div className="text-[14px] font-bold text-[#00A8FC] hover:underline cursor-pointer line-clamp-1">
                    {title}
                  </div>
                  <div className="text-[12px] text-slate-300 line-clamp-2">{description}</div>
                  <div className="pt-2">
                    <img src={imageUrl} alt={title} className="rounded-lg max-h-48 w-full object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Tag Snippet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Open Graph Meta Tags</h4>
              <button
                onClick={copyTags}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied Tags!" : "Copy OG Tags"}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <code>{ogTags}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
