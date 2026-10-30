import { Metadata } from "next";
import BackgroundRemoverTool from "@/components/tools/BackgroundRemoverTool";
import { Wand2, CheckCircle2, HelpCircle, Sparkles, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Background Remover — Remove Image Background Online (100% Free)",
  description:
    "Free online Background Remover. Instantly remove image background from photos, products, logos, and portraits. Unlimited high-resolution transparent PNG downloads with 100% privacy.",
  keywords: [
    "remove bg",
    "background remover",
    "remove background from image free",
    "transparent png maker",
    "photo cutout online",
    "product photo background removal",
    "free png background remover",
  ],
  openGraph: {
    title: "Free Background Remover — 100% Free & Private",
    description:
      "Remove background from any photo in 1 click. 100% Free with zero registration.",
  },
};

export default function BackgroundRemoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Background Remover",
    url: "https://compxorbit.com/image-tools/background-remover",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Browser-based background removal tool for portraits, product photography, logos, and graphics with instant transparent PNG export.",
    featureList: [
      "Automatic subject cutout and background removal",
      "Backdrop replacement (Transparent, White, Black, Studio Gradients)",
      "High-Resolution PNG Download",
      "100% Private - files never leave your device",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <Wand2 className="h-3.5 w-3.5" />
            <span>Image Editing Suite</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Background Remover
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Instantly remove backgrounds from portraits, e-commerce products,
            logos, and graphics with high precision and 100% privacy.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <BackgroundRemoverTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Remove Image Backgrounds Online</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Upload Any Photo</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Drag and drop your JPG, PNG, or WebP photo. Portraits, fashion, products, and graphics are all supported.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Automatic Cutout</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                The tool automatically isolates the foreground subject, preserving fine details and hair with clean, smooth edges.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Download High-Res PNG</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Choose a transparent checkerboard background or custom studio backdrop, then click Download to get your full-resolution asset.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Are my photos uploaded to a cloud server?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                <strong>No!</strong> Unlike other tools that send your photos to remote servers, all processing happens locally inside your browser. Your images never leave your device.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                What types of images work best with this tool?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Portraits, people, clothing, e-commerce products, animals, cars, and graphics all work cleanly. For best results, ensure the main subject has reasonable contrast with the background.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Can I replace the transparent background with white or a gradient?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! Use the &quot;Backdrop&quot; selector above the result image to switch between Transparent (PNG), Studio White (ideal for Amazon/eBay e-commerce), Studio Black, or Neon Gradients. The exported file will include your chosen backdrop.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Design & Video Workflow</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Take Cutouts Directly into Adobe After Effects
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            Bring transparent PNG cutouts into CompX Orbit to animate parallax 3D cards, pop-out stickers, and YouTube thumbnail graphics in seconds.
          </p>
          <div className="mt-5">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20"
            >
              <span>Explore CompX Orbit Features</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

