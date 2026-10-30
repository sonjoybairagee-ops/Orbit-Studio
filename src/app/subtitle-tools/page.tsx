import { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { TOOLS_DATA } from "@/lib/tools-data";
import { Subtitles } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Subtitle Tools - Shift Timestamps, Format SRT & VTT",
  description: "Free subtitle utility suite: SRT Formatter, SRT Timestamp Shifter, Subtitle Line Break Fixer, SRT to VTT Converter, and Subtitle Character Counter.",
  keywords: ["subtitle tools", "srt formatter", "srt timestamp shifter", "srt to vtt converter", "subtitle line break fixer", "subtitle character counter"],
};

export default function SubtitleToolsPage() {
  const subtitleTools = TOOLS_DATA.filter((tool) => tool.category === "subtitle");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200/60 mb-3">
          <Subtitles className="h-3.5 w-3.5" />
          <span>Client-Side Subtitle Utilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Online Subtitle Utilities
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Fast, browser-based tools to fix sync delays, format broken timestamps, convert to WebVTT, and audit reading speeds without server uploads.
        </p>
      </div>

      {/* Grid of Subtitle Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subtitleTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
