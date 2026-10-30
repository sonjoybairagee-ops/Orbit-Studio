import { Metadata } from "next";
import AudioTrimmerTool from "@/components/tools/AudioTrimmerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Audio Trimmer — Cut and Trim Audio Online for Free | ToolHub",
  description:
    "Cut and trim audio files with millisecond precision online. Preview clips with real-time waveform slider, set start/end times, and export clean WAV clips.",
  keywords: ["audio trimmer", "cut audio online", "trim mp3", "audio cutter free", "cut wav online"],
};

export default function AudioTrimmerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Audio Trimmer",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser audio cutter and trimmer with precision timeline.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 border border-pink-200/60 mb-2">
            100% Free · Millisecond Precision
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Audio Trimmer & Cutter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Easily select start and end points, preview your clip, and download trimmed audio tracks without quality loss.
          </p>
        </div>

        <div className="mb-14">
          <AudioTrimmerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-pink-600" />
            How to Trim Audio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Choose Track", body: "Upload your MP3, WAV, or OGG file. The tool calculates exact duration and creates audio buffers." },
              { step: 2, title: "Adjust Bounds", body: "Drag the Start and End sliders or type timestamps to specify the segment you want to keep." },
              { step: 3, title: "Cut & Save", body: "Hit the Play button to preview your selection, then click Trim & Download to export your clip." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-pink-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Can I cut out ringtones or podcast intros?",
                a: "Yes! Audio Trimmer is ideal for extracting ringtones, song intros, voice memo highlights, and podcast soundbites.",
              },
              {
                q: "Does trimming degrade audio quality?",
                a: "No, the audio samples are decoded directly to 32-bit float PCM and sliced without lossy re-encoding artifacts before outputting clean 16-bit WAV.",
              },
              {
                q: "Is there any duration or file size limit?",
                a: "Since processing runs directly in your browser's RAM, files under 100MB / 30 minutes process almost instantaneously.",
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
