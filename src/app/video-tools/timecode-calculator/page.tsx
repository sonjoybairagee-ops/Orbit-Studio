import { Metadata } from "next";
import AdvancedTimecodeCalculatorTool from "@/components/tools/AdvancedTimecodeCalculatorTool";
import { Film, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Advanced SMPTE Timecode Calculator — Frame to Timecode, FPS Conversion & Duration",
  description:
    "Free online SMPTE Timecode Calculator for video editors and colorists. Convert frames to timecode, 23.976/24/25/29.97 DF/NDF/60 fps, calculate in/out durations, and audio samples.",
  keywords: [
    "timecode calculator",
    "frames to timecode",
    "timecode to frames",
    "smpte timecode converter",
    "drop frame calculator",
    "23.976 to 29.97 timecode",
    "video editor timecode",
    "premiere pro timecode calculator",
    "davinci resolve timecode calculator",
  ],
};

export default function TimecodeCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Advanced Timecode Calculator",
    url: "https://compxorbit.com/video-tools/timecode-calculator",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Broadcast-grade SMPTE Timecode Calculator with Drop-Frame, Frame to Timecode, and Cross-FPS conversion.",
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
            <Film className="h-3.5 w-3.5" />
            <span>Editing Workflow Tools</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Advanced Timecode Calculator
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Broadcast-grade SMPTE 12M timecode utility for video editors,
            colorists, and sound designers. Frame to timecode, Drop-Frame (DF)
            sync, cross-FPS conversions, and in/out durations.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <AdvancedTimecodeCalculatorTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Use Timecode Calculator for Video Editing</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Select Timeline FPS</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Choose your project frame rate (23.976 film, 24 cinema, 25 PAL, or 29.97 / 59.94 DF/NDF).
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Convert or Calculate</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Input timecodes or total frames to get real-time synchronized calculations and 35mm film / 48kHz audio sample counts.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Copy to NLE Timeline</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Click the Copy button to paste directly into Adobe Premiere Pro, After Effects, DaVinci Resolve, or Final Cut Pro.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#e7eee9] flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-[#8da195]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
            <h3 className="text-sm font-bold text-[#e7eee9]">
              What is the difference between Drop-Frame (DF) and Non-Drop-Frame (NDF)?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9baaa1]">
              In 29.97 fps video, each frame lasts 1/29.97 second (~33.3667ms). If counted with standard 30fps numbers (Non-Drop Frame), after 1 hour the timecode will read 01:00:00:00, but exactly 3,603.6 real clock seconds have passed! To fix this drift for TV broadcasts, Drop-Frame drops the frame label numbers 00 and 01 at the minute mark of every minute, EXCEPT every tenth minute (00, 10, 20, 30, 40, 50). No video frames are deleted; only timecode numbering is adjusted.
            </p>
          </div>

          <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
            <h3 className="text-sm font-bold text-[#e7eee9]">
              How does inclusive vs exclusive duration calculation work?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9baaa1]">
              In standard video editing timelines (NLEs), when you set Mark In at 00:00:01:00 and Mark Out at 00:00:01:00, the playhead plays exactly 1 frame. Therefore, SMPTE duration is inclusive (Out − In + 1 frame). Exclusive mode (Out − In) is typically used for mathematical offsets or duration measurement between timeline cut points.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
