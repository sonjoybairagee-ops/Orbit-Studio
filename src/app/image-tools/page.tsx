import { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { TOOLS_DATA } from "@/lib/tools-data";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Image Tools & Converters",
  description: "Compress, convert, resize, and crop images directly in your browser. 100% private, free, and secure.",
};

export default function ImageToolsPage() {
  const imageTools = TOOLS_DATA.filter((tool) => tool.category === "image");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-3">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Client-Side Image Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Online Image Tools
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Fast, browser-based utilities to optimize, convert, resize, and crop your photos without quality loss or server uploads.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
