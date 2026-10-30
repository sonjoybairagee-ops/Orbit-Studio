import { Metadata } from "next";
import { RobotsTxtGeneratorTool } from "@/components/tools/RobotsTxtGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Robots.txt Generator — Create Crawler Directives & Block AI Scrapers | ToolHub",
  description:
    "Generate custom, search-engine-compliant robots.txt files online. Block AI scrapers (GPTBot, CCBot), set crawl delays, specify disallowed paths, and download instantly.",
  keywords: ["robots txt generator", "block ai scraper robots txt", "create robots txt online", "disallow crawlers", "googlebot directives"],
};

export default function RobotsTxtGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Robots.txt Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual robots.txt generator with AI crawler blocking and instant file download.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
            Search Engine Standard · Block AI Scrapers
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Robots.txt Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Create clean, standards-compliant directives for Googlebot, Bingbot, and AI web scrapers. Customize allowed paths and download your ready-to-use file.
          </p>
        </div>

        <div className="mb-14">
          <RobotsTxtGeneratorTool />
        </div>

        {/* Feature Explanations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Robots.txt Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "File Placement",
                desc: "The file must strictly live at the root of your domain (e.g. `https://yourdomain.com/robots.txt`). It cannot be placed in a subdirectory.",
              },
              {
                title: "Blocking AI Training Bots",
                desc: "Protect your intellectual property by blocking automated training spiders like GPTBot, CCBot, Anthropic, and Google-Extended.",
              },
              {
                title: "Sitemap Reference",
                desc: "Always include the absolute URL of your XML sitemap at the bottom of the robots.txt file so crawlers can discover your URL inventory.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-emerald-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Does robots.txt hide private pages from the public?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No! Robots.txt is a public advisory file. It tells compliant search crawlers what NOT to index. Anyone can read your robots.txt file. For private data, use password protection, authentication, or server-level access control.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">What is the difference between Disallow: / and Disallow: ?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                `Disallow: /` blocks bots from accessing every single page on the site. An empty `Disallow:` directive instructs bots that they have permission to crawl all pages on the site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
