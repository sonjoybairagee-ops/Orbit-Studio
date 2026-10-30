import { Metadata } from "next";
import MarkdownPreviewerTool from "@/components/tools/MarkdownPreviewerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Markdown Previewer & Editor — Live GitHub Flavored Markdown (GFM) | ToolHub",
  description:
    "Write and preview GitHub Flavored Markdown (GFM) in real time with split-screen editing, task lists, tables, callouts, and one-click HTML/MD export.",
  keywords: [
    "markdown previewer",
    "markdown editor online",
    "github flavored markdown editor",
    "gfm previewer",
    "markdown to html converter",
    "live markdown editor",
    "readme editor online",
  ],
};

export default function MarkdownPreviewerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Markdown Previewer & Editor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser GitHub Flavored Markdown editor with live HTML rendering and syntax toolbar.",
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
            100% Free · GitHub Flavored Markdown · Split View
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Markdown Previewer & Live Editor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Draft README files, technical documentation, and blog posts with a live split-pane preview, formatting toolbar, and instant HTML export.
          </p>
        </div>

        <div className="mb-14">
          <MarkdownPreviewerTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            GitHub Flavored Markdown (GFM) Cheat Sheet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Tables & Task Lists",
                formula: "| Col 1 | Col 2 | & - [x] Done",
                desc: "Render aligned data tables and interactive checkbox task lists with standard GitHub markdown syntax.",
              },
              {
                title: "Callout Alerts",
                formula: "> [!NOTE] or > [!WARNING]",
                desc: "Modern GitHub callout badges for highlighted tips, critical notes, cautions, and developer warnings.",
              },
              {
                title: "Fenced Code Blocks",
                formula: "```javascript ... ```",
                desc: "Syntax-highlighted code blocks with language labels and inline code wrapping for technical documentation.",
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
                q: "Can I export my Markdown as an HTML document?",
                a: "Yes! Click the 'Download .html' or 'Copy HTML' button in the toolbar to get production-ready HTML with responsive styling included.",
              },
              {
                q: "Does this previewer work offline?",
                a: "Yes. All markdown parsing and HTML generation occurs locally in your browser using JavaScript. No external requests are made.",
              },
              {
                q: "How do I switch between Split view and Full preview?",
                a: "Use the view toggle buttons in the top right ('Editor', 'Split', 'Preview') to customize your writing workspace.",
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
