import { Metadata } from "next";
import { MetaTagGeneratorTool } from "@/components/tools/MetaTagGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Meta Tag Generator — HTML & Next.js App Router Metadata Tags | ToolHub",
  description:
    "Generate complete SEO meta tags, Open Graph properties, Twitter cards, and Next.js App Router Metadata objects with instant syntax validation.",
  keywords: ["meta tag generator", "seo tags generator", "nextjs metadata generator", "open graph tags creator", "twitter card generator"],
};

export default function MetaTagGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Meta Tag Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Generate standard HTML meta tags and Next.js Metadata objects for SEO and social sharing.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            HTML & Next.js 15/16 · Open Graph & Twitter Cards
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SEO Meta Tag Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Build valid HTML &lt;head&gt; tags and Next.js App Router metadata configurations with social cards, crawler directives, and canonical links.
          </p>
        </div>

        <div className="mb-14">
          <MetaTagGeneratorTool />
        </div>

        {/* Feature Explanations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Essential Meta Tags Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Canonical Link",
                desc: "Prevents duplicate content penalties by telling search crawlers the definitive authoritative URL of a webpage.",
              },
              {
                title: "Robots Directives",
                desc: "Controls indexing (`index, follow`) and allows high-resolution image previews in Google Discover using `max-image-preview:large`.",
              },
              {
                title: "Open Graph Protocol",
                desc: "Standardized by Facebook and widely used across WhatsApp, LinkedIn, iMessage, and Discord to generate rich social media preview cards.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-indigo-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Do meta keywords still matter for Google?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google does not use the &lt;meta name="keywords"&gt; tag for ranking. However, other search engines (like Baidu or internal enterprise search engines) and CMS plugins still index them.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">How do I use this in Next.js App Router?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Switch the output format to &quot;Next.js App Router&quot;, copy the generated snippet, and export it as <code>export const metadata: Metadata = &#123; ... &#125;</code> inside your <code>page.tsx</code> or <code>layout.tsx</code> file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
