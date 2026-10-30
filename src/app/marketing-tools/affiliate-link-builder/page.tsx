import { Metadata } from "next";
import AffiliateLinkBuilderTool from "@/components/tools/AffiliateLinkBuilderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Link Builder — Amazon, ClickBank & Custom Tag Generator | ToolHub",
  description:
    "Generate clean affiliate tracking links for Amazon Associates, ClickBank HopLinks, ShareASale, and custom partner referral campaigns with FTC disclosure statements.",
  keywords: [
    "affiliate link builder",
    "amazon associate link generator",
    "clickbank hoplink generator",
    "affiliate tracking link builder",
    "ftc affiliate disclosure generator",
    "clean amazon affiliate url",
  ],
};

export default function AffiliateLinkBuilderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Affiliate Link Builder",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser affiliate tracking link builder for Amazon Associates, ClickBank, and custom partner programs with FTC disclaimers.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · Clean Canonical URLs · FTC Disclosures Included
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Affiliate Link &amp; Referral Tag Builder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Construct clean, high-converting affiliate URLs for Amazon Associates, ClickBank, ShareASale, and custom referral partnerships with compliant disclosure notices.
          </p>
        </div>

        <div className="mb-14">
          <AffiliateLinkBuilderTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Compliance &amp; Link Formatting Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Amazon ASIN Normalization",
                formula: "amazon.com/dp/ASIN?tag=store-20",
                desc: "Strip bloated user session tokens, referral tags, and tracking junk to create short, clean, canonical Amazon links that load faster.",
              },
              {
                title: "Mandatory FTC Disclosures",
                formula: "Clear & conspicuous notice required",
                desc: "Federal Trade Commission regulations require creators to explicitly disclose affiliate commissions before consumers click promotional links.",
              },
              {
                title: "Granular Sub-ID Tracking",
                formula: "Track conversions by channel & placement",
                desc: "Appending sub-IDs (e.g. youtube_sidebar vs email_newsletter) allows you to discover exactly which content drives the highest affiliate commissions.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-blue-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is an Amazon ASIN?",
                a: "An ASIN (Amazon Standard Identification Number) is a unique 10-character alphanumeric block (e.g. B08N5WRWNW) that identifies every product on Amazon.",
              },
              {
                q: "Do I need an affiliate disclosure on social media and YouTube?",
                a: "Yes. The FTC requires clear disclosures (such as 'Ad', 'Sponsored', or an explicit affiliate disclaimer in your description) on all social platforms.",
              },
              {
                q: "What are Sub-IDs?",
                a: "Sub-IDs are custom tracking tags you attach to affiliate links to measure performance across different ad creatives, blog articles, or email campaigns.",
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
