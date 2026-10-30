import { Metadata } from "next";
import DiscountCalculatorTool from "@/components/tools/DiscountCalculatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Discount Calculator — Free Sale Price & Stacked Coupon Calculator | ToolHub",
  description:
    "Calculate sale prices, double stacked discounts, reverse sticker prices, and BOGO multi-buy deals with sales tax and instant price-per-item breakdowns.",
  keywords: [
    "discount calculator",
    "sale price calculator",
    "percent off calculator",
    "shopping discount calculator",
    "calculate 20 percent off",
    "bogo calculator",
    "reverse discount calculator",
  ],
};

export default function DiscountCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Discount Calculator",
    applicationCategory: "ShoppingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser shopping discount, stacked coupons, and reverse sale price calculator.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            100% Free · Stacked Coupons · Reverse & BOGO Deals
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Discount & Sale Price Calculator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Find out how much you save on clearance sales, stack extra store coupons, calculate sales tax, and analyze Buy-One-Get-One promotions.
          </p>
        </div>

        <div className="mb-14">
          <DiscountCalculatorTool />
        </div>

        {/* How Discounts Work */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Common Discount Math Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Standard % Off",
                formula: "Sale Price = Original - (Original × Discount%)",
                desc: "Example: A $100 jacket with 25% off costs $100 - $25 = $75.00.",
              },
              {
                title: "Stacked (Double) Discounts",
                formula: "Discounts apply sequentially, not additively",
                desc: "A 20% sale plus an extra 10% coupon is NOT 30% off. The 10% applies to the already-discounted $80 price, resulting in $72.00 (28% effective discount).",
              },
              {
                title: "Buy 1 Get 1 Free (BOGO)",
                formula: "BOGO = Exactly 50% discount per item",
                desc: "Buy 2 Get 1 Free equals a 33.3% discount across all 3 items. Buy 1 Get 1 at 50% off equals 25% off each item.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-emerald-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is the Reverse Price Finder tab?",
                a: "If you know how much you paid at checkout and the discount percentage (e.g. you paid $40 on a 20% off sale), the reverse finder solves the original sticker price ($50) and tells you how much money you saved ($10).",
              },
              {
                q: "How does sales tax affect discounts?",
                a: "In most jurisdictions, sales tax is calculated on the discounted checkout price, meaning discounts also reduce the total sales tax you pay.",
              },
              {
                q: "Can I enter a fixed dollar off amount instead of percent?",
                a: "Yes! In the Discount section, toggle the switch from '% Off' to '$ Off' to subtract fixed coupons like '$15 off your order'.",
              },
            ].map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="text-sm font-bold text-slate-800">{faq.q}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
