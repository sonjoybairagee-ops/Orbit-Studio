"use client";

import { useState, useMemo } from "react";
import {
  Tag,
  Percent,
  DollarSign,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BadgePercent,
  Layers,
} from "lucide-react";

export default function DiscountCalculatorTool() {
  const [activeTab, setActiveTab] = useState<"standard" | "reverse" | "bogo">("standard");

  // Mode 1: Standard & Stacked
  const [originalPrice, setOriginalPrice] = useState<string>("89.99");
  const [discountPercent, setDiscountPercent] = useState<string>("25");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [hasExtraDiscount, setHasExtraDiscount] = useState<boolean>(false);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<string>("10");
  const [taxPercent, setTaxPercent] = useState<string>("0");
  const [quantity, setQuantity] = useState<string>("1");

  // Mode 2: Reverse (Solve Original Price)
  const [finalPaidPrice, setFinalPaidPrice] = useState<string>("60");
  const [reverseDiscountPercent, setReverseDiscountPercent] = useState<string>("20");

  // Mode 3: BOGO & Deals
  const [dealItemPrice, setDealItemPrice] = useState<string>("35");
  const [buyCount, setBuyCount] = useState<number>(1);
  const [getCount, setGetCount] = useState<number>(1);
  const [getDiscountPercent, setGetDiscountPercent] = useState<number>(100); // 100% = Free

  const [copiedKey, setCopiedKey] = useState<string>("");

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // Preset discount pills
  const PRESET_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 70, 75];

  // Mode 1 Calculation
  const standardCalc = useMemo(() => {
    const orig = Math.max(0, parseFloat(originalPrice) || 0);
    const primaryVal = Math.max(0, parseFloat(discountPercent) || 0);
    const extraVal = hasExtraDiscount ? Math.max(0, parseFloat(extraDiscountPercent) || 0) : 0;
    const tax = Math.max(0, parseFloat(taxPercent) || 0);
    const qty = Math.max(1, parseInt(quantity) || 1);

    // Primary discount
    let afterPrimary = orig;
    let primarySavings = 0;
    if (discountType === "percent") {
      primarySavings = (orig * primaryVal) / 100;
      afterPrimary = Math.max(0, orig - primarySavings);
    } else {
      primarySavings = Math.min(orig, primaryVal);
      afterPrimary = Math.max(0, orig - primarySavings);
    }

    // Secondary / Stacked discount applied on the discounted price
    let extraSavings = 0;
    let afterExtra = afterPrimary;
    if (hasExtraDiscount) {
      extraSavings = (afterPrimary * extraVal) / 100;
      afterExtra = Math.max(0, afterPrimary - extraSavings);
    }

    const totalSavingsPerItem = primarySavings + extraSavings;
    const finalPricePerItemPreTax = afterExtra;
    const taxPerItem = (finalPricePerItemPreTax * tax) / 100;
    const finalPricePerItem = finalPricePerItemPreTax + taxPerItem;

    const totalOriginal = orig * qty;
    const totalSavings = totalSavingsPerItem * qty;
    const totalTax = taxPerItem * qty;
    const totalFinal = finalPricePerItem * qty;

    const effectivePercent =
      totalOriginal > 0 ? ((totalSavings / totalOriginal) * 100).toFixed(1) : "0.0";

    return {
      totalOriginal,
      totalSavings,
      totalTax,
      totalFinal,
      finalPricePerItem,
      totalSavingsPerItem,
      effectivePercent,
    };
  }, [
    originalPrice,
    discountPercent,
    discountType,
    hasExtraDiscount,
    extraDiscountPercent,
    taxPercent,
    quantity,
  ]);

  // Mode 2 Calculation (Reverse)
  const reverseCalc = useMemo(() => {
    const finalP = Math.max(0, parseFloat(finalPaidPrice) || 0);
    const disc = Math.max(0, parseFloat(reverseDiscountPercent) || 0);

    if (disc >= 100) return { originalPrice: 0, savings: 0 };
    const original = finalP / (1 - disc / 100);
    const savings = original - finalP;

    return {
      originalPrice: original,
      savings,
    };
  }, [finalPaidPrice, reverseDiscountPercent]);

  // Mode 3 Calculation (BOGO)
  const bogoCalc = useMemo(() => {
    const itemPrice = Math.max(0, parseFloat(dealItemPrice) || 0);
    const totalItems = buyCount + getCount;
    if (totalItems <= 0) return { totalOriginal: 0, totalFinal: 0, effectiveDiscount: 0, perItemPrice: 0 };

    const totalOriginal = totalItems * itemPrice;
    const fullPricePaid = buyCount * itemPrice;
    const discountedPricePaid = getCount * itemPrice * (1 - getDiscountPercent / 100);
    const totalFinal = fullPricePaid + discountedPricePaid;
    const totalSavings = totalOriginal - totalFinal;
    const effectiveDiscount = totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0;
    const perItemPrice = totalItems > 0 ? totalFinal / totalItems : 0;

    return {
      totalItems,
      totalOriginal,
      totalFinal,
      totalSavings,
      effectiveDiscount,
      perItemPrice,
    };
  }, [dealItemPrice, buyCount, getCount, getDiscountPercent]);

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("standard")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "standard"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag className="h-4 w-4 text-emerald-600" />
            Discount & Sale Price
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reverse")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "reverse"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RotateCcw className="h-4 w-4 text-blue-600" />
            Reverse Price Finder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bogo")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "bogo"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4 text-purple-600" />
            BOGO & Deals
          </button>
        </div>
      </div>

      {/* MODE 1: Standard Discount */}
      {activeTab === "standard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Enter Price & Discounts
            </h2>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Original Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-8 pr-4 text-xl font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-mono"
                />
              </div>
            </div>

            {/* Primary Discount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Discount
                </label>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-2.5 py-0.5 rounded-md font-semibold ${
                      discountType === "percent" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    % Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`px-2.5 py-0.5 rounded-md font-semibold ${
                      discountType === "fixed" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    $ Off
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-base font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {discountType === "percent" ? "%" : "$"}
                </span>
              </div>

              {/* Preset buttons */}
              {discountType === "percent" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_DISCOUNTS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct.toString())}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        discountPercent === pct.toString()
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stacked / Secondary Discount Toggle */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExtraDiscount}
                  onChange={(e) => setHasExtraDiscount(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Stack Extra Coupon (e.g. Extra 10% Off)
                </span>
              </label>

              {hasExtraDiscount && (
                <div className="relative pl-6">
                  <input
                    type="number"
                    step="0.5"
                    value={extraDiscountPercent}
                    onChange={(e) => setExtraDiscountPercent(e.target.value)}
                    placeholder="Extra % off"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    % Extra
                  </span>
                </div>
              )}
            </div>

            {/* Sales Tax & Quantity */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Sales Tax (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Dashboard (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Final Checkout Price
              </span>
              <button
                type="button"
                onClick={() => handleCopy(`$${standardCalc.totalFinal.toFixed(2)}`, "std")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700"
              >
                {copiedKey === "std" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "std" ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Glowing Big Price */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white text-center shadow-lg shadow-emerald-500/20">
              <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider line-through mb-1">
                Was: ${standardCalc.totalOriginal.toFixed(2)}
              </div>
              <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight">
                ${standardCalc.totalFinal.toFixed(2)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                You Save ${standardCalc.totalSavings.toFixed(2)} ({standardCalc.effectivePercent}% Off)
              </div>
            </div>

            {/* Breakdown table */}
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Original Total:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${standardCalc.totalOriginal.toFixed(2)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-emerald-700 font-bold">Total Discount Savings:</span>
                <span className="font-mono font-bold text-emerald-700">
                  -${standardCalc.totalSavings.toFixed(2)}
                </span>
              </div>
              {parseFloat(taxPercent) > 0 && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Estimated Sales Tax ({taxPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-700">
                    +${standardCalc.totalTax.toFixed(2)}
                  </span>
                </div>
              )}
              {parseInt(quantity) > 1 && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Price Per Item (Qty {quantity}):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${standardCalc.finalPricePerItem.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Reverse Price Finder */}
      {activeTab === "reverse" && (
        <div className="max-w-xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Calculate Original Price Before Discount
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the amount you paid and the discount percentage to reverse-engineer the original sticker price.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Final Discounted Price You Paid ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={finalPaidPrice}
                onChange={(e) => setFinalPaidPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-base font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Discount Percentage Applied (%)
              </label>
              <input
                type="number"
                step="1"
                value={reverseDiscountPercent}
                onChange={(e) => setReverseDiscountPercent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-base font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Original Sticker Price
            </span>
            <div className="font-mono text-4xl font-black text-blue-900">
              ${reverseCalc.originalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-blue-700 font-semibold">
              You saved ${reverseCalc.savings.toFixed(2)} with this {reverseDiscountPercent}% off discount.
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: BOGO & Multi-Buy Deal Analyzer */}
      {activeTab === "bogo" && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Buy X Get Y Free / Multi-Buy Deal Analyzer
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Find the true percentage discount and cost-per-item of store promotions and bundles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Item Price ($)
              </label>
              <input
                type="number"
                step="0.5"
                value={dealItemPrice}
                onChange={(e) => setDealItemPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-bold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Buy (Full Price)
              </label>
              <select
                value={buyCount}
                onChange={(e) => setBuyCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
              >
                <option value={1}>Buy 1</option>
                <option value={2}>Buy 2</option>
                <option value={3}>Buy 3</option>
                <option value={4}>Buy 4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Get
              </label>
              <select
                value={getDiscountPercent}
                onChange={(e) => setGetDiscountPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm font-semibold text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-none"
              >
                <option value={100}>1 Free (100% off)</option>
                <option value={50}>1 at 50% off</option>
                <option value={25}>1 at 25% off</option>
                <option value={75}>1 at 75% off</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-purple-50 border border-purple-200 p-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Effective Overall Discount
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-purple-900">
              {bogoCalc.effectiveDiscount.toFixed(1)}% OFF
            </div>
            <div className="text-sm font-semibold text-purple-800 pt-1">
              You pay <strong>${bogoCalc.totalFinal.toFixed(2)}</strong> total for {bogoCalc.totalItems} items (Only <strong>${bogoCalc.perItemPrice.toFixed(2)} each</strong>)
            </div>
            <div className="text-xs text-purple-600 line-through">
              Original regular price: ${bogoCalc.totalOriginal.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
