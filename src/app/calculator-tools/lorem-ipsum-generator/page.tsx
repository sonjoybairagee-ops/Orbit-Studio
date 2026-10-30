import { Metadata } from "next";
import LoremIpsumGeneratorTool from "@/components/tools/LoremIpsumGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator — Dummy Text & Placeholder Maker | ToolHub",
  description:
    "Generate dummy placeholder text by paragraphs, sentences, words, or lists. Optional HTML tag wrapping (<p>, <li>), word and character counters, instant copy.",
  keywords: ["lorem ipsum generator", "dummy text generator", "placeholder text maker", "lorem ipsum html", "generate latin text"],
};

export default function LoremIpsumGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Lorem Ipsum Generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser dummy text generator with HTML tag options.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            100% Free · HTML Tag Formatting
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Lorem Ipsum Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Generate customizable dummy text for wireframes, graphic designs, and web layouts in seconds.
          </p>
        </div>

        <div className="mb-14">
          <LoremIpsumGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            Why Designers Use Lorem Ipsum
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Avoid Distraction", desc: "Using readable English text in mockups causes clients to read content rather than evaluate layout, hierarchy, and fonts." },
              { title: "Realistic Distribution", desc: "Lorem ipsum mimics natural letter and word spacing far better than repeating 'content here' or 'text here'." },
              { title: "HTML Ready", desc: "Toggle 'Wrap in HTML tags' to automatically generate clean `<p>` or `<ul><li>` structures ready for codebases." },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Where does Lorem Ipsum come from?",
                a: "It originates from sections 1.10.32 and 1.10.33 of Cicero's 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil), written in 45 BC.",
              },
              {
                q: "Can I download the text as a file?",
                a: "Yes! Click the 'Download .txt' button to save the generated text directly to your device.",
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
