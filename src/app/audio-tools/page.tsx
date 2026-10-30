import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Volume2, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Audio Tools — Free Online Audio Processing Utilities | ToolHub",
  description:
    "Free browser-based audio tools: Volume Normalizer, Audio Trimmer, and WAV to MP3/WebM Converter. Fast, 100% private in-browser Web Audio API processing.",
};

export default function AudioToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "audio");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Volume2 className="w-4 h-4" />
            Audio Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Free Online Audio Tools
          </h1>
          <p className="text-violet-100 text-lg max-w-2xl mx-auto">
            Normalize audio volume, cut & trim audio clips, and compress audio files — directly inside your browser. No files are ever uploaded.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Audio Tools</span>
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
