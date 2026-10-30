import { Metadata } from "next";
import HtmlEntityEncoderTool from "@/components/tools/HtmlEntityEncoderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "HTML Entity Encoder/Decoder — Free Online Tool | ToolHub",
  description:
    "Encode special characters to HTML entities and decode them back. Convert <, >, &, \", ' and unicode to safe HTML entities online for free.",
  keywords: ["html entity encoder", "html entity decoder", "html escape", "encode html online", "html special characters"],
};

export default function HtmlEntityEncoderPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            100% Free · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HTML Entity Encoder / Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert reserved HTML characters to safe entity codes and back. Essential for embedding code snippets and preventing XSS vulnerabilities.
          </p>
        </div>

        <div className="mb-14">
          <HtmlEntityEncoderTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            When to Use HTML Entities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "🛡️", title: "Prevent XSS Attacks", body: "Encode user-generated content before rendering it in HTML to prevent cross-site scripting attacks." },
              { step: "📝", title: "Display Code Samples", body: "Show <code>, <script>, and other tags as visible text without the browser interpreting them." },
              { step: "🌍", title: "Special Characters", body: "Encode copyright ©, registered ®, em-dashes —, and unicode characters for safe email/HTML use." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-2xl mb-3 block">{s.step}</span>
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
            { q: "What is HTML encoding?", a: "HTML encoding converts characters with special meaning in HTML (like < and &) into their entity equivalents (&lt; and &amp;) so they appear as text rather than being parsed as HTML markup." },
            { q: "What's the difference between encode and decode?", a: "Encoding converts plain characters INTO HTML entities (< → &lt;). Decoding converts HTML entities BACK to plain characters (&lt; → <)." },
            { q: "Is this safe to use for security purposes?", a: "This tool is great for learning and testing entity encoding. For production security, always use your server-side framework's built-in escaping functions (e.g., htmlspecialchars in PHP, v-html in Vue, etc.)." },
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
