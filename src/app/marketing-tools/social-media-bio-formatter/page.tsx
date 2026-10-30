import { Metadata } from "next";
import SocialMediaBioFormatterTool from "@/components/tools/SocialMediaBioFormatterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Social Media Bio Formatter — Fancy Fonts & Character Limits | ToolHub",
  description:
    "Format bios for Instagram, TikTok, Twitter/X, and LinkedIn. Includes fancy Unicode bold/italic fonts, anti-collapse blank line breaks, and live character limit counters.",
  keywords: [
    "social media bio formatter",
    "instagram bio font generator",
    "tiktok bio character counter",
    "twitter bio formatter",
    "fancy bio text generator",
    "instagram blank line break spacer",
    "aesthetic bio fonts",
  ],
};

export default function SocialMediaBioFormatterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Social Media Bio Formatter",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser social media bio formatter with fancy Unicode fonts, character limit checkers, and anti-collapse line spacers.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200/60 mb-2">
            100% Free · Fancy Unicode Fonts · Anti-Collapse Spacing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Social Media Bio Formatter &amp; Font Styler
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Design standout bios for Instagram, TikTok, X (Twitter), Threads, and LinkedIn with aesthetic fonts, clean line breaks, and real-time character limit trackers.
          </p>
        </div>

        <div className="mb-14">
          <SocialMediaBioFormatterTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            Social Media Character Limit Cheat Sheet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Instagram Bio (150 Chars)",
                formula: "Max 150 characters total",
                desc: "Include a strong hook on line 1, social proof on line 2, and a clear Call To Action (CTA) pointing to your link-in-bio on line 3.",
              },
              {
                title: "TikTok Bio (80 Chars)",
                formula: "Shortest limit: 80 characters",
                desc: "TikTok strictly caps bios at 80 characters. Keep it punchy, direct, and focused on your niche.",
              },
              {
                title: "Anti-Collapse Invisible Spaces",
                formula: "Fixes collapsed line breaks",
                desc: "Instagram often strips empty blank lines. Our 'Empty Line Break' button inserts invisible non-breaking spaces so your spacing stays pristine.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-purple-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Are these fancy fonts compatible across all devices?",
                a: "Yes! These are standard mathematical alphanumeric Unicode characters that render cleanly across iOS, Android, macOS, and Windows without needing custom fonts installed.",
              },
              {
                q: "Why does Instagram collapse my blank lines?",
                a: "Instagram's text sanitizer automatically collapses consecutive newline characters (\\n\\n). Using an invisible Braille space (\\u2800) tricks the parser into preserving your line break.",
              },
              {
                q: "Can I use these fonts in my username?",
                a: "While some platforms permit Unicode in Display Names, standard @handles require standard alphanumeric characters (a-z, 0-9).",
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
