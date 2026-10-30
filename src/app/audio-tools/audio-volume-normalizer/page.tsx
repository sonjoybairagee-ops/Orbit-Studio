import { Metadata } from "next";
import AudioVolumeNormalizerTool from "@/components/tools/AudioVolumeNormalizerTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Audio Volume Normalizer — Free Online Loudness Equalizer | ToolHub",
  description:
    "Normalize audio loudness and volume levels to -1 dBFS peak amplitude online. Fix quiet audio, prevent distortion, and download clean WAV files instantly.",
  keywords: ["audio volume normalizer", "normalize audio online", "audio loudness equalizer", "level audio peak", "audio gain normalization"],
};

export default function AudioVolumeNormalizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Audio Volume Normalizer",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser audio volume normalizer using Web Audio API.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/60 mb-2">
            100% Free · Web Audio API
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Audio Volume Normalizer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Analyze peak amplitude and boost or balance track loudness to a target decibel level without clipping.
          </p>
        </div>

        <div className="mb-14">
          <AudioVolumeNormalizerTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-600" />
            How to Normalize Audio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload Audio", body: "Select or drop any MP3, WAV, OGG, or AAC audio file from your device." },
              { step: 2, title: "Set Target dBFS", body: "Adjust the loudness slider between -6 dBFS (gentle) and 0 dBFS (maximum peak)." },
              { step: 3, title: "Render & Download", body: "Click Normalize to render the leveled audio buffer in offline Web Audio and export clean WAV." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-violet-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is peak volume normalization?",
                a: "Peak normalization scans an entire audio waveform to find the loudest sample, then applies a uniform gain multiplier so the highest peak matches the desired target level (e.g. -1 dBFS) without introducing clipping.",
              },
              {
                q: "Is my audio uploaded to any server?",
                a: "No! All decoding, peak detection, and gain scaling happens entirely inside your browser using the HTML5 Web Audio API.",
              },
              {
                q: "What format is the downloaded file?",
                a: "The normalized audio is rendered as uncompressed 16-bit PCM WAV at the original sample rate, preserving full fidelity.",
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
