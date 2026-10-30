import { Metadata } from "next";
import EmailSignatureGeneratorTool from "@/components/tools/EmailSignatureGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Email Signature Generator — Free Professional HTML Signatures | ToolHub",
  description:
    "Create professional HTML email signatures for Gmail, Outlook, Apple Mail, and Thunderbird with custom avatars, brand colors, contact details, and social icons.",
  keywords: [
    "email signature generator",
    "html email signature",
    "free signature generator gmail",
    "outlook email signature generator",
    "professional email signature",
    "business email signature template",
  ],
};

export default function EmailSignatureGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Email Signature Generator",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser HTML email signature builder with live visual preview and one-click copy for Gmail and Outlook.",
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
            100% Free · Gmail &amp; Outlook Ready · Zero Subscriptions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Professional Email Signature Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Design clean, responsive email footers with your photo, job title, phone, website, and social links. Copy directly into Gmail, Outlook, or Apple Mail.
          </p>
        </div>

        <div className="mb-14">
          <EmailSignatureGeneratorTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Best Practices for Modern Email Signatures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Keep It Concise",
                formula: "3 to 4 lines maximum",
                desc: "Include essential contact info only: name, role, company, phone, and website. Avoid cluttering with unnecessary quotes or bulky badges.",
              },
              {
                title: "HTML Table Layout Compatibility",
                formula: "Standard inline CSS & table structures",
                desc: "Email clients (especially Microsoft Outlook) use legacy rendering engines. Table-based layouts guarantee identical rendering across devices.",
              },
              {
                title: "Brand Accent Consistency",
                formula: "Use your brand's primary HEX color",
                desc: "Matching your signature border and links to your corporate brand color adds immediate professionalism and credibility to every message.",
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
                q: "How do I add this signature to Gmail?",
                a: "Click 'Copy for Gmail'. In Gmail, click the Gear icon > See all settings > scroll down to Signature > click 'Create new' > paste directly into the box with Ctrl+V (or Cmd+V) > click Save Changes at the bottom.",
              },
              {
                q: "How do I add this to Microsoft Outlook?",
                a: "In Outlook, open Settings > Mail > Compose and reply > Email signature. Paste the copied visual signature or import the raw HTML.",
              },
              {
                q: "Where should my photo or logo be hosted?",
                a: "For email signatures to render images reliably, host your avatar or company logo on a public HTTPS URL (like your company website, Imgur, or cloud storage).",
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
