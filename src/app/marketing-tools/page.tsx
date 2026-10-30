import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Megaphone, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Marketing Tools — Free Growth, Campaign & Social Media Tools | ToolHub",
  description:
    "Free marketing tools: Campaign URL & UTM Builder, Email Subject Line Tester, HTML Email Signature Generator, Affiliate Link Builder, QR Business Card, Bio Formatter, and Marketing ROI Calculator.",
};

export default function MarketingToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "marketing");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 via-pink-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Megaphone className="w-4 h-4" />
            Marketing &amp; Growth Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Free Online Marketing Tools
          </h1>
          <p className="text-rose-100 text-lg max-w-2xl mx-auto">
            Supercharge your campaigns, test subject lines, generate professional signatures, format social bios, and calculate ROI — 100% free and in-browser.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-rose-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Marketing Tools</span>
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
