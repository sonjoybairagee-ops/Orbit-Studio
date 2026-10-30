import { Metadata } from "next";
import { XmlSitemapGeneratorTool } from "@/components/tools/XmlSitemapGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "XML Sitemap Generator — Create Google & Bing Compliant Sitemaps | ToolHub",
  description:
    "Generate search engine compliant XML sitemaps online for free. Manage URL priorities, change frequencies, and lastmod dates, or bulk import URLs with instant XML download.",
  keywords: ["xml sitemap generator", "create sitemap xml", "google sitemap builder", "sitemap priority frequency", "bulk sitemap creator"],
};

export default function XmlSitemapGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub XML Sitemap Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual and bulk XML sitemap builder supporting priority, changefreq, and lastmod properties.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            Sitemaps.org 0.9 Protocol · Bulk Import
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            XML Sitemap Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Build valid, formatted XML sitemaps to help Google, Bing, and other search engines crawl and discover all of your website's pages quickly.
          </p>
        </div>

        <div className="mb-14">
          <XmlSitemapGeneratorTool />
        </div>

        {/* Feature Explanations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            XML Sitemap Attributes Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "<priority> (0.0 to 1.0)",
                desc: "Indicates the importance of a specific URL relative to other pages on your own site. 1.0 is typically reserved for the homepage.",
              },
              {
                title: "<changefreq>",
                desc: "Hints how frequently content is updated (always, hourly, daily, weekly, monthly, yearly, never) to guide crawl budget allocation.",
              },
              {
                title: "<lastmod> Timestamp",
                desc: "Communicates the date when the page was last modified (YYYY-MM-DD), allowing crawlers to skip unchanged cached pages.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-amber-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">How do I submit this sitemap to Google?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload `sitemap.xml` to your public root folder, then open Google Search Console, navigate to the "Sitemaps" menu, enter `sitemap.xml`, and click Submit.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">What is the maximum limit for a single sitemap file?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The official sitemap protocol limits a single sitemap file to 50,000 URLs and an uncompressed file size of 50MB. For larger sites, use a Sitemap Index file referencing multiple smaller sitemaps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
