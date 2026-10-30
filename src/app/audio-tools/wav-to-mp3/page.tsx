import { Metadata } from "next";
import WavToMp3Tool from "@/components/tools/WavToMp3Tool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "WAV to MP3 Converter — Compress Audio Files Online | ToolHub",
  description:
    "Convert large uncompressed WAV files to highly-compressed audio formats online. Reduce audio file size by up to 80-90% for web sharing and streaming.",
  keywords: ["wav to mp3", "convert wav online", "compress audio", "wav compressor", "audio converter free"],
};

export default function WavToMp3Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub WAV to MP3 Converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser audio compressor and converter using MediaRecorder API.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            100% Free · High Efficiency
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            WAV to MP3 / Compressed Audio Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Compress large uncompressed WAV files into compact, shareable audio formats while maintaining crisp fidelity.
          </p>
        </div>

        <div className="mb-14">
          <WavToMp3Tool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            How to Convert & Compress Audio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Select WAV File", body: "Drop your WAV or uncompressed audio file into the converter box." },
              { step: 2, title: "Start Conversion", body: "Click Convert Now to stream encode the audio using the browser's hardware-accelerated MediaRecorder." },
              { step: 3, title: "Save Space", body: "Inspect your compression ratio savings and download your lightweight audio file." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "How much file size reduction can I expect?",
                a: "Uncompressed 16-bit WAV files typically reduce by 75% to 90%, turning a 50MB audio file into just 4-7MB.",
              },
              {
                q: "What codec is used for conversion?",
                a: "Modern browsers utilize the Opus/WebM audio codec, which provides superior voice and music quality even compared to traditional MP3 at equal bitrates.",
              },
              {
                q: "Are my audio files uploaded anywhere?",
                a: "No! All audio decoding and encoding occurs strictly on your machine.",
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
