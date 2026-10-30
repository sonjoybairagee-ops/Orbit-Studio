import { Metadata } from "next";
import YoutubeThumbnailGrabberTool from "@/components/tools/YoutubeThumbnailGrabberTool";
import { Film, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Free YouTube Thumbnail Downloader — 1080p Full HD Thumbnail Grabber",
  description:
    "Free online YouTube Thumbnail Downloader. Extract and download high-resolution Full HD 1080p, HQ, and SD thumbnails from any YouTube video or Shorts link instantly.",
  keywords: [
    "youtube thumbnail downloader",
    "download youtube thumbnail hd",
    "youtube thumbnail grabber",
    "get youtube thumbnail 1080p",
    "youtube shorts thumbnail download",
    "save youtube thumbnail image",
    "youtube cover photo download",
    "free youtube thumbnail extractor",
  ],
  openGraph: {
    title: "Free YouTube Thumbnail Downloader — 1080p Full HD Grabber",
    description:
      "Download high-resolution 1080p Full HD thumbnails from any YouTube video or Shorts in 1 click.",
  },
};

export default function YoutubeThumbnailDownloaderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free YouTube Thumbnail Downloader",
    url: "https://compxorbit.com/video-tools/youtube-thumbnail-downloader",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Extract and download YouTube video thumbnails in Maximum Resolution (1080p HD), HQ, and SD quality directly in your browser.",
    featureList: [
      "Maximum Resolution (1080p HD) support",
      "Works with regular YouTube videos, Shorts, and Live streams",
      "Direct one-click image download",
      "Copy high-resolution image CDN links",
      "100% Free with zero registration required",
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
            <Film className="h-3.5 w-3.5" />
            <span>Creator & Video Tools</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            YouTube Thumbnail Downloader
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Download high-resolution YouTube thumbnails in 1080p Full HD, 720p,
            and standard quality. Simply paste any video link or Shorts URL
            below to grab the thumbnail instantly.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <YoutubeThumbnailGrabberTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Download a YouTube Thumbnail in 3 Easy Steps</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Copy Video URL</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Open YouTube on desktop or mobile app, click &quot;Share&quot;, and copy the video or Shorts link.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Paste into Downloader</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Paste the URL into the search box above. The tool automatically extracts the video ID and loads all qualities.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Download HD Image</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Click &quot;Download Image&quot; under 1080p Maximum Resolution or copy the direct CDN URL for your projects.
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
                What is the highest resolution YouTube thumbnail available?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                The highest resolution YouTube thumbnail is <strong>1920 × 1080 pixels (Full HD)</strong> or 1280 × 720 pixels (HD), known as <code className="text-[#3cff5f]">maxresdefault.jpg</code>. If the video creator uploaded an HD thumbnail, our tool grabs that exact uncompressed version.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Does this work with YouTube Shorts?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes! Just copy the link from any YouTube Shorts video (e.g. <code className="text-[#3cff5f]">youtube.com/shorts/...</code>) and paste it into the tool. It extracts the full thumbnail instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Is it legal to download YouTube thumbnails?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes, downloading thumbnails for inspiration, reference, presentations, fair use reviews, or your own channel backups is legal. However, please respect original creators copyright and avoid reusing their exact artwork without permission.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Why is the Max Resolution (1080p) gray or blank on some old videos?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Very old YouTube videos (uploaded before 2012) or low-resolution uploads may not have a 1080p custom thumbnail generated. In those rare cases, simply use the <strong>High Quality (HQ 480x360)</strong> or <strong>Standard Definition (SD)</strong> button.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Power Up Your Video Production</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            Want to Automate Motion Graphics in After Effects?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            Check out CompX Orbit Engine — the revolutionary Adobe After Effects extension designed to speed up motion design by 10x.
          </p>
          <div className="mt-5">
            <a
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20"
            >
              <span>Explore CompX Orbit Extension</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

