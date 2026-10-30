"use client";

import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  Target,
  Copy,
  Check,
  Download,
  QrCode as QrIcon,
  Sparkles,
  RotateCcw,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const CHANNEL_PRESETS = [
  {
    name: "Google Search (CPC)",
    source: "google",
    medium: "cpc",
    campaign: "q4_search_promo",
    content: "responsive_search_ad",
  },
  {
    name: "Meta / Facebook Ads",
    source: "facebook",
    medium: "paid_social",
    campaign: "q4_retargeting",
    content: "carousel_v2",
  },
  {
    name: "Instagram Story",
    source: "instagram",
    medium: "story_ad",
    campaign: "flash_sale",
    content: "swipe_up_video",
  },
  {
    name: "TikTok Ads",
    source: "tiktok",
    medium: "video_ad",
    campaign: "spark_ads_creator",
    content: "ugc_hook_1",
  },
  {
    name: "LinkedIn Sponsored",
    source: "linkedin",
    medium: "sponsored_content",
    campaign: "b2b_lead_gen",
    content: "single_image_cta",
  },
  {
    name: "Email Newsletter",
    source: "newsletter",
    medium: "email",
    campaign: "monthly_roundup",
    content: "hero_cta_button",
  },
  {
    name: "YouTube Sponsor",
    source: "youtube",
    medium: "influencer",
    campaign: "tech_review_partnership",
    content: "pinned_comment_link",
  },
];

