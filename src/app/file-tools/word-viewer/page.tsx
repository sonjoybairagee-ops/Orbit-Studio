import { Metadata } from "next";
import WordViewerTool from "@/components/tools/WordViewerTool";
import { CheckCircle2, HelpCircle, FileText, Lock, Sparkles, Download, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Word (.docx) Viewer & Editor — Free Online Microsoft Word Engine | CompX Orbit",
  description:
    "Open, view, edit, and export Microsoft Word (.docx) files 100% free in your browser. Real-time WYSIWYG editing, table formatting, live word stats, and 1-click export to DOCX, PDF, HTML, or Markdown with zero server uploads.",
  alternates: {
    canonical: "/file-tools/word-viewer",
  },
  keywords: [
    "word viewer online",
    "docx viewer",
    "word editor online free",
    "edit docx without word",
    "open docx in browser",
    "docx to pdf online",
    "docx to markdown",
    "word file viewer and editor",
    "free word processor online",
    "compx orbit docx",
  ],
  openGraph: {
    title: "Word (.docx) Viewer & Editor — Free Online Microsoft Word Engine",
    description:
      "Open, view, format, and edit Word documents directly in your browser. Download as authentic DOCX, PDF, or HTML with 100% client-side privacy.",
    url: "https://compxorbit.com/file-tools/word-viewer",
    type: "website",
  },
};

export default function WordViewerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Word (.docx) Viewer & Editor Engine",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free in-browser Microsoft Word (.docx) viewer, rich text editor, and multi-format exporter with zero server uploads and complete privacy.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Intro */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142319] border border-[#233829] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            100% Free · OpenXML Engine · In-Browser Privacy · Zero Uploads
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Word (.docx) Viewer &amp; Editor
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9cb1a5] max-w-2xl mx-auto">
            Open Microsoft Word documents, edit text, headings, lists &amp; tables in a realistic page canvas, and export back to <strong>.docx</strong>, <strong>PDF</strong>, <strong>HTML</strong>, or <strong>Markdown</strong> without installing software.
          </p>
        </div>

        {/* Interactive Editor Tool */}
        <div className="mb-14">
          <WordViewerTool />
        </div>

        {/* Feature Highlights Grid */}
        <div className="rounded-3xl border border-[#223328] bg-[#0c1410] p-6 sm:p-10 mb-10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            Why Use CompX Orbit Word Engine?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "100% Client-Side Privacy",
                subtitle: "Zero Server Uploads",
                desc: "Your confidential documents, contracts, and scripts never touch a remote server. The OpenXML engine runs purely in your browser's local memory.",
                icon: Lock,
              },
              {
                title: "Rich WYSIWYG Editing",
                subtitle: "Page & Web Views",
                desc: "Full formatting control: custom fonts, sizes, text colors, highlights, headings, alignment, lists, blockquotes, and interactive data tables.",
                icon: FileText,
              },
              {
                title: "Multi-Format Exporter",
                subtitle: "DOCX · PDF · HTML · MD · TXT",
                desc: "Download as an authentic OpenXML .docx file compatible with Office 365, Google Docs, and LibreOffice, or export to PDF, HTML, and Markdown.",
                icon: Download,
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-2xl bg-[#121c16] p-5 border border-[#1e2e23]">
                  <div className="w-9 h-9 rounded-xl bg-[#182b1f] border border-[#284833] flex items-center justify-center text-[#3cff5f] mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="mt-1 font-mono text-xs text-[#3cff5f] font-semibold">{f.subtitle}</p>
                  <p className="mt-2 text-xs text-[#8da096] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-[#223328] bg-[#0c1410] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-[#1c2921]">
            {[
              {
                q: "Can I open any Microsoft Word (.docx) file?",
                a: "Yes! Our parser reads the standard OpenXML specification (word/document.xml) used by Microsoft Word 2007 through Word 365, Google Docs, LibreOffice Writer, and Apple Pages.",
              },
              {
                q: "Will my document remain private?",
                a: "Absolutely 100%. Everything operates inside your web browser using client-side JavaScript (JSZip + DOMParser). No files or text are ever transmitted to any external server.",
              },
              {
                q: "Can I export back to .docx after editing?",
                a: "Yes. When you click 'Export & Download' → 'Microsoft Word (.docx)', the tool constructs a brand-new OpenXML package containing valid XML tags and styles that open directly in Microsoft Word and Google Docs.",
              },
              {
                q: "Can I copy formatted text into Google Docs or Gmail?",
                a: "Yes! Use the 'Copy Formatted' button to copy both rich HTML and plain text to your system clipboard. You can paste it directly into Word, Docs, Gmail, Outlook, Notion, or Slack with full formatting preserved.",
              },
            ].map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                <p className="mt-2 text-xs text-[#9cb1a5] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

