import { Metadata } from "next";
import { SerpSnippetPreviewTool } from "@/components/tools/SerpSnippetPreviewTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Google SERP Snippet Preview — Search Result Simulator & Character Counter | ToolHub",
  description:
    "Simulate how your website appears on Google Desktop and Mobile search results. Check pixel width limits, title truncation, meta description length, and rich snippets.",
  keywords: ["serp preview tool", "google search snippet simulator", "seo title pixel counter", "meta description length checker", "serp simulator"],
};

export default function SerpSnippetPreviewPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Google SERP Snippet Preview",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual Google desktop and mobile search engine result preview simulator with pixel width calculation.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            Google Desktop & Mobile Simulation · Pixel Limits
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Google SERP Snippet Preview
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Accurately preview and calibrate your SEO title tags, meta descriptions, and rich snippets to prevent truncation on search engine results pages.
          </p>
        </div>

        <div className="mb-14">
          <SerpSnippetPreviewTool />
        </div>

        {/* Best Practices */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            SERP Optimization Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Title Pixel Width (~600px)",
                desc: "Google measures titles in pixels rather than character count. Keep titles under ~600px (around 55–60 characters) to avoid ellipses (...).",
              },
              {
                title: "Compelling Meta Descriptions",
                desc: "Aim for 140–160 characters. Include primary target keywords and an actionable call-to-action to maximize organic click-through rates (CTR).",
              },
              {
                title: "Rich Snippets & Breadcrumbs",
                desc: "Add structured schema markup (JSON-LD) for reviews, ratings, and breadcrumbs to earn prominent visual real estate on Google SERP.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-blue-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Does Google always use my meta description?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Not always. Google frequently rewrites snippets based on user search queries if it believes page body text answers the search intent better. However, a well-crafted meta description remains the primary source.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Why do titles truncate earlier on mobile?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mobile screens have narrower viewports. While Google may allow two lines for titles on mobile, titles exceeding 70-75 characters are usually cut short.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
