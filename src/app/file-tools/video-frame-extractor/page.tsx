import { Metadata } from "next";
import VideoFrameExtractorTool from "@/components/tools/VideoFrameExtractorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Frame Extractor — Capture Video Screenshots & Stills | ToolHub",
  description:
    "Extract high-resolution image frames and stills from any video file online. Scrub to any timestamp, batch-extract frames, and download as JPEG or ZIP archive.",
  keywords: ["video frame extractor", "video to image", "capture video screenshot", "extract frames from video", "video to jpg"],
};

export default function VideoFrameExtractorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Video Frame Extractor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser video frame grabber and extractor.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 border border-orange-200/60 mb-2">
            100% Free · Full Resolution
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Video Frame Extractor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Capture single crystal-clear snapshot frames or batch-extract evenly spaced frame sequences across any video.
          </p>
        </div>

        <div className="mb-14">
          <VideoFrameExtractorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-orange-600" />
            How to Extract Frames from Video
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Open Video", body: "Select your MP4, WebM, or MOV video file. It loads directly into the interactive HTML5 player." },
              { step: 2, title: "Choose Timestamp", body: "Play or scrub to the exact moment you want, or select auto-extract count (5-30 frames)." },
              { step: 3, title: "Save Images", body: "Download individual frames in full resolution JPEG, or click 'Download All as ZIP' to save the complete bundle." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white mb-3">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-orange-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Are the extracted images full resolution?",
                a: "Yes! Frames are rendered directly to canvas at the video's native pixel resolution (up to 4K / 1080p) without downsampling.",
              },
              {
                q: "Can I grab frames from phone videos?",
                a: "Absolutely. iPhone MOV and Android MP4 videos are completely supported right in the browser.",
              },
              {
                q: "Do you store or upload my video files?",
                a: "Never. All frame seeking and snapshotting occurs locally in your browser memory.",
              },
            ].map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="text-sm font-bold text-slate-800">{faq.q}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
