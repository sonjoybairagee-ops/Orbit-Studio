import { Metadata } from "next";
import JsonFormatterTool from "@/components/tools/JsonFormatterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator — Free Online Tool | ToolHub",
  description:
    "Format, prettify, validate, and minify JSON data online for free. Real-time syntax error detection, 2-space and 4-space indentation. 100% private, browser-based.",
  keywords: ["json formatter", "json validator", "json prettify", "json minifier", "format json online"],
};

export default function JsonFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub JSON Formatter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online JSON formatter, validator, and minifier. 100% client-side.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            JSON Formatter & Validator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Instantly prettify, validate, and minify JSON data with real-time syntax error highlighting. Works completely offline in your browser.
          </p>
        </div>

        <div className="mb-14">
          <JsonFormatterTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            How to Use the JSON Formatter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Paste JSON", body: "Paste your raw or minified JSON data into the input editor on the left side." },
              { step: 2, title: "Choose Mode", body: "Click Prettify to format with indentation, or Minify to compress for production. Switch between 2-space and 4-space indent." },
              { step: 3, title: "Copy or Download", body: "Click Copy to clipboard or Download to save the formatted JSON as a .json file." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mb-3">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-slate-700" />
            Frequently Asked Questions
          </h2>
          {[
            {
              q: "Is my JSON data sent to any server?",
              a: "No. All formatting and validation happens inside your browser using JavaScript's native JSON.parse() and JSON.stringify(). Your data never leaves your device.",
            },
            {
              q: "What's the difference between Prettify and Minify?",
              a: "Prettify adds human-readable whitespace and indentation so you can read and debug JSON easily. Minify removes all whitespace to reduce file size — ideal for production API responses.",
            },
            {
              q: "Can this validate nested or complex JSON?",
              a: "Yes. Our validator uses the browser's native JSON parser which fully supports all valid JSON including nested objects, arrays, null values, unicode strings, and numbers.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800">{item.q}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
