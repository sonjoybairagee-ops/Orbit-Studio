import { Metadata } from "next";
import ToolsExplorer from "@/components/tools/ToolsExplorer";
import { TOOLS_DATA, CATEGORIES } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: "100+ Free Online Creator & Multimedia Tools — CompX Orbit",
  description:
    "Explore 100+ fast, private browser-based tools: 4K video downloaders, AI auto captions generator, Real-ESRGAN neural upscaler, PDF editors, audio converters, and developer utilities.",
  alternates: {
    canonical: "/tools",
  },
  keywords: [
    "free online tools",
    "creator tools directory",
    "video downloaders",
    "ai caption generator",
    "ai image upscaler",
    "pdf tools online",
    "free audio tools",
    "developer utilities",
    "compx orbit tools",
  ],
  openGraph: {
    title: "100+ Free Online Creator & Multimedia Tools — CompX Orbit",
    description:
      "Fast, private browser-based utilities for creators, video editors, and developers with zero registration required.",
    url: "https://compxorbit.com/tools",
    type: "website",
  },
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

      {/* Structured Data for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                name: "100+ Free Online Creator & Multimedia Tools",
                url: "https://compxorbit.com/tools",
                description:
                  "100+ fast, private browser-based utilities for video downloading, PDF editing, image conversion, marketing campaigns, subtitles, and developer workflows.",
              },
              {
                "@type": "ItemList",
                name: "Free Online Creator Tools Catalog",
                itemListElement: TOOLS_DATA.slice(0, 30).map((tool, idx) => ({
                  "@type": "ListItem",
                  position: idx + 1,
                  name: tool.name,
                  url: `https://compxorbit.com${tool.href}`,
                  description: tool.shortDesc,
                })),
              },
            ],
          }),
        }}
      />
    </div>
  );
}
