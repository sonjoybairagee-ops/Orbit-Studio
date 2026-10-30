import { Metadata } from "next";
import QrCodeGeneratorTool from "@/components/tools/QrCodeGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "QR Code Generator — Free Online Custom QR Code Maker | ToolHub",
  description:
    "Generate custom QR codes for website URLs, WiFi credentials, plain text, email, and phone numbers. Custom colors, high resolution, no expiration, 100% free.",
  keywords: ["qr code generator", "create qr code online", "wifi qr code", "free qr code maker", "custom color qr code"],
};

export default function QrCodeGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub QR Code Generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser custom QR code generator with color and error-correction controls.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60 mb-2">
            100% Client-Side · No Expiration
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Custom QR Code Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Create high-quality, permanent QR codes for URLs, WiFi passwords, contact details, and text with custom colors.
          </p>
        </div>

        <div className="mb-14">
          <QrCodeGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            How to Create a QR Code
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Choose Type", body: "Select whether you want to encode a website link, WiFi access credentials, text, email, or telephone." },
              { step: 2, title: "Customize", body: "Pick your foreground and background colors to match your brand, and adjust dimensions." },
              { step: 3, title: "Download", body: "Save the generated high-resolution PNG image directly to your phone or computer." },
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
                q: "Do these QR codes ever expire?",
                a: "No! These are standard static QR codes. The encoded data is baked directly into the visual pattern, so they will work forever without any recurring fees or expiration dates.",
              },
              {
                q: "What does Error Correction Level do?",
                a: "Error correction allows a QR code to remain readable even if it is partially dirty or covered. 'High (30%)' allows the code to be up to 30% obstructed and still scan reliably.",
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
