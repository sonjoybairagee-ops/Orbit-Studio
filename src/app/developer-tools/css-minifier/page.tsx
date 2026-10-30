import { Metadata } from "next";
import CssMinifierTool from "@/components/tools/CssMinifierTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "CSS Minifier — Compress CSS Stylesheets Online | ToolHub",
  description:
    "Minify and compress CSS stylesheets online for free. Removes comments, whitespace, and redundant syntax. Shows exact byte savings. 100% browser-based, no upload.",
  keywords: ["css minifier", "css compressor", "minify css online", "compress css", "css optimizer"],
};

export default function CssMinifierPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200/60 mb-2">
            Shows Bytes Saved · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CSS Minifier
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Compress your CSS stylesheets by stripping comments, whitespace, and redundant syntax. See exactly how many bytes you save — instantly, in your browser.
          </p>
        </div>

        <div className="mb-14">
          <CssMinifierTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-orange-600" />
            Why Minify CSS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Faster Page Loads", body: "Smaller CSS files transfer faster over the network, reducing Time to First Byte (TTFB) and improving Core Web Vitals scores." },
              { icon: "📦", title: "Smaller Bundle Size", body: "In production builds, minified CSS reduces bandwidth costs and improves caching efficiency for repeat visitors." },
              { icon: "🔒", title: "Light Obfuscation", body: "Minified CSS is harder for competitors to read and reverse-engineer your styling decisions, providing lightweight intellectual property protection." },
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
            { q: "Will minifying break my CSS?", a: "No. Minification only removes whitespace, comments, and trailing semicolons that are syntactically optional. All selectors, properties, and values are preserved unchanged." },
            { q: "Does this handle CSS variables and modern CSS features?", a: "Yes. The minifier works on any CSS text including custom properties (--var), CSS Grid, Flexbox, animations, and media queries." },
            { q: "Should I minify manually or use a build tool?", a: "For small projects, this tool is perfect. For production workflows, use a build tool like Vite, webpack, or PostCSS with cssnano which can perform more advanced optimizations like removing redundant rules." },
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
