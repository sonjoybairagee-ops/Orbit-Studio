import { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import { TOOLS_DATA } from "@/lib/tools-data";
import { FileText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online PDF Tools - Merge, Split, Compress & Organize PDFs",
  description: "Complete client-side PDF tool suite: Merge PDF, Split PDF, Compress PDF, Images to PDF, and PDF Page Organizer without server uploads.",
  keywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "images to pdf", "pdf organizer", "free online pdf"],
};

export default function PdfToolsPage() {
  const pdfTools = TOOLS_DATA.filter((tool) => tool.category === "pdf");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 mb-3">
          <FileText className="h-3.5 w-3.5" />
          <span>Client-Side PDF Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Online PDF Tools
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Fast, browser-based utilities to merge, split, compress, convert images, and reorder pages in your PDF files without size limits or security risks.
        </p>
      </div>

      {/* Grid of PDF Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
