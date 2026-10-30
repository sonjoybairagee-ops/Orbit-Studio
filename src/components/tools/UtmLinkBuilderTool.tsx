"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Link2, Copy, Check, Sparkles, RotateCcw, QrCode as QrIcon, Sliders, ExternalLink } from "lucide-react";

const PRESET_CAMPAIGNS = [
  {
    name: "Google Ads (CPC)",
    source: "google",
    medium: "cpc",
    campaign: "search_brand_2026",
    term: "online+file+converter",
    content: "headline_v1",
  },
  {
    name: "Email Newsletter",
    source: "newsletter",
    medium: "email",
    campaign: "october_product_update",
    term: "",
    content: "cta_button_top",
  },
  {
    name: "Facebook / Instagram Ad",
    source: "facebook",
    medium: "paid_social",
    campaign: "q4_lead_generation",
    term: "",
    content: "carousel_ad_3",
  },
  {
    name: "Affiliate Referral",
    source: "affiliate_partner",
    medium: "affiliate",
    campaign: "partner_launch",
    term: "partner_id_89",
    content: "sidebar_banner",
  },
];

export function UtmLinkBuilderTool() {
  const [websiteUrl, setWebsiteUrl] = useState("https://iformat.io/tools");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("spring_launch_2026");
  const [term, setTerm] = useState("best+seo+tools");
  const [content, setContent] = useState("header_link");
  const [utmId, setUtmId] = useState("");

  const [autoLowercase, setAutoLowercase] = useState(true);
  const [spaceSeparator, setSpaceSeparator] = useState<"-" | "_" | "+">("-");
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

  const sanitizeVal = (str: string) => {
    let clean = str.trim();
    if (autoLowercase) clean = clean.toLowerCase();
    return clean.replace(/\s+/g, spaceSeparator);
  };

  // Build the final tagged URL
  const buildFinalUrl = () => {
    if (!websiteUrl.trim()) return "";
    try {
      const base = websiteUrl.startsWith("http") ? websiteUrl.trim() : `https://${websiteUrl.trim()}`;
      const urlObj = new URL(base);

      if (source) urlObj.searchParams.set("utm_source", sanitizeVal(source));
      if (medium) urlObj.searchParams.set("utm_medium", sanitizeVal(medium));
      if (campaign) urlObj.searchParams.set("utm_campaign", sanitizeVal(campaign));
      if (term) urlObj.searchParams.set("utm_term", sanitizeVal(term));
      if (content) urlObj.searchParams.set("utm_content", sanitizeVal(content));
      if (utmId) urlObj.searchParams.set("utm_id", sanitizeVal(utmId));

      return urlObj.toString();
    } catch {
      return websiteUrl;
    }
  };

  const finalUrl = buildFinalUrl();

  // Generate QR code safely inside useEffect
  useEffect(() => {
    if (finalUrl) {
      QRCode.toDataURL(finalUrl, { width: 220, margin: 2 })
        .then((data) => setQrCodeDataUrl(data))
        .catch(() => setQrCodeDataUrl(""));
    }
  }, [finalUrl]);

  const copyUrl = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: (typeof PRESET_CAMPAIGNS)[0]) => {
    setSource(preset.source);
    setMedium(preset.medium);
    setCampaign(preset.campaign);
    setTerm(preset.term);
    setContent(preset.content);
  };

  return (
    <div className="space-y-8">
      {/* Top Presets Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Quick Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_CAMPAIGNS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters vs Result Link */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Campaign Parameters (GA4)
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Source (utm_source) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. google, newsletter, twitter"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Medium (utm_medium) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. cpc, email, banner, social"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Name (utm_campaign) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. black_friday_2026, webinar_signups"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Term (utm_term)
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Paid keyword"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Content (utm_content)
                </label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Creative variant / A-B test"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Sanitization Options */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={autoLowercase}
                  onChange={(e) => setAutoLowercase(e.target.checked)}
                  className="accent-violet-600 rounded"
                />
                Force Lowercase
              </label>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>Space character:</span>
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  {(["-", "_", "+"] as const).map((sep) => (
                    <button
                      key={sep}
                      onClick={() => setSpaceSeparator(sep)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                        spaceSeparator === sep
                          ? "bg-violet-600 text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {sep}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Tracking URL Output Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Generated Tracking Link</h4>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/20 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied URL!" : "Copy Link"}
              </button>
            </div>

            {/* Clickable / Copyable URL display */}
            <div className="p-4 rounded-2xl bg-slate-950 text-violet-300 font-mono text-xs break-all leading-relaxed border border-slate-800">
              {finalUrl}
            </div>

            {/* Parameter Breakdown Badge Pills */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Parameters Decoded
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">Source</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {source || "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">Medium</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {medium || "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">Campaign</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {campaign || "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 text-[11px] block">Content</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {content || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Toggle for print/offline campaigns */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowQr(!showQr)}
                className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <QrIcon className="w-4 h-4" />
                {showQr ? "Hide Campaign QR Code" : "Show Campaign QR Code"}
              </button>

              {showQr && qrCodeDataUrl && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                  <img src={qrCodeDataUrl} alt="Campaign QR Code" className="w-44 h-44 rounded-xl shadow-xs" />
                  <span className="text-[11px] text-slate-500 mt-2 font-mono">
                    Scan to open tracking link on mobile
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
