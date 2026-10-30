import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
  Eye,
} from "lucide-react";
import ImageUpscalerTool from "@/components/tools/ImageUpscalerTool";

export const metadata: Metadata = {
  title: "Free 4K AI Image Upscaler & Neural Enhancer (Real-ESRGAN & Waifu2x) — CompX Orbit",
  description:
    "Upscale images, photos, and anime art to 4K and 8K with Real-ESRGAN True Neural AI super-resolution. 100% free, WebGL GPU accelerated with interactive split-screen comparison.",
  alternates: {
    canonical: "/image-tools/ai-image-upscaler",
  },
  keywords: [
    "real-esrgan online free",
    "waifu2x online upscaler",
    "ai image upscaler free",
    "4k image upscaler",
    "upscale photo to 4k online",
    "topaz gigapixel alternative free",
    "neural super resolution tool",
    "youtube thumbnail upscaler",
    "increase image resolution free",
    "photo detail enhancer",
  ],
  openGraph: {
    title: "Free 4K AI Image Upscaler & Neural Enhancer (Real-ESRGAN) | CompX Orbit",
    description:
      "Upscale blurry images, photos, and artwork to 4K Ultra HD using Real-ESRGAN Deep Neural AI. 100% free with interactive before/after split slider.",
    url: "https://compxorbit.com/image-tools/ai-image-upscaler",
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "True Neural AI (Real-ESRGAN)",
    desc: "Deep convolutional neural networks synthesize genuine micro-textures, skin pores, and sharp line art.",
  },
  {
    icon: Eye,
    title: "Live Split-Screen Inspection",
    desc: "Interactive before and after comparison slider reveals sharp micro-details and textures in real time.",
  },
  {
    icon: Zap,
    title: "Dual Engine: Neural & Fast HD",
    desc: "Choose between deep learning Real-ESRGAN or sub-second contrast-adaptive sharpening for instant exports.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Limits & 100% Private",
    desc: "Runs directly in your browser via WebGL GPU. Zero cloud queues, zero server uploads, and no watermark.",
  },
];

const FAQS = [
  {
    q: "What makes True Neural AI (Real-ESRGAN) different from standard upscaling?",
    a: "Standard resizing (bicubic or bilinear) only stretches existing pixels and blurs edges. Real-ESRGAN is a deep convolutional neural network trained on millions of high-definition images that genuinely hallucinates and reconstructs missing textures, fabric weaves, facial details, and crisp vector lines.",
  },
  {
    q: "Does it support Anime and Digital Art (Waifu2x style)?",
    a: "Yes! Select the 'Digital Art & Anime' style preset or ESRGAN Studio model to eliminate compression blockiness, remove color banding, and preserve ultra-sharp vector edges similar to Waifu2x.",
  },
  {
    q: "Will my images be uploaded to any remote server?",
    a: "No! All neural inference and contrast-adaptive rendering execute directly inside your browser using WebGL hardware acceleration. Your images never leave your computer or phone.",
  },
  {
    q: "Are there any image size limits or paid credits?",
    a: "No. CompX Orbit is completely free forever. You can upscale as many images, thumbnails, and wallpapers as you want with zero credits or subscriptions.",
  },
];

export default function ImageUpscalerPage() {
  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] selection:bg-[#3cff5f]/30 selection:text-[#3cff5f]">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#102a16]/30 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-[#3cff5f]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <Link href="/tools" className="hover:text-[#3cff5f] transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <Link href="/image-tools" className="hover:text-[#3cff5f] transition-colors">
            Image Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#334538]" />
          <span className="text-[#3cff5f] font-semibold">4K AI Image Upscaler</span>
        </nav>

        {/* Interactive Tool Component */}
        <ImageUpscalerTool />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 space-y-3 transition-all hover:border-[#3cff5f]/40 hover:bg-[#101c15]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#e7eee9]">{f.title}</h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Step-by-Step Guide */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#e7eee9]">
              How to Upscale Blurry Images to 4K Ultra HD
            </h2>
            <p className="text-sm text-[#9baaa1]">
              Fast super-resolution workflow designed for designers, photographers, and content creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                01
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Upload Any Photo</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Choose any JPG, PNG, or WebP photo, artwork, or thumbnail from your computer or phone.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                02
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Choose Scale &amp; Mode</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Select 2x, 4x Ultra HD, or 8x Max Print. Pick Portrait Clarity or Texture Boost.
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-mono font-bold text-[#3cff5f]">
                03
              </div>
              <h3 className="text-base font-semibold text-[#e7eee9]">Inspect &amp; Download</h3>
              <p className="text-xs text-[#9baaa1] leading-relaxed">
                Drag the interactive slider to compare details, then download your 4K PNG or JPG with zero watermarks.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e7eee9]">Frequently Asked Questions</h2>
              <p className="text-xs text-[#9baaa1]">
                Everything you need to know about AI upscaling and photo super-resolution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-2">
                <h3 className="text-sm font-semibold text-[#e7eee9] flex items-center gap-2">
                  <span className="text-[#3cff5f]">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-[#9baaa1] leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Structured Data for Google Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  name: "Free 4K AI Image Upscaler & Neural Enhancer",
                  applicationCategory: "MultimediaApplication",
                  operatingSystem: "All",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                  description:
                    "Upscale images, photos, and anime art to 4K and 8K with Real-ESRGAN True Neural AI super-resolution directly in browser.",
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: "https://compxorbit.com",
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Image Tools",
                      item: "https://compxorbit.com/image-tools",
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: "AI Image Upscaler",
                      item: "https://compxorbit.com/image-tools/ai-image-upscaler",
                    },
                  ],
                },
                {
                  "@type": "FAQPage",
                  mainEntity: FAQS.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: faq.a,
                    },
                  })),
                },
              ],
            }),
          }}
        />
      </div>
    </div>
  );
}

