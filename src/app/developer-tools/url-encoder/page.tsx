import { Metadata } from "next";
import UrlEncoderTool from "@/components/tools/UrlEncoderTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder — Free Online Tool | ToolHub",
  description:
    "Percent-encode URLs and query parameters online for free. Decode percent-encoded URL strings. Supports encodeURIComponent and encodeURI modes. 100% private.",
  keywords: ["url encoder", "url decoder", "percent encode", "url encode online", "urlencode", "urldecode"],
};

export default function UrlEncoderPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200/60 mb-2">
            100% Client-Side · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            URL Encoder / Decoder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Safely percent-encode URLs, query parameters, and path segments — or decode encoded strings back to plain text.
          </p>
        </div>

        <div className="mb-14">
          <UrlEncoderTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            How to Use the URL Encoder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Paste URL or Text", body: "Enter the URL or text string you want to encode in the input field." },
              { step: 2, title: "Choose Encoding Mode", body: "Select encodeURIComponent for query params, or encodeURI for complete URL encoding. Switch between Encode and Decode mode." },
              { step: 3, title: "Copy Result", body: "Click Copy to get the encoded/decoded result, or click Swap to reverse the operation." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white mb-3">{s.step}</span>
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
            { q: "What is URL encoding?", a: "URL encoding (percent encoding) replaces unsafe characters with a % followed by two hexadecimal digits. For example, a space becomes %20, and & becomes %26." },
            { q: "When should I use encodeURIComponent vs encodeURI?", a: "Use encodeURIComponent() for individual query parameter values (it encodes characters like : / ? # & = too). Use encodeURI() for a complete URL where you want to preserve the URL structure." },
            { q: "Can I decode multiple parameters at once?", a: "Yes. Paste the entire query string and the tool will decode all percent-encoded characters at once." },
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
