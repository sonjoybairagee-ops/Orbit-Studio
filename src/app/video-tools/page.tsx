import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Film, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Free Video Editing & Creator Tools — CompX Orbit",
  description:
    "Free professional video workflow tools for creators, editors, and motion designers. Timecode calculator, social media safe zones, YouTube thumbnail grabber, and post-production planners.",
};

export default function VideoToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "video");

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#102a16] text-[#3cff5f] border border-[#2a5234] rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Film className="w-4 h-4" />
            <span>Video &amp; Creator Tools Suite</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight mb-4">
            Free Online Video Tools
          </h1>
          <p className="text-[#9baaa1] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Boost your post-production workflow. YouTube tag extractor, 4K video frame grabber,
            16:9 to 9:16 Shorts converter, video to MP3 extractor, and social safe-zone guides.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-2">
        <nav className="flex items-center gap-1.5 text-xs text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#e7eee9] font-medium">Video Tools</span>
        </nav>
      </div>

      {/* Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 py-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}

