import { Metadata } from "next";
import UrlParserTool from "@/components/tools/UrlParserTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "URL Parser & Query String Editor — Inspect & Deconstruct URLs | ToolHub",
  description:
    "Deconstruct URLs into protocol, hostname, port, path, query parameters, and hashes. Edit query parameters interactively and strip marketing UTM tags.",
  keywords: [
    "url parser",
    "query string parser",
    "url decoder online",
    "inspect url components",
    "strip utm parameters",
    "query parameter editor",
    "parse url online",
  ],
};

export default function UrlParserPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub URL Parser & Query Studio",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser URL component deconstructor, query string editor, and UTM tracker stripper.",
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
            100% Free · Real-Time Deconstruction · UTM Stripper
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            URL Parser & Query String Studio
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Break down complex web addresses into protocol, domain, port, path segments, and query parameters. Edit or strip tracking tags with one click.
          </p>
        </div>

        <div className="mb-14">
          <UrlParserTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Anatomy of a Modern Uniform Resource Locator (URL)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Scheme & Authority",
                formula: "https://user:pass@example.com:8443",
                desc: "Specifies the communication protocol (HTTP/HTTPS), optional authentication credentials, destination host, and network port.",
              },
              {
                title: "Hierarchical Path",
                formula: "/v2/products/search",
                desc: "Defines the exact resource location on the server, broken down into slash-separated logical directory segments.",
              },
              {
                title: "Query String & Fragment",
                formula: "?key=val&sort=asc#summary",
                desc: "Query parameters transmit structured state variables to web servers and APIs. The fragment identifier points to client-side page anchors.",
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
                q: "What does the 'Strip Tracking (UTM)' button do?",
                a: "It strips invasive marketing analytics parameters (like utm_source, utm_medium, utm_campaign, fbclid, and gclid) from links before sharing them with others.",
              },
              {
                q: "Can I export the query parameters as a JSON object?",
                a: "Yes! Click 'Copy as JSON' above the query parameters table to copy all active key-value pairs formatted as a standard JSON object.",
              },
              {
                q: "Are the URLs sent to any server when parsed?",
                a: "No. The parsing is done entirely in your browser using the native web URL API. Sensitive internal URLs or query credentials remain strictly private.",
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
