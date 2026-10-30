import { Metadata } from "next";
import YamlFormatterTool from "@/components/tools/YamlFormatterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "YAML Formatter & Validator — Convert YAML to JSON Online | ToolHub",
  description:
    "Format, validate, prettify, and convert YAML to JSON or JSON to YAML with customizable 2/4-space indentations and Docker/Kubernetes templates.",
  keywords: [
    "yaml formatter",
    "yaml validator",
    "yaml to json converter",
    "json to yaml converter",
    "format yaml online",
    "docker compose formatter",
    "kubernetes yaml formatter",
  ],
};

export default function YamlFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub YAML Formatter & Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser YAML validator, prettifier, and two-way JSON converter.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            100% Free · Two-Way Conversion · Docker & K8s Templates
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            YAML Formatter & Validator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Clean up messy YAML manifests, convert between YAML and JSON with one click, and validate configuration syntax without uploading files.
          </p>
        </div>

        <div className="mb-14">
          <YamlFormatterTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Why Developers Use ToolHub YAML Formatter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Two-Way Bi-directional Conversion",
                formula: "YAML ⇄ JSON seamlessly",
                desc: "Switch direction instantly to convert Docker Compose, Kubernetes manifests, or CloudFormation templates between YAML and JSON.",
              },
              {
                title: "Configurable Indentation",
                formula: "Strict 2-space or 4-space rules",
                desc: "YAML indentation is whitespace-sensitive. ToolHub standardizes spacing to prevent indentation mismatch errors.",
              },
              {
                title: "Built-In DevOps Templates",
                formula: "Docker, Kubernetes & GitHub Actions",
                desc: "Load sample templates for quick scaffolding or compare your custom configs against verified standard syntaxes.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-indigo-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Why does YAML not allow tab characters for indentation?",
                a: "The official YAML specification forbids tabs for indentation because different text editors and systems render tab widths inconsistently (e.g. 2, 4, or 8 spaces), which can alter the parsed document structure.",
              },
              {
                q: "Is YAML a superset of JSON?",
                a: "Yes! In YAML 1.2, every valid JSON document is also valid YAML. This tool allows seamless translation between both data formats.",
              },
              {
                q: "Are comments preserved when converting to JSON?",
                a: "JSON does not officially support comments, so converting YAML to JSON strips comment lines. Converting JSON back to clean YAML produces formatted key-value pairs.",
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
