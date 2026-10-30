import { Metadata } from "next";
import RegexTesterTool from "@/components/tools/RegexTesterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Regex Tester — Test Regular Expressions Online | ToolHub",
  description:
    "Test and debug regular expressions with live match highlighting, flag support (g, i, m, s), and capture group extraction. Free browser-based regex tester.",
  keywords: ["regex tester", "regular expression tester", "regex online", "test regex", "regex debugger", "regex match highlighter"],
};

export default function RegexTesterPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-2">
            Live Highlighting · Capture Groups · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Regex Tester
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Write and debug regular expressions with instant match highlighting, flag toggles (g, i, m, s), and detailed capture group extraction.
          </p>
        </div>

        <div className="mb-14">
          <RegexTesterTool />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600" />
            Regex Flags Reference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { flag: "g", name: "Global", desc: "Find all matches, not just the first one" },
              { flag: "i", name: "Insensitive", desc: "Case-insensitive matching (a matches A)" },
              { flag: "m", name: "Multiline", desc: "^ and $ match the start/end of each line" },
              { flag: "s", name: "Dotall", desc: "The dot . matches newlines as well" },
            ].map((f) => (
              <div key={f.flag} className="rounded-2xl bg-rose-50 p-4 border border-rose-100">
                <code className="text-2xl font-black text-rose-700 font-mono">{f.flag}</code>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{f.name}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{f.desc}</p>
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
            { q: "What regex flavour does this use?", a: "This tool uses the JavaScript ECMAScript regular expression engine (built into all modern browsers). It supports standard regex syntax including lookaheads, backreferences, named capture groups, and unicode properties." },
            { q: "How do I capture groups?", a: "Wrap parts of your pattern in parentheses. For example /([a-z]+)@([a-z]+)\\.([a-z]+)/i captures 3 groups from an email address. The tool shows each group's matched text in the details panel." },
            { q: "Is there a limit on how many matches are shown?", a: "Yes, the tool displays up to 500 matches to keep the browser responsive. For most real-world patterns this limit is never reached." },
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
