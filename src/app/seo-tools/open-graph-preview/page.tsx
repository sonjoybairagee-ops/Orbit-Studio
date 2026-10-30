import { Metadata } from "next";
import { OpenGraphPreviewTool } from "@/components/tools/OpenGraphPreviewTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Open Graph Preview — Facebook, X, LinkedIn & Discord Social Cards | ToolHub",
  description:
    "Preview your Open Graph social sharing cards for Facebook, Twitter/X, LinkedIn, and Discord. Test og:image dimensions, title, and description before publishing.",
  keywords: ["open graph preview", "og image preview", "facebook share card tester", "twitter card simulator", "linkedin preview tool"],
};

export default function OpenGraphPreviewPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Open Graph Preview",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Visual social media sharing card preview for Facebook, X, LinkedIn, and Discord.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 border border-cyan-200/60 mb-2">
            Facebook · Twitter/X · LinkedIn · Discord
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Open Graph Social Card Preview
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Test how your links appear when shared on major social networks, messaging apps, and community platforms with instant image upload preview.
          </p>
        </div>

        <div className="mb-14">
          <OpenGraphPreviewTool />
        </div>

        {/* Social Card Guidelines */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-600" />
            Social Media Card Specs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "1200 × 630px Image Size",
                desc: "The universal gold standard resolution across Facebook, LinkedIn, X, and WhatsApp, ensuring retina sharpness without cropping.",
              },
              {
                title: "1.91 : 1 Aspect Ratio",
                desc: "Prevents awkward pillarboxing or letterboxing. Keep critical text and focal points inside the middle 80% safe zone.",
              },
              {
                title: "File Size & Formats",
                desc: "Keep images under 8MB (under 2MB recommended for snappy mobile loading). Supported formats are JPG, PNG, and WebP.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="text-xs font-bold text-cyan-600 mb-1 block">{f.title}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cyan-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Why is Facebook or LinkedIn showing an old image?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Social platforms heavily cache Open Graph tags. If you recently updated your `og:image`, use the Facebook Sharing Debugger or LinkedIn Post Inspector to purge and refresh their server cache.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Do I need both Open Graph and Twitter Card tags?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Twitter/X will fall back to `og:title` and `og:image` if `twitter:` tags are missing. However, declaring `twitter:card: summary_large_image` is mandatory if you want large full-width image displays on X.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
