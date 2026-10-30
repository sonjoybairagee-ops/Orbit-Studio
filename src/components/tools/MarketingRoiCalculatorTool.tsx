"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Copy,
  Check,
  Sparkles,
  Users,
  Target,
  BarChart3,
  RotateCcw,
} from "lucide-react";

export default function MarketingRoiCalculatorTool() {
  const [activeTab, setActiveTab] = useState<"roi" | "cac_ltv" | "cpc_cpa">("roi");

  // Mode 1: ROI & ROAS
  const [adSpend, setAdSpend] = useState<string>("5000");
  const [revenue, setRevenue] = useState<string>("22500");
  const [otherCosts, setOtherCosts] = useState<string>("1500"); // creative, agency, software

  // Mode 2: CAC & LTV
  const [totalMarketingSpend, setTotalMarketingSpend] = useState<string>("10000");
  const [newCustomers, setNewCustomers] = useState<string>("125");
  const [customerLtv, setCustomerLtv] = useState<string>("280"); // LTV per customer

  // Mode 3: CPC & Conversion Rate
  const [campaignSpend, setCampaignSpend] = useState<string>("3000");
  const [impressions, setImpressions] = useState<string>("150000");
  const [clicks, setClicks] = useState<string>("4500");
  const [conversions, setConversions] = useState<string>("180");

  const [copiedKey, setCopiedKey] = useState<string>("");

  // Mode 1 Calculations (ROI & ROAS)
  const roiData = useMemo(() => {
    const spend = Math.max(0, parseFloat(adSpend) || 0);
    const rev = Math.max(0, parseFloat(revenue) || 0);
    const extra = Math.max(0, parseFloat(otherCosts) || 0);

    const totalInvestment = spend + extra;
    const netProfit = rev - totalInvestment;

    const roiPercent =
      totalInvestment > 0 ? ((netProfit / totalInvestment) * 100).toFixed(1) : "0.0";
    const roasMultiplier = spend > 0 ? (rev / spend).toFixed(2) : "0.00";
    const profitMargin = rev > 0 ? ((netProfit / rev) * 100).toFixed(1) : "0.0";

    const isProfitable = netProfit >= 0;

    return {
      totalInvestment,
      netProfit,
      roiPercent,
      roasMultiplier,
      profitMargin,
      isProfitable,
    };
  }, [adSpend, revenue, otherCosts]);

  // Mode 2 Calculations (CAC & LTV)
  const cacData = useMemo(() => {
    const spend = Math.max(0, parseFloat(totalMarketingSpend) || 0);
    const customers = Math.max(1, parseInt(newCustomers) || 1);
    const ltv = Math.max(0, parseFloat(customerLtv) || 0);

    const cac = spend / customers;
    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(2) : "0.00";

    let health = "Average";
    let healthColor = "text-amber-700 bg-amber-50 border-amber-200";
    const ratioNum = parseFloat(ltvCacRatio);
    if (ratioNum >= 3.0) {
      health = "High Growth (Optimal 3:1+)";
      healthColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (ratioNum < 1.0) {
      health = "Losing Money (< 1:1)";
      healthColor = "text-rose-700 bg-rose-50 border-rose-200";
    }

    return {
      cac,
      ltvCacRatio,
      health,
      healthColor,
      totalLtvRevenue: customers * ltv,
    };
  }, [totalMarketingSpend, newCustomers, customerLtv]);

  // Mode 3 Calculations (CPC, CPA, CTR, CVR)
  const funnelData = useMemo(() => {
    const spend = Math.max(0, parseFloat(campaignSpend) || 0);
    const impr = Math.max(1, parseInt(impressions) || 1);
    const clk = Math.max(0, parseInt(clicks) || 0);
    const conv = Math.max(0, parseInt(conversions) || 0);

    const ctr = impr > 0 ? ((clk / impr) * 100).toFixed(2) : "0.00";
    const cpc = clk > 0 ? (spend / clk).toFixed(2) : "0.00";
    const cvr = clk > 0 ? ((conv / clk) * 100).toFixed(2) : "0.00";
    const cpa = conv > 0 ? (spend / conv).toFixed(2) : "0.00";

    return { ctr, cpc, cvr, cpa };
  }, [campaignSpend, impressions, clicks, conversions]);

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
            onClick={() => setActiveTab("roi")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "roi"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            ROI & ROAS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cac_ltv")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "cac_ltv"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4 text-blue-600" />
            CAC & LTV Ratio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cpc_cpa")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "cpc_cpa"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="h-4 w-4 text-purple-600" />
            CPC & Conversion Funnel
          </button>
        </div>
      </div>

      {/* MODE 1: ROI & ROAS */}
      {activeTab === "roi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Campaign Revenue & Costs
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Total Revenue Generated ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="100"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-8 pr-4 text-xl font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Direct Ad Spend ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="50"
                    value={adSpend}
                    onChange={(e) => setAdSpend(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Other Costs (Agency, Tools, Creatives)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="50"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Outputs (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Performance Dashboard
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `Marketing ROI: ${roiData.roiPercent}%, ROAS: ${roiData.roasMultiplier}x, Net Profit: $${roiData.netProfit.toFixed(2)}`,
                    "roi"
                  )
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {copiedKey === "roi" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "roi" ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Glowing ROAS Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-6 text-white text-center shadow-lg shadow-emerald-500/20">
              <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mb-1">
                Return on Ad Spend (ROAS)
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight">
                {roiData.roasMultiplier}x
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                ROI: {roiData.roiPercent}% Return
              </div>
            </div>

            {/* Breakdown rows */}
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Net Profit:</span>
                <span
                  className={`font-mono font-bold ${
                    roiData.isProfitable ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  ${roiData.netProfit.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Profit Margin:</span>
                <span className="font-mono font-bold text-slate-900">
                  {roiData.profitMargin}%
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Total Investment (Spend + Ops):</span>
                <span className="font-mono font-semibold text-slate-700">
                  ${roiData.totalInvestment.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CAC & LTV */}
      {activeTab === "cac_ltv" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Acquisition & Customer Value
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Total Marketing &amp; Sales Budget ($)
              </label>
              <input
                type="number"
                step="500"
                value={totalMarketingSpend}
                onChange={(e) => setTotalMarketingSpend(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  New Customers Acquired
                </label>
                <input
                  type="number"
                  min={1}
                  value={newCustomers}
                  onChange={(e) => setNewCustomers(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Customer Lifetime Value (LTV $)
                </label>
                <input
                  type="number"
                  step="10"
                  value={customerLtv}
                  onChange={(e) => setCustomerLtv(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Unit Economics
            </span>

            <div className="rounded-2xl bg-blue-50/70 border border-blue-200/80 p-6 text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Customer Acquisition Cost (CAC)
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-blue-950">
                ${cacData.cac.toFixed(2)}
              </div>
              <span className="text-xs text-blue-800 font-semibold block pt-1">
                Per Acquired Customer
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">LTV:CAC Ratio:</span>
                <span className="font-mono font-extrabold text-slate-900 text-lg">
                  {cacData.ltvCacRatio} : 1
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500">Portfolio Health:</span>
                <span
                  className={`font-semibold text-xs px-2.5 py-0.5 rounded-full border ${cacData.healthColor}`}
                >
                  {cacData.health}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Projected Lifetime Revenue:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${cacData.totalLtvRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: CPC & Conversion Funnel */}
      {activeTab === "cpc_cpa" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Funnel Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ad Spend ($)
                </label>
                <input
                  type="number"
                  step="100"
                  value={campaignSpend}
                  onChange={(e) => setCampaignSpend(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Impressions
                </label>
                <input
                  type="number"
                  step="1000"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Clicks / Traffic
                </label>
                <input
                  type="number"
                  step="50"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Conversions / Orders
                </label>
                <input
                  type="number"
                  step="5"
                  value={conversions}
                  onChange={(e) => setConversions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Computed Cost &amp; Conversion Rates
            </span>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
                <span className="text-[11px] font-bold uppercase text-purple-700">Cost Per Click (CPC)</span>
                <div className="font-mono text-2xl font-black text-purple-950 mt-1">
                  ${funnelData.cpc}
                </div>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
                <span className="text-[11px] font-bold uppercase text-purple-700">Cost Per Acquisition (CPA)</span>
                <div className="font-mono text-2xl font-black text-purple-950 mt-1">
                  ${funnelData.cpa}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-600">Click-Through Rate (CTR)</span>
                <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                  {funnelData.ctr}%
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-600">Conversion Rate (CVR)</span>
                <div className="font-mono text-2xl font-black text-slate-900 mt-1">
                  {funnelData.cvr}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