export default function CampaignUrlBuilderTool() {
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  // Single URL inputs
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://yourbrand.com/products/pro");
  const [source, setSource] = useState<string>("google");
  const [medium, setMedium] = useState<string>("cpc");
  const [campaign, setCampaign] = useState<string>("winter_sale_2026");
  const [term, setTerm] = useState<string>("best productivity tools");
  const [content, setContent] = useState<string>("banner_blue_variant_a");
  const [utmId, setUtmId] = useState<string>("");

  const [autoLowercase, setAutoLowercase] = useState<boolean>(true);
  const [spaceSeparator, setSpaceSeparator] = useState<"-" | "_" | "+">("-");
  const [copiedKey, setCopiedKey] = useState<string>("");

  // QR Code State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQr, setShowQr] = useState<boolean>(false);

  // Batch URLs input
  const [batchUrls, setBatchUrls] = useState<string>(
    "https://yourbrand.com/products/tool-a\nhttps://yourbrand.com/products/tool-b\nhttps://yourbrand.com/pricing"
  );

  const cleanParam = (val: string) => {
    let clean = val.trim();
    if (autoLowercase) clean = clean.toLowerCase();
    return clean.replace(/\s+/g, spaceSeparator);
  };

  // Build Single URL
  const campaignUrl = useMemo(() => {
    let base = websiteUrl.trim();
    if (!base) return "";
    if (!/^https?:\/\//i.test(base)) {
      base = `https://${base}`;
    }

    try {
      const url = new URL(base);
      if (source.trim()) url.searchParams.set("utm_source", cleanParam(source));
      if (medium.trim()) url.searchParams.set("utm_medium", cleanParam(medium));
      if (campaign.trim()) url.searchParams.set("utm_campaign", cleanParam(campaign));
      if (term.trim()) url.searchParams.set("utm_term", cleanParam(term));
      if (content.trim()) url.searchParams.set("utm_content", cleanParam(content));
      if (utmId.trim()) url.searchParams.set("utm_id", cleanParam(utmId));
      return url.toString();
    } catch {
      return base;
    }
  }, [websiteUrl, source, medium, campaign, term, content, utmId, autoLowercase, spaceSeparator]);

  // Batch Generation Result
  const batchResult = useMemo(() => {
    const lines = batchUrls.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      let base = line.trim();
      if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
      try {
        const u = new URL(base);
        if (source.trim()) u.searchParams.set("utm_source", cleanParam(source));
        if (medium.trim()) u.searchParams.set("utm_medium", cleanParam(medium));
        if (campaign.trim()) u.searchParams.set("utm_campaign", cleanParam(campaign));
        if (term.trim()) u.searchParams.set("utm_term", cleanParam(term));
        if (content.trim()) u.searchParams.set("utm_content", cleanParam(content));
        return u.toString();
      } catch {
        return base;
      }
    });
  }, [batchUrls, source, medium, campaign, term, content, autoLowercase, spaceSeparator]);

  // Generate QR code whenever campaignUrl changes
  useEffect(() => {
    if (!campaignUrl) return;
    QRCode.toDataURL(campaignUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((dataUri) => setQrCodeUrl(dataUri))
      .catch(() => {});
  }, [campaignUrl]);

  const handleApplyPreset = (preset: (typeof CHANNEL_PRESETS)[0]) => {
    setSource(preset.source);
    setMedium(preset.medium);
    setCampaign(preset.campaign);
    setContent(preset.content);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "single"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="h-4 w-4 text-rose-600" />
            Single URL Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("batch")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "batch"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4 text-blue-600" />
            Batch Multi-Link Generator
          </button>
        </div>
      </div>

      {/* Preset Channel Pills */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Channel Presets
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {CHANNEL_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700 transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Parameters Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Campaign Parameters (GA4 & Ad Networks)
          </h2>

          {activeTab === "single" ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 font-mono text-xs sm:text-sm font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Paste Landing Pages (One per line)
              </label>
              <textarea
                rows={4}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-xs text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign Source (utm_source) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. google, newsletter, tiktok"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign Medium (utm_medium) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="e.g. cpc, email, social, referral"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign Name (utm_campaign) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. spring_launch_2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign Term (utm_term)
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Paid search keywords"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign Content (utm_content)
              </label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="A/B test ad variation / link position"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Campaign ID (utm_id)
              </label>
              <input
                type="text"
                value={utmId}
                onChange={(e) => setUtmId(e.target.value)}
                placeholder="Internal ads campaign ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Formatting Rules */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLowercase}
                onChange={(e) => setAutoLowercase(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              Force Lowercase Parameters
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Space Separator:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                {(["-", "_", "+"] as const).map((sep) => (
                  <button
                    key={sep}
                    type="button"
                    onClick={() => setSpaceSeparator(sep)}
                    className={`px-2.5 py-0.5 rounded-md font-bold ${
                      spaceSeparator === sep ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    {sep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {activeTab === "single" ? "Generated Campaign URL" : `Batch URLs (${batchResult.length})`}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(activeTab === "single" ? campaignUrl : batchResult.join("\n"), "main")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs"
            >
              {copiedKey === "main" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey === "main" ? "Copied!" : "Copy URL"}
            </button>
          </div>

          {activeTab === "single" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 font-mono text-xs text-rose-950 break-all leading-relaxed">
                {campaignUrl || "Enter a website URL above"}
              </div>

              {/* QR Code toggle */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-rose-600"
                >
                  <QrIcon className="h-4 w-4" />
                  {showQr ? "Hide Campaign QR Code" : "Show Campaign QR Code"}
                </button>

                {showQr && qrCodeUrl && (
                  <div className="pt-2 flex flex-col items-center space-y-3">
                    <img
                      src={qrCodeUrl}
                      alt="Campaign QR Code"
                      className="h-48 w-48 rounded-xl border p-2 bg-white shadow-xs"
                    />
                    <a
                      href={qrCodeUrl}
                      download="campaign_qr_code.png"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download QR Code
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-80 overflow-y-auto space-y-2">
                {batchResult.map((u, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-mono break-all text-slate-800"
                  >
                    {u}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Pills */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active UTM Tags
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-lg bg-blue-50 text-blue-700 font-mono px-2 py-0.5 border border-blue-200/60">
                source: {source || "none"}
              </span>
              <span className="rounded-lg bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 border border-emerald-200/60">
                medium: {medium || "none"}
              </span>
              <span className="rounded-lg bg-purple-50 text-purple-700 font-mono px-2 py-0.5 border border-purple-200/60">
                campaign: {campaign || "none"}
              </span>
              {content && (
                <span className="rounded-lg bg-amber-50 text-amber-700 font-mono px-2 py-0.5 border border-amber-200/60">
                  content: {content}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
