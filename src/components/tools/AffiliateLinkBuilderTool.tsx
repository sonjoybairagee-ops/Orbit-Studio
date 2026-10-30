"use client";

import { useState, useMemo } from "react";
import {
  Link2,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Code,
  Sparkles,
  Info,
} from "lucide-react";

type AffiliateNetwork = "amazon" | "shareasale" | "cj" | "impact" | "clickbank" | "custom";

export default function AffiliateLinkBuilderTool() {
  const [network, setNetwork] = useState<AffiliateNetwork>("amazon");
  const [productUrl, setProductUrl] = useState<string>(
    "https://www.amazon.com/dp/B08N5WRWNW?ref_=cm_sw_r_cp_ud_dp_123"
  );

  // Amazon
  const [amazonTag, setAmazonTag] = useState<string>("toolhub-20");

  // Custom / Generic
  const [paramName, setParamName] = useState<string>("ref");
  const [affiliateId, setAffiliateId] = useState<string>("partner123");
  const [subId, setSubId] = useState<string>("youtube_q4");

  // ClickBank
  const [cbVendor, setCbVendor] = useState<string>("vendor123");
  const [cbAffiliate, setCbAffiliate] = useState<string>("myhoplink");

  const [copiedKey, setCopiedKey] = useState<string>("");

  // Clean and construct affiliate URL
  const generatedLink = useMemo(() => {
    const raw = productUrl.trim();
    if (!raw) return "";

    try {
      if (network === "amazon") {
        // Normalize Amazon URL to extract ASIN if possible
        const asinMatch = raw.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
        if (asinMatch) {
          const asin = asinMatch[1];
          const tag = amazonTag.trim() || "yourtag-20";
          return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
        }
        // Fallback: append tag to provided URL
        const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
        u.searchParams.set("tag", amazonTag.trim());
        return u.toString();
      }

      if (network === "clickbank") {
        const aff = cbAffiliate.trim() || "affiliate";
        const ven = cbVendor.trim() || "vendor";
        let hop = `https://${aff}.${ven}.hop.clickbank.net`;
        if (subId.trim()) hop += `/?tid=${encodeURIComponent(subId.trim())}`;
        return hop;
      }

      if (network === "custom") {
        const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
        if (paramName.trim() && affiliateId.trim()) {
          u.searchParams.set(paramName.trim(), affiliateId.trim());
        }
        if (subId.trim()) {
          u.searchParams.set("subid", subId.trim());
        }
        return u.toString();
      }

      // ShareASale & CJ & Impact wrappers
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      u.searchParams.set("afftrack", subId.trim() || "default");
      u.searchParams.set("subid", affiliateId.trim() || "partner");
      return u.toString();
    } catch {
      return productUrl;
    }
  }, [network, productUrl, amazonTag, paramName, affiliateId, subId, cbVendor, cbAffiliate]);

  // FTC Disclosure Statement
  const ftcDisclosure = useMemo(() => {
    if (network === "amazon") {
      return `Disclosure: As an Amazon Associate, I earn from qualifying purchases at no additional cost to you.`;
    }
    return `Disclosure: This post contains affiliate links. If you make a purchase through these links, we may earn a commission at zero additional cost to you.`;
  }, [network]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Network Selector Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 gap-1 flex-wrap justify-center">
          {[
            { id: "amazon", label: "Amazon Associates" },
            { id: "custom", label: "Custom / Generic Referral" },
            { id: "clickbank", label: "ClickBank HopLink" },
            { id: "shareasale", label: "ShareASale / CJ" },
          ].map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                setNetwork(n.id as AffiliateNetwork);
                if (n.id === "amazon" && !productUrl.includes("amazon.com")) {
                  setProductUrl("https://www.amazon.com/dp/B08N5WRWNW");
                }
              }}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                network === n.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Affiliate Parameters
          </h2>

          {network !== "clickbank" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Product / Destination URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://example.com/product"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-mono text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {network === "amazon" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Amazon Associate Store Tag (e.g. tag-20) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={amazonTag}
                onChange={(e) => setAmazonTag(e.target.value)}
                placeholder="yourstore-20"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Automatically cleans and normalizes Amazon product URLs to canonical clean <code>/dp/ASIN?tag=...</code> format.
              </span>
            </div>
          )}

          {network === "clickbank" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  ClickBank Vendor / Account
                </label>
                <input
                  type="text"
                  value={cbVendor}
                  onChange={(e) => setCbVendor(e.target.value)}
                  placeholder="vendor_account"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Affiliate Nickname
                </label>
                <input
                  type="text"
                  value={cbAffiliate}
                  onChange={(e) => setCbAffiliate(e.target.value)}
                  placeholder="your_nickname"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {network === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Param Name
                </label>
                <input
                  type="text"
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  placeholder="ref, aff, partner"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Affiliate / Partner ID
                </label>
                <input
                  type="text"
                  value={affiliateId}
                  onChange={(e) => setAffiliateId(e.target.value)}
                  placeholder="ID123"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Sub-ID / Channel
                </label>
                <input
                  type="text"
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  placeholder="youtube_cta"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clean Tracking Affiliate Link
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(generatedLink, "link")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                {copiedKey === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "link" ? "Copied Link!" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 font-mono text-xs text-blue-950 break-all leading-relaxed">
            {generatedLink || "Enter URL parameters on the left"}
          </div>

          {/* FTC Disclosure Statement Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                FTC Legal Disclosure Statement
              </span>
              <button
                type="button"
                onClick={() => handleCopy(ftcDisclosure, "disc")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                {copiedKey === "disc" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &quot;{ftcDisclosure}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
