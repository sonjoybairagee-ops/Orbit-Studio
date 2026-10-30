import { Metadata } from "next";
import XmlFormatterTool from "@/components/tools/XmlFormatterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "XML Formatter & Minifier — Free Online Tool | ToolHub",
  description:
    "Beautify and prettify XML code with proper indentation, or minify XML for production. Also works with SVG code. 100% free browser-based XML formatter.",
  keywords: ["xml formatter", "xml beautifier", "xml minifier", "format xml online", "prettify xml", "svg formatter"],
};

export default function XmlFormatterPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60 mb-2">
            Works with XML & SVG · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            XML Formatter & Minifier
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Instantly beautify tangled XML and SVG code with hierarchical indentation, or minify it to save bandwidth. Download as a clean .xml file.
          </p>
        </div>

        <div className="mb-14">
          <XmlFormatterTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            How to Format XML
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Paste XML or SVG", body: "Paste your raw, compressed, or poorly indented XML or SVG markup into the input editor." },
              { step: 2, title: "Click Prettify or Minify", body: "Prettify adds readable indentation. Minify strips all whitespace for compact output." },
              { step: 3, title: "Download or Copy", body: "Use Copy to clipboard for quick pasting, or Download to save as a .xml file." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white mb-3">{s.step}</span>
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
            { q: "Does this work with SVG files?", a: "Yes! SVG is valid XML, so you can paste SVG markup and format it exactly the same way. This is useful for cleaning up SVG exports from tools like Figma or Illustrator." },
            { q: "Can it validate XML?", a: "The formatter uses a lightweight parser that correctly handles most well-formed XML. For strict schema validation (XSD, DTD), you would need a dedicated XML validator." },
            { q: "Is my XML data private?", a: "Completely. Formatting is done in your browser with pure JavaScript. No data is sent to any server." },
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
