import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Free SEO & Website Tools — SERP Preview, Meta Tags, Robots.txt & Sitemap | ToolHub",
  description:
    "Free online SEO & webmaster tools: SERP Snippet Preview, Meta Tag Generator, Open Graph Preview, Robots.txt Generator, XML Sitemap Generator, and UTM Link Builder. 100% client-side.",
};

export default function SeoToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "seo");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Search className="w-4 h-4" />
            SEO & Webmaster Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            SEO & Website Tools
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Optimize your search ranking, generate social media Open Graph cards, construct robots.txt files, build valid XML sitemaps, and track campaign traffic with zero server upload.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">SEO & Website Tools</span>
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
