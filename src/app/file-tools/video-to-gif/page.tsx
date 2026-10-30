import { Metadata } from "next";
import VideoToGifTool from "@/components/tools/VideoToGifTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Video to GIF Converter — Create Animated GIFs Online | ToolHub",
  description:
    "Convert MP4, WebM, and MOV video clips into high quality animated GIFs online for free. Trim clips, select frame rate and size, and download instant GIFs.",
  keywords: ["video to gif", "convert mp4 to gif", "video to animated gif", "gif maker online free", "webm to gif"],
};

export default function VideoToGifPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Video to GIF Converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser video to animated GIF converter.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-2">
            100% Free · No Upload
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Video to Animated GIF Converter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Turn your favorite video moments into lightweight, looping animated GIFs right inside your web browser.
          </p>
        </div>

        <div className="mb-14">
          <VideoToGifTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-rose-600" />
            How to Convert Video to GIF
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Load Video", body: "Select any MP4, WebM, or MOV video file from your phone or computer." },
              { step: 2, title: "Trim & Configure", body: "Pick start and end timestamps, choose desired frames per second (FPS) and output width." },
              { step: 3, title: "Generate & Download", body: "Click Convert to capture frames via Canvas and generate a standard GIF89a looping animation." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-rose-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What video formats are supported?",
                a: "You can convert MP4, WebM, and MOV videos supported by modern web browsers.",
              },
              {
                q: "What is the recommended FPS for GIFs?",
                a: "10 FPS provides the ideal balance between smooth animation and compact file size for social media, Discord, and Slack.",
              },
              {
                q: "Is there any watermark added?",
                a: "Never! All GIFs created on ToolHub are 100% clean, unwatermarked, and free.",
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
