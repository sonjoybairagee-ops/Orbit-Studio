import { Metadata } from "next";
import CvMakerTool from "@/components/tools/CvMakerTool";
import {
  FileText,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Printer,
  Download,
  ShieldCheck,
  Zap,
  Briefcase,
  Layout,
  Palette,
  Eye,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free CV & Resume Maker — 5 Pro Templates & Instant PDF Export | CompX Orbit",
  description:
    "Free online CV and Resume Maker engine with 5 designer templates (Modern Orbit, Elegant Sidebar, ATS-Optimized Clean, Executive Corporate, Creative Tech). Personalize profile, experience, skills, and export to print-ready PDF with zero server upload.",
  keywords: [
    "cv maker",
    "resume maker",
    "free resume builder",
    "cv maker online free",
    "cv template download",
    "ats friendly resume builder",
    "online resume creator pdf",
    "professional cv maker",
    "motion designer resume",
    "software engineer cv template",
  ],
  alternates: {
    canonical: "/pdf-tools/cv-maker",
  },
  openGraph: {
    title: "Free CV & Resume Maker — 5 Pro Templates & Instant PDF Export",
    description:
      "Interactive browser-based CV builder with live reactive preview, 5 professional templates, photo upload, and instant PDF print download. 100% free and private.",
    url: "https://compxorbit.com/pdf-tools/cv-maker",
    type: "website",
  },
};

export default function CvMakerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit CV & Resume Maker Engine",
    url: "https://compxorbit.com/pdf-tools/cv-maker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Client-side CV and Resume Maker: build professional, ATS-friendly resumes with 5 visual templates, live preview, customizable palettes, and 1-click PDF print export.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>5 Pro Templates · 100% Free · Client-Side PDF Generation</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            CV & Resume Maker Engine
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#8da194] max-w-2xl mx-auto">
            Design standout, ATS-ready resumes in minutes. Choose from 5 curated designer templates, switch color accents, upload your photo, and export crisp <b>Print-Ready A4 PDF</b> instantly.
          </p>
        </div>

        {/* Main Interactive Tool Container */}
        <div className="mb-14">
          <CvMakerTool />
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 rounded-2xl border border-[#1b271f] bg-[#0d1410] p-6 sm:p-10">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-wider text-[#3cff5f] font-semibold">
              Engine Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#e7eee9] mt-1">
              Why Build Your Resume on CompX Orbit?
            </h2>
            <p className="text-sm text-[#8da194] mt-2 max-w-xl mx-auto">
              Built for creatives, developers, executives, and job-seekers who need clean typography, flexible customization, and uncompromising privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <Layout className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">5 Designer Templates</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Modern Orbit, Elegant Sidebar, ATS-Optimized Clean, Executive Corporate, and Creative Tech. Switch templates anytime with zero data loss.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">Personalized Branding</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Customize accent color themes (Emerald, Royal Blue, Rose Ruby, Sunset Orange, Slate, Onyx), font pairings, photo size, and social handles.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <Printer className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">Vector-Grade PDF Export</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Direct browser A4 print engine outputs razor-sharp vector text and selectable links. Compatible with ATS scanners and executive email attachments.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">1-Click Sample Profiles</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Explore pre-filled professional samples for Motion Designers, Senior Software Engineers, and Creative Directors, or start fresh with a blank canvas.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Your personal contact details, work history, and photo remain strictly in your browser. Nothing is uploaded to or stored on external servers.
              </p>
            </div>

            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-5">
              <div className="h-10 w-10 rounded-lg bg-[#142d1b] border border-[#234d2e] flex items-center justify-center text-[#3cff5f] mb-4">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#e7eee9] text-base mb-2">Backup & Restore</h3>
              <p className="text-xs sm:text-sm text-[#8da194] leading-relaxed">
                Save your progress with encrypted JSON backups and load them anytime in seconds to update your achievements or apply for new roles.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mt-12 rounded-2xl border border-[#1b271f] bg-[#0d1410] p-6 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
              How to Create Your Personalized Resume in 3 Simple Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f] font-bold flex items-center justify-center text-lg mb-3">
                1
              </div>
              <h3 className="font-semibold text-[#e7eee9] mb-1">Pick a Template or Sample</h3>
              <p className="text-xs text-[#8da194]">
                Select between modern sidebar, clean ATS, or executive layouts. Load sample data to see an ideal structure.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f] font-bold flex items-center justify-center text-lg mb-3">
                2
              </div>
              <h3 className="font-semibold text-[#e7eee9] mb-1">Fill in Your Experience</h3>
              <p className="text-xs text-[#8da194]">
                Add your career highlights, education, key technical competencies, portfolio projects, and profile photo.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f] font-bold flex items-center justify-center text-lg mb-3">
                3
              </div>
              <h3 className="font-semibold text-[#e7eee9] mb-1">Export to PDF</h3>
              <p className="text-xs text-[#8da194]">
                Hit &ldquo;Export PDF / Print&rdquo;, choose &ldquo;Save as PDF&rdquo;, and submit your application with confidence!
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 rounded-2xl border border-[#1b271f] bg-[#0d1410] p-6 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-4">
              <h3 className="text-sm font-semibold text-[#e7eee9] mb-1">
                Is this CV Maker completely free to use?
              </h3>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Yes! There are no watermarks, no trial paywalls, and no subscription requirements. You can create and export as many resumes as you need.
              </p>
            </div>
            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-4">
              <h3 className="text-sm font-semibold text-[#e7eee9] mb-1">
                Are these resume templates ATS-friendly?
              </h3>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Yes, especially the &ldquo;ATS-Optimized Clean&rdquo; and &ldquo;Executive Corporate&rdquo; templates, which adhere to strict single-column hierarchies, standard section headers, and semantic text structures recognized by Applicant Tracking Systems.
              </p>
            </div>
            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-4">
              <h3 className="text-sm font-semibold text-[#e7eee9] mb-1">
                How do I save my CV to edit it again later?
              </h3>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Click &ldquo;Backup JSON&rdquo; in the top bar to download a lightweight JSON file containing all your data. Next time, simply click &ldquo;Load JSON&rdquo; to resume editing right where you left off.
              </p>
            </div>
            <div className="rounded-xl border border-[#1f3024] bg-[#111a14] p-4">
              <h3 className="text-sm font-semibold text-[#e7eee9] mb-1">
                Is my personal contact information safe?
              </h3>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Absolutely. All CV data parsing, layout rendering, and PDF generation occur 100% inside your web browser. Nothing is sent to our servers or stored in our database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
