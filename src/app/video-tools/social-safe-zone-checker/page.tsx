import { Metadata } from "next";
import SocialSafeZoneTool from "@/components/tools/SocialSafeZoneTool";
import { Smartphone, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Social Media Safe Zone Checker — TikTok, Reels & Shorts 9:16 Overlay Previewer",
  description:
    "Free online 9:16 video safe zone previewer for TikTok, Instagram Reels, and YouTube Shorts. Check UI cutoff, test videos and images, and download 1080x1920 PNG overlay grids for After Effects & Premiere Pro.",
  keywords: [
    "tiktok safe zone",
    "instagram reels safe zone template",
    "youtube shorts safe zone checker",
    "reels safe zone overlay",
    "9:16 safe area template",
    "tiktok overlay previewer",
    "after effects safe zone template",
    "premiere pro reels safe zone",
  ],
  openGraph: {
    title: "Social Media Safe Zone Checker — TikTok, Reels & Shorts Previewer",
    description:
      "Interactive 9:16 safe zone previewer for creators and video editors. Ensure your text and captions are never cut off by TikTok, Reels, or Shorts UI.",
  },
};

export default function SocialSafeZoneCheckerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Social Media Safe Zone Checker",
    url: "https://compxorbit.com/video-tools/social-safe-zone-checker",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Interactive 9:16 video and graphic safe zone simulator for TikTok, Instagram Reels, and YouTube Shorts with downloadable transparent PNG grids.",
    featureList: [
      "TikTok, Reels, and Shorts UI overlays",
      "Upload video or image directly into phone frame",
      "Interactive safe zone and danger zone toggles",
      "Download transparent 1080x1920 PNG guide for Premiere Pro and After Effects",
      "100% Client-side, free and private",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
            <Smartphone className="h-3.5 w-3.5" />
            <span>Short-Form Video Production</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Social Media Safe Zone Checker
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Ensure your titles, subtitles, and key graphics never get covered by
            TikTok, Instagram Reels, or YouTube Shorts buttons. Upload your media
            to test live in the simulated phone mockup.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <SocialSafeZoneTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Use the Safe Zone Checker in Your Video Workflow</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Select Platform</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Choose TikTok, Instagram Reels, or YouTube Shorts. Each platform has slightly different button layouts and margin heights.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Upload Video or Image</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Drop your rendered MP4 or graphic frame directly into the phone frame to see if any subtitles or faces clash with app buttons.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Export PNG Grid for NLE</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Click &quot;Download 1080×1920 PNG Grid&quot; and import it directly into After Effects or Premiere Pro as a top guideline layer.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                What are the exact safe zone dimensions for TikTok?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                For a standard <strong>1080 × 1920 px (9:16)</strong> canvas, the safe area is roughly <strong>900 × 1270 px</strong> in the center. The top ~230px contains the Following/For You tabs and search icon, while the bottom ~420px contains the username, caption, and rotating sound disc. The right side has ~190px occupied by engagement buttons.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Why does Instagram Reels cut off parts of 9:16 videos on the feed?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                When an Instagram Reel appears on the standard home feed, Instagram crops it to <strong>4:5 aspect ratio (1080 × 1350 px)</strong>. If you place text near the top or bottom of a 9:16 frame, feed viewers will not see it unless they tap into full-screen Reels mode.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Does this tool upload my video to any server?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                <strong>No.</strong> All media rendering, video playback, and PNG guide generation happen 100% locally inside your web browser via HTML5 Blob and Canvas APIs. Your video files never touch an external server.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Power Up Your Motion Graphics</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Build High-Retention Motion Graphics Faster
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            Use CompX Orbit inside Adobe After Effects to instantly animate subtitles, lower thirds, callouts, and kinetic typography.
          </p>
          <div className="mt-5">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20"
            >
              <span>Discover CompX Orbit Extension</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

