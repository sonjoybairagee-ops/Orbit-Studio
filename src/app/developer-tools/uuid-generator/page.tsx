import { Metadata } from "next";
import UuidGeneratorTool from "@/components/tools/UuidGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "UUID / GUID Generator — Free Online UUID v4 & v1 Generator | ToolHub",
  description:
    "Generate random, cryptographically secure UUID v4, UUID v1, and NanoIDs in bulk (up to 500 at once). Includes uppercase, no-hyphen, and JSON formatting.",
  keywords: [
    "uuid generator",
    "guid generator",
    "uuid v4 generator",
    "generate bulk uuids",
    "online uuid generator",
    "uuid validator",
    "rfc 4122 uuid generator",
  ],
};

export default function UuidGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub UUID & GUID Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser bulk UUID v4, v1, and NanoID generator with RFC 4122 validation and custom formatting.",
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
            100% Free · Cryptographically Secure · Bulk Generation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            UUID / GUID Generator & Validator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Generate cryptographically secure UUID v4, time-based v1, or compact NanoIDs in bulk with custom casing, hyphens, and JSON formatting.
          </p>
        </div>

        <div className="mb-14">
          <UuidGeneratorTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            UUID & GUID Specifications Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "UUID v4 (Random)",
                formula: "122 bits of cryptographically strong entropy",
                desc: "Version 4 UUIDs are generated using pseudo-random numbers from crypto.getRandomValues(). The probability of a collision is virtually zero.",
              },
              {
                title: "UUID v1 (Time-based)",
                formula: "Current timestamp + MAC node address",
                desc: "Version 1 UUIDs are generated from the current 60-bit timestamp and node identifier, ensuring chronological sortability.",
              },
              {
                title: "UUID vs. GUID",
                formula: "Identical 128-bit RFC 4122 standard",
                desc: "GUID (Globally Unique Identifier) is Microsoft's terminology for UUID (Universally Unique Identifier). Both share the identical 8-4-4-4-12 hex layout.",
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
                q: "Are these UUIDs cryptographically secure?",
                a: "Yes! All UUIDs are generated using the browser's native window.crypto.randomUUID() or crypto.getRandomValues() CSPRNG APIs.",
              },
              {
                q: "What is the likelihood of two UUID v4 values colliding?",
                a: "To have a 50% chance of a single collision, you would need to generate approximately 2.71 quintillion UUIDs (2.71 × 10^18), which is virtually impossible under real-world computing conditions.",
              },
              {
                q: "Can I inspect an existing UUID?",
                a: "Yes! Click the 'UUID Validator & Inspector' tab to paste any identifier and inspect its RFC 4122 compliance, version number, and variant.",
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
