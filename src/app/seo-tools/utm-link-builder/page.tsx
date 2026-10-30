import { Metadata } from "next";
import { UtmLinkBuilderTool } from "@/components/tools/UtmLinkBuilderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "UTM Link Builder — Google Analytics 4 (GA4) Campaign URL Creator | ToolHub",
  description:
    "Generate accurate Google Analytics 4 (GA4) UTM tracking URLs. Add source, medium, campaign, term, and content parameters with QR code export and one-click copy.",
  keywords: ["utm link builder", "ga4 campaign url builder", "utm code generator", "tracking link builder", "google analytics campaign url"],
};

export default function UtmLinkBuilderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub UTM Link Builder",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Build clean, sanitized Google Analytics 4 UTM tracking links with presets and QR codes.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/60 mb-2">
            Google Analytics 4 (GA4) Standard · QR Code Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            UTM Link Builder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Create clean, consistent UTM tracking URLs for paid ads, email newsletters, and social campaigns to track conversions accurately in GA4.
          </p>
        </div>

        <div className="mb-14">
          <UtmLinkBuilderTool />
        </div>

        {/* Feature Explanations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-600" />
            GA4 Campaign Parameter Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "utm_source & utm_medium",
                desc: "Source identifies the referrer (e.g. `google`, `facebook`, `newsletter`). Medium describes the marketing channel (e.g. `cpc`, `email`, `social`).",
              },
              {
                title: "Lowercase Consistency",
                desc: "Analytics tools are case-sensitive. `Email` and `email` will register as two different channels. Always force lowercase names.",
              },
              {
                title: "Hyphen Separation",
                desc: "Never use raw spaces in URLs. Use hyphens (`-`) or underscores (`_`) so links remain clean and safe across all email clients and browsers.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-violet-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-violet-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Should I use UTM parameters on internal website links?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No! Never use UTM tags on links that point from one page of your site to another page of your site. Doing so resets the user's session in Google Analytics and breaks attribution. UTM tags are strictly for inbound external marketing traffic.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Where do I find these metrics in Google Analytics 4?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In GA4, go to Reports → Acquisition → Traffic Acquisition. You can view user traffic segmented by "Session source / medium" and "Session campaign".
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
