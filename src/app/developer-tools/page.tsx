import type { Metadata } from "next";
import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Code2, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Developer & Data Tools — Online Encoding & Utilities | CompX Orbit",
  description:
    "Free browser-based developer tools: CSV Viewer, YAML Formatter, Markdown Previewer, Unix Timestamp Converter, UUID Generator, URL Parser, JSON Formatter, Base64 Encoder, Regex Tester, and more.",
  alternates: {
    canonical: "/developer-tools",
  },
  keywords: [
    "free developer tools",
    "json formatter online",
    "base64 encoder decoder",
    "uuid generator",
    "regex tester",
    "markdown previewer",
    "compx orbit dev",
  ],
  openGraph: {
    title: "Free Developer & Data Tools — Online Utilities | CompX Orbit",
    description: "Fast, client-side tools for engineers and web developers.",
    url: "https://compxorbit.com/developer-tools",
    type: "website",
  },
};

export default function DevToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "dev");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Code2 className="w-4 h-4" />
            Developer Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Free Online Developer Tools
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Format, validate, convert, encode, and debug — all in your browser.
            Zero server uploads. 100% private.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Developer Tools</span>
        </nav>
      </div>

      {/* Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}
