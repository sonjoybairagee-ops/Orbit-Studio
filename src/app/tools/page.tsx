import { Metadata } from "next";
import ToolsExplorer from "@/components/tools/ToolsExplorer";
import { AdBanner } from "@/components/ads/AdBanner";
import { TOOLS_DATA, CATEGORIES } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: "Free Online Tools for Creators & Marketers — CompX Orbit",
  description:
    "100+ fast, private browser-based utilities for video downloading, PDF editing, image conversion, marketing campaigns, subtitles, and developer workflows.",
};

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9]">
      {/* Ambient Gradient Glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-tr from-[#3cff5f]/10 via-[#102a16]/15 to-transparent blur-[140px]"
        aria-hidden="true"
      />

      {/* Main Tools Catalog Section */}
      <main className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 w-full">
        <ToolsExplorer tools={TOOLS_DATA} categories={CATEGORIES} />
      </main>

      {/* Bottom Ad Slot (Active when AdSense ID is set) */}
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <AdBanner slot="tools-hub-bottom" format="auto" />
      </div>
    </div>
  );
}
