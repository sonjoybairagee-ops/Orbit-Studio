import { Metadata } from "next";
import FaviconGeneratorTool from "@/components/tools/FaviconGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Favicon Generator — Create All Favicon Sizes & App Icons | ToolHub",
  description:
    "Generate web favicons, Apple iOS Touch icons, Android PWA icons, and HTML link tags online for free. Download individual PNGs or a complete ZIP package.",
  keywords: ["favicon generator", "create favicon online", "apple touch icon generator", "android pwa icon", "favicon zip bundle"],
};

export default function FaviconGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Favicon Generator",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Multi-size web favicon and mobile app icon generator with ZIP download.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Client-Side · ZIP Bundle & HTML Tags
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Favicon & App Icon Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Convert any logo or graphic into standard favicon sizes (16x16, 32x32, 180x180, 192x192) with tab mockups and instant ZIP download.
          </p>
        </div>

        <div className="mb-14">
          <FaviconGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Standard Favicon Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { size: "16x16 & 32x32", desc: "Used in desktop browser tabs, bookmark bars, history, and search result snippets." },
              { size: "180x180 iOS", desc: "High-resolution icon displayed when users bookmark your website to their iPhone or iPad home screen." },
              { size: "192x192 Android", desc: "Android Chrome PWA manifest icon used for installed progressive web applications." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-mono font-bold text-blue-600 mb-1 block">{f.size}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What files are included in the ZIP package?",
                a: "The ZIP archive contains favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png, plus an HTML setup guide.",
              },
              {
                q: "What image should I upload for best results?",
                a: "A square PNG logo with transparent background (at least 512x512 pixels) produces the crispest favicons across all devices.",
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
