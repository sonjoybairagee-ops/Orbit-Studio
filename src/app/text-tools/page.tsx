import { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { TOOLS_DATA } from "@/lib/tools-data";
import { Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Text Utilities — Word Counter & Case Converter | CompX Orbit",
  description:
    "Free online text formatting suite: Word Counter, Character Counter, Case Converter, Remove Extra Spaces, and Text Diff Checker.",
  alternates: {
    canonical: "/text-tools",
  },
  keywords: [
    "text tools",
    "word counter",
    "character counter",
    "case converter",
    "remove extra spaces",
    "text diff checker",
    "compx orbit text tools",
  ],
  openGraph: {
    title: "Free Online Text Utilities — CompX Orbit",
    description: "Fast in-browser word counter, diff checker, and case converter.",
    url: "https://compxorbit.com/text-tools",
    type: "website",
  },
};

export default function TextToolsPage() {
  const textTools = TOOLS_DATA.filter((tool) => tool.category === "text");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-3">
          <Type className="h-3.5 w-3.5" />
          <span>Client-Side Text Utilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Online Text Utilities
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Fast, browser-based utilities to count words and characters, convert casing formats, clean whitespace, and compare text differences in real-time.
        </p>
      </div>

      {/* Grid of Text Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {textTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
