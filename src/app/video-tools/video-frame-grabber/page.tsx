import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import VideoFrameGrabberTool from "@/components/tools/VideoFrameGrabberTool";

export const metadata: Metadata = {
  title: "Free 4K Video Frame Grabber & Screenshot Extractor | Compx Orbit",
  description:
    "Extract exact full-resolution 4K and 1080p frames from MP4, WebM, and MOV videos. Frame-by-frame precision stepping with lossless PNG export for YouTube thumbnails. 100% free and private.",
  keywords: [
    "video frame grabber",
    "extract frame from video",
    "video screenshot high quality",
    "save 4k frame from mp4",
    "video to png frame extractor",
    "youtube thumbnail frame grabber",
    "frame by frame video player",
  ],
  alternates: {
    canonical: "/video-tools/video-frame-grabber",
  },
  openGraph: {
    title: "Free 4K Video Frame Grabber & Screenshot Extractor | Compx Orbit",
    description:
      "Capture crisp, uncompressed full 4K and 1080p frames from any video for YouTube thumbnails and social covers.",
    url: "/video-tools/video-frame-grabber",
    type: "website",
  },
};

export default function VideoFrameGrabberPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "4K Video Frame Grabber & Screenshot Extractor",
    url: "https://compxorbit.com/video-tools/video-frame-grabber",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Extract full uncompressed 4K, 1080p, and high-resolution PNG frames from video files directly in your browser.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9baaa1] mb-6">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/video-tools" className="hover:text-[#3cff5f] transition-colors">Video Tools</Link>
          <span>/</span>
          <span className="text-[#e7eee9]">4K Video Frame Grabber</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>High-Res Video Capture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            4K Video Frame Grabber
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Extract exact full-resolution 4K and 1080p frames from your videos with frame-by-frame precision stepping.
            Export lossless PNGs ready for YouTube thumbnail and poster design.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <VideoFrameGrabberTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Original Pixel Clarity</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike regular screenshot hotkeys that capture blurry screen display pixels, our frame grabber decodes the true video stream at full native 4K or 1080p resolution.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Frame-by-Frame Stepping</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Step forward and backward frame-by-frame with 24, 25, 30, or 60 FPS accuracy to catch the exact facial expression or motion peak for your thumbnail.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% Private &amp; In-Browser</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Your video never leaves your computer. The video is decoded completely locally in your web browser with zero file uploads and zero limits.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 rounded-3xl border border-[#213026] bg-[#0c1510] p-8">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-[#9baaa1]">
            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Will the extracted image have the original video resolution?
              </h3>
              <p className="leading-relaxed">
                Yes! If your video is 4K (3840×2160), the exported PNG will be exactly 3840×2160 pixels with no downsampling or compression artifacts.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Can I copy the frame directly into Photoshop or Canva?
              </h3>
              <p className="leading-relaxed">
                Yes! Simply click the &quot;Copy&quot; button beneath any captured frame, and then press Ctrl+V (or Cmd+V) directly inside Photoshop, Illustrator, Figma, or Canva.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Is there any file size limit?
              </h3>
              <p className="leading-relaxed">
                No. Because the video is processed completely on your own machine using HTML5 Canvas, you can load large video files of several gigabytes smoothly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

