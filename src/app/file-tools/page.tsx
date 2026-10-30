import type { Metadata } from "next";
import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { FolderArchive, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online File Converters & Archive Utilities — CompX Orbit",
  description:
    "Free online file and video tools: Video to GIF Converter, Video Frame Extractor, ZIP File Creator, and CSV to JSON Converter. 100% private in-browser processing.",
  alternates: {
    canonical: "/file-tools",
  },
  keywords: [
    "free file tools",
    "video to gif converter",
    "video frame extractor",
    "create zip file online",
    "csv to json converter",
    "compx orbit files",
  ],
  openGraph: {
    title: "Free Online File Converters & Archive Utilities — CompX Orbit",
    description: "Fast in-browser file compression, extraction and conversion utilities.",
    url: "https://compxorbit.com/file-tools",
    type: "website",
  },
};

export default function FileToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "file");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 via-orange-600 to-amber-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <FolderArchive className="w-4 h-4" />
            File & Video Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Free Online File & Video Tools
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Convert video to GIF animations, extract frame stills, package files into ZIP archives, and transform CSV into JSON — all client-side.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-rose-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">File Tools</span>
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
