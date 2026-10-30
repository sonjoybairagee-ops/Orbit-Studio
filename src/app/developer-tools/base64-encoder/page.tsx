import { Metadata } from "next";
import Base64EncoderTool from "@/components/tools/Base64EncoderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — Free Online Tool | ToolHub",
  description:
    "Encode text or files to Base64 and decode Base64 strings to plain text online. UTF-8 safe. File to Base64 support. 100% private, browser-based tool.",
  keywords: ["base64 encoder", "base64 decoder", "encode base64 online", "decode base64", "file to base64"],
};

export default function Base64EncoderPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200/60 mb-2">
            100% Free · UTF-8 Safe
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Base64 Encoder / Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Encode any UTF-8 text or binary file to Base64, or decode a Base64 string back to plain text. Zero server upload — works entirely offline.
          </p>
        </div>

        <div className="mb-14">
          <Base64EncoderTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-600" />
            Common Uses for Base64
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🖼️", title: "Inline Images in CSS/HTML", body: "Embed small images directly in HTML or CSS as data: URIs to reduce HTTP requests." },
              { icon: "🔑", title: "API Authentication", body: "HTTP Basic Auth credentials are sent as Base64(username:password) in the Authorization header." },
              { icon: "📧", title: "Email Attachments", body: "MIME email attachments and binary data in JSON payloads are commonly transmitted as Base64." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-2xl mb-3 block">{s.icon}</span>
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
            { q: "Is Base64 a form of encryption?", a: "No. Base64 is an encoding scheme, not encryption. It converts binary data into ASCII text but provides zero security. Anyone can decode Base64 back to the original data." },
            { q: "Does this tool support emojis and unicode characters?", a: "Yes. We use the TextEncoder/TextDecoder Web API which correctly handles all UTF-8 characters including emojis, Arabic, Chinese, and other unicode scripts." },
            { q: "What is the file size limit for File to Base64?", a: "The tool supports files up to 1 MB. For larger files, Base64 output becomes very large (Base64 is ~33% larger than the original binary data)." },
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
