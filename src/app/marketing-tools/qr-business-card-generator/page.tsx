import { Metadata } from "next";
import QrBusinessCardGeneratorTool from "@/components/tools/QrBusinessCardGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "QR Business Card Generator — Free Digital vCard QR Code | ToolHub",
  description:
    "Generate digital vCard QR codes for business cards, resumes, and networking. Scans automatically with iPhone and Android cameras to prompt 'Add to Contacts'.",
  keywords: [
    "qr business card generator",
    "vcard qr code generator",
    "digital business card qr",
    "contact qr code generator",
    "vcf qr code online",
    "networking qr code",
  ],
};

export default function QrBusinessCardGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub QR Business Card Generator",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser digital vCard QR business card generator with high-resolution PNG and .vcf downloads.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · Standard vCard 3.0 · Tap to Save Contacts
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Digital QR Business Card Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Create high-resolution scannable QR codes encoding your name, job title, phone, email, website, and office address for modern paperless networking.
          </p>
        </div>

        <div className="mb-14">
          <QrBusinessCardGeneratorTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Why Use a vCard QR Code on Your Business Card?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Instant One-Tap Contact Saving",
                formula: "No manual typing or misspelled emails",
                desc: "Scanning the QR code with any iOS or Android camera instantly opens the native Address Book contact card with 'Save Contact'.",
              },
              {
                title: "Print & Resume Ready",
                formula: "High-contrast 300 DPI PNG export",
                desc: "Place the QR code on physical business cards, badge lanyards, conference slide decks, and digital PDF resumes.",
              },
              {
                title: "Offline Native Standard",
                formula: "Standard vCard 3.0 format",
                desc: "The entire contact payload is encoded inside the QR matrix itself. No third-party hosting, monthly hosting fees, or link redirection needed.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-blue-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
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
                q: "Do people need a special app to scan this QR code?",
                a: "No! All modern smartphones (iPhone Camera app, Samsung Camera, Google Lens) recognize vCard QR codes natively without any special software.",
              },
              {
                q: "Can I customize the color of the QR code?",
                a: "Yes! Use the color pickers beneath the form to match the QR foreground and background colors to your business card design.",
              },
              {
                q: "What is a .vcf file?",
                a: "A .vcf (Virtual Contact File) is the universal file format for exchanging electronic business cards. Click 'Download .vcf' to save a backup to your device.",
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
