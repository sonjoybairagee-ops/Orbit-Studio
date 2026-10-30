import { Metadata } from "next";
import ZipCreatorTool from "@/components/tools/ZipCreatorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "ZIP File Creator — Create and Compress ZIP Archives Online | ToolHub",
  description:
    "Compress multiple files into a single ZIP archive online for free. Support for all file formats, custom compression levels, zero server uploads, 100% private.",
  keywords: ["zip file creator", "create zip online", "compress files to zip", "zip maker online free", "online zip archiver"],
};

export default function ZipFileCreatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub ZIP File Creator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser ZIP archive creator and compressor.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 mb-2">
            100% Free · Unlimited Files
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ZIP File Creator & Compressor
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Bundle multiple images, documents, audio clips, and data files into an optimized .zip archive instantly.
          </p>
        </div>

        <div className="mb-14">
          <ZipCreatorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            How to Create a ZIP Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Add Files", body: "Drag & drop or browse multiple files of any type (PDF, PNG, JPG, MP3, TXT, etc.)." },
              { step: 2, title: "Configure", body: "Name your archive and pick your compression speed vs size ratio (Store, Standard, or Maximum)." },
              { step: 3, title: "Download ZIP", body: "Click Create ZIP Archive and download your packaged .zip file instantly." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white mb-3">
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
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Is there a limit on how many files I can add?",
                a: "No! You can bundle dozens of files together in a single operation directly in your web browser.",
              },
              {
                q: "Is this secure for sensitive documents?",
                a: "Yes! Your files never leave your computer. JSZip creates the archive purely in browser memory without sending a single byte across the internet.",
              },
              {
                q: "Can I open the downloaded ZIP on Windows and Mac?",
                a: "Yes! ToolHub produces industry-standard DEFLATE-compressed ZIP archives natively supported by Windows Explorer, macOS Archive Utility, Linux, iOS, and Android.",
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
