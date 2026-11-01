import { Metadata } from "next";
import LutGeneratorTool from "@/components/tools/LutGeneratorTool";
import { Film, CheckCircle2, HelpCircle, Sparkles, Sliders, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Free 3D LUT Generator (.CUBE) — Cinematic Color Grading for Premiere & After Effects",
  description:
    "Free online 3D LUT generator (.CUBE). Create custom Hollywood Teal & Orange, Kodak 2383 film looks, cyberpunk color grades, and export 33x33 .CUBE files for Adobe Premiere Pro, After Effects, and DaVinci Resolve.",
  keywords: [
    "lut generator online",
    "cube lut generator",
    "free 3d lut creator",
    "premiere pro lut generator",
    "after effects lut",
    "teal and orange lut online",
    "kodak 2383 lut free",
    "davinci resolve lut export",
    "video color grading online",
    "compx orbit lut generator",
  ],
  openGraph: {
    title: "Free 3D LUT Generator (.CUBE) — Cinematic Color Grading for Premiere & After Effects",
    description:
      "Design custom cinematic color grades with real-time before/after split screen and export industry-standard .CUBE 3D LUTs for Adobe Premiere Pro, After Effects, and DaVinci Resolve.",
    url: "https://compxorbit.com/video-tools/lut-generator",
    type: "website",
  },
};

export default function LutGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cinematic 3D LUT Generator",
    url: "https://compxorbit.com/video-tools/lut-generator",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Interactive 3D LUT generator for Adobe Premiere Pro, After Effects, and DaVinci Resolve. Features real-time split-screen comparison, Hollywood presets, split-toning, and instant .CUBE export.",
    featureList: [
      "Export 33x33 and 17x17 standard .CUBE 3D LUT files",
      "Hollywood Teal & Orange, Kodak 2383, and Cyberpunk presets",
      "Interactive before/after split slider on sample & uploaded frames",
      "Split-toning for shadows and highlights color grading",
      "100% Client-side processing with zero server uploads",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
            <Film className="h-3.5 w-3.5" />
            <span>Cinematic Post-Production</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Free Cinematic 3D LUT (.CUBE) Generator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Craft Hollywood color grades right in your browser. Live before/after split preview,
            split-toning curves, and instant <span className="text-[#3cff5f] font-mono">.CUBE</span> export
            ready for Adobe Premiere Pro, After Effects, and DaVinci Resolve.
          </p>
        </div>

        {/* Main Tool Component */}
        <LutGeneratorTool />

        {/* SEO Features & Educational Guide Section */}
        <div className="mt-16 space-y-12">
          {/* Why Use CompX 3D LUTs */}
          <div className="rounded-2xl border border-[#26332d] bg-[#0c1410] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3cff5f]" />
              <span>Why Use CompX Orbit 3D LUTs for Video Editing?</span>
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <Film className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">100% Industry Standard .CUBE</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  Our algorithm creates mathematical 33×33×33 RGB Look-Up Tables. Compatible with Adobe Premiere Pro Lumetri Color, After Effects, DaVinci Resolve, Final Cut Pro, Photoshop, and OBS Studio.
                </p>
              </div>

              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <Sliders className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">Real-Time Canvas Split Screen</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  Inspect the subtle nuances of skin tone retention, shadow tinting, and highlight roll-off with an interactive drag divider before downloading your LUT.
                </p>
              </div>

              <div className="rounded-xl border border-[#1c2a22] bg-[#08100c] p-5">
                <span className="inline-block p-2 rounded-lg bg-[#102a16] text-[#3cff5f] mb-3">
                  <Layers className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-[#e7eee9]">Zero Cloud Uploads &amp; Free</h3>
                <p className="mt-2 text-xs text-[#9baaa1] leading-relaxed">
                  All color transformation and matrix interpolation runs locally inside your browser using client-side JavaScript. Your client footage never leaves your computer.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ */}
          <div className="rounded-2xl border border-[#26332d] bg-[#0c1410] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9] flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">What is the difference between 33×33 and 17×17 LUTs?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  A 33×33×33 LUT samples 35,937 color points, providing smooth color transitions with zero banding for 4K film mastering. A 17×17×17 LUT samples 4,913 points, making it ideal for mobile editing apps (VN, CapCut) and live streaming software like OBS Studio.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">Can I use these LUTs on LOG footage (S-Log3, C-Log)?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  These LUTs are calibrated for standard Rec.709 color space. If shooting in S-Log3, C-Log, or D-Log, first apply your camera manufacturer&apos;s technical conversion LUT (or CST in DaVinci), and then apply this creative look LUT on top.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">How do I apply this LUT in Adobe After Effects?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  Create an Adjustment Layer on top of your timeline, go to <em>Effects &gt; Color Correction &gt; Apply Color LUT</em>, click Browse, and pick your downloaded .cube file.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#3cff5f]">Is there any watermark or commercial license fee?</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">
                  No! CompX Orbit tools are 100% free with no watermarks and no registration. All exported LUTs are royalty-free for commercial YouTube videos, films, and client deliverables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
