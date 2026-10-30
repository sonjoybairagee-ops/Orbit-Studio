import { Metadata } from "next";
import CampaignUrlBuilderTool from "@/components/tools/CampaignUrlBuilderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Campaign URL Builder — Free UTM & Tracking Link Generator | ToolHub",
  description:
    "Build custom campaign URLs with Google Analytics 4 (GA4) UTM parameters (source, medium, campaign, term, content), batch link generator, and downloadable QR codes.",
  keywords: [
    "campaign url builder",
    "utm builder",
    "google analytics url builder",
    "ga4 campaign builder",
    "create tracking link",
    "utm link generator",
    "batch utm builder",
  ],
};

export default function CampaignUrlBuilderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Campaign URL Builder",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser campaign URL builder with GA4 UTM parameters, channel presets, batch processing, and QR codes.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-2">
            100% Free · GA4 Standard · Batch Builder &amp; QR
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Campaign URL &amp; UTM Link Builder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Generate precise tracking URLs for Google Ads, Facebook, TikTok, LinkedIn, and email newsletters to track multi-channel conversions in Google Analytics.
          </p>
        </div>

        <div className="mb-14">
          <CampaignUrlBuilderTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600" />
            UTM Parameter Standards for Digital Marketers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "utm_source & utm_medium",
                formula: "Source = Platform / Medium = Channel Type",
                desc: "utm_source identifies where traffic originated (e.g. google, newsletter, tiktok). utm_medium specifies the marketing channel (e.g. cpc, email, paid_social).",
              },
              {
                title: "utm_campaign & utm_content",
                formula: "Campaign = Promo / Content = Creative A/B",
                desc: "utm_campaign groups traffic under strategic initiatives (e.g. black_friday_2026). utm_content differentiates links or creative variants within the same ad.",
              },
              {
                title: "Consistent Case Sensitivity",
                formula: "Always enforce lowercase characters",
                desc: "Google Analytics treats 'Google' and 'google' as two distinct traffic sources. Enforcing lowercase parameters prevents duplicate reporting fragments.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-rose-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-rose-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is the Batch Multi-Link Generator tab?",
                a: "If you have multiple product or landing page URLs, the Batch tab automatically applies your configured UTM parameters to every URL simultaneously, saving hours of manual tagging.",
              },
              {
                q: "Does this work with Google Analytics 4 (GA4)?",
                a: "Yes! All parameter keys adhere strictly to Google Analytics 4 standards, including utm_id for campaign group associations.",
              },
              {
                q: "Can I download a QR code for print marketing or events?",
                a: "Yes! Click 'Show Campaign QR Code' to generate a scannable high-resolution QR code encoding your tracking link.",
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
