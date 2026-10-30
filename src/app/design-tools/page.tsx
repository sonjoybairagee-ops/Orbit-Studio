import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Paintbrush, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Advanced Image & Design Tools — Free Online Design Utilities | ToolHub",
  description:
    "Free online design tools: Background Color Changer, Pixel Art Converter, Favicon Generator, SVG Optimizer, Image Color Picker, and Image Watermark Tool. 100% private.",
};

export default function DesignToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "design");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-fuchsia-600 via-pink-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Paintbrush className="w-4 h-4" />
            Design & Image Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Advanced Image & Design Tools
          </h1>
          <p className="text-pink-100 text-lg max-w-2xl mx-auto">
            Change background colors, transform photos into 8-bit pixel art, generate favicons, optimize SVGs, sample colors, and watermark images directly in your browser.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-fuchsia-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Design Tools</span>
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
