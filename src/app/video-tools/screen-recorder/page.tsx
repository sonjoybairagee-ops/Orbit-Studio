import type { Metadata } from "next";
import Link from "next/link";
import { Video, Sparkles, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import ScreenRecorderTool from "@/components/tools/ScreenRecorderTool";

export const metadata: Metadata = {
  title: "Free Online Screen Recorder with Audio (No Watermark) | Compx Orbit",
  description:
    "Record screen, webcam, system audio, and microphone directly in your browser. No software installation, no watermarks, and unlimited recording time. Export 1080p MP4.",
  keywords: [
    "online screen recorder free",
    "screen recorder without watermark",
    "free screen recorder no download",
    "record screen and webcam online",
    "record chrome tab with audio",
    "free loom alternative no limit",
  ],
  alternates: {
    canonical: "/video-tools/screen-recorder",
  },
  openGraph: {
    title: "Free Online Screen Recorder with Audio (No Watermark) | Compx Orbit",
    description:
      "Capture high-definition screen video, webcam PIP, and audio in your browser with zero limits.",
    url: "/video-tools/screen-recorder",
    type: "website",
  },
};

export default function ScreenRecorderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Online Screen & Webcam Recorder",
    url: "https://compxorbit.com/video-tools/screen-recorder",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Record full screen, application windows, or webcam bubble with system audio and mic directly in your browser.",
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
          <span className="text-[#e7eee9]">Screen &amp; Webcam Recorder</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Browser-Based Video Capture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e7eee9]">
            Free Online Screen Recorder
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Record high-definition full screen, browser tabs, or webcam overlay with system sound and microphone narration.
            No software download, no watermarks, and no 5-minute time caps.
          </p>
        </div>

        {/* Interactive Tool Component */}
        <ScreenRecorderTool />

        {/* Features Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">No Time Caps</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Unlike Loom or other tools that cut you off after 5 minutes, our browser recorder lets you record for as long as you need with zero interruptions.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <Video className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">Zero Watermarks</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Download clean 1080p MP4 or WebM videos ready for YouTube, team sharing, tutorials, or course presentations with no branding overlaid.
            </p>
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-6">
            <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-2">100% Secure &amp; Local</h3>
            <p className="text-xs text-[#9baaa1] leading-relaxed">
              Video capture happens exclusively on your local machine using the native Screen Capture and MediaRecorder APIs. Nothing is transmitted to external servers.
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
                Can I record audio from both my computer and microphone?
              </h3>
              <p className="leading-relaxed">
                Yes! When sharing your screen, check &quot;Also share system audio&quot; to capture game or video sound, and keep the &quot;Mic On&quot; button enabled to narrate simultaneously.
              </p>
            </div>

            <div className="border-b border-[#213026] pb-4">
              <h3 className="font-bold text-[#e7eee9] mb-1">
                How does the Webcam Bubble (Picture-in-Picture) work?
              </h3>
              <p className="leading-relaxed">
                Select &quot;Screen + Cam&quot; mode. The tool captures both streams and dynamically renders your circular webcam facecam bubble in the corner of your video recording.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#e7eee9] mb-1">
                Do I need to install any software or Chrome extension?
              </h3>
              <p className="leading-relaxed">
                No software or extension required! Modern browsers (Chrome, Edge, Firefox, Safari) support native screen recording out-of-the-box.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

