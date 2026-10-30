"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  AlertCircle,
  Radio,
  Clipboard,
  Film,
  Music,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

// Platform Logos
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-4 w-4 text-red-500"}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-4 w-4 text-blue-500"}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-4 w-4 text-pink-500"}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-4 w-4 text-red-600"}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.155-1.499-.696-2.435-2.883-2.435-4.643 0-3.779 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

interface VideoFormat {
  quality: string;
  ext: string;
  url: string;
  downloadUrl: string;
  isAudio?: boolean;
  size?: string;
  badge?: string;
}

interface VideoResult {
  platform: "youtube" | "facebook" | "instagram" | "pinterest" | "tiktok" | "direct";
  title: string;
  author?: string;
  thumbnail?: string;
  previewUrl?: string;
  formats: VideoFormat[];
}

const SAMPLE_LINKS = [
  { name: "Rick Astley (1080p)", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", platform: "youtube" },
  { name: "Pinterest 1080p Pin", url: "https://pin.it/2MJmXlPzy", platform: "pinterest" },
  { name: "YouTube Shorts", url: "https://www.youtube.com/shorts/xG8Wp7AZs8E", platform: "youtube" },
];

export default function SocialVideoDownloaderTool() {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);

  const handleTriggerDownload = (fmt: VideoFormat, idx: number) => {
    setDownloadingIdx(idx);
    const a = document.createElement("a");
    a.href = fmt.downloadUrl;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingIdx(null);
    }, 6000);
  };

  // Dynamic platform detection
  const detectedPlatform = (() => {
    const clean = url.toLowerCase();
    if (clean.includes("youtube.com") || clean.includes("youtu.be")) return "youtube";
    if (clean.includes("facebook.com") || clean.includes("fb.watch") || clean.includes("fb.com")) return "facebook";
    if (clean.includes("instagram.com") || clean.includes("instagr.am")) return "instagram";
    if (clean.includes("pinterest.com") || clean.includes("pin.it")) return "pinterest";
    if (clean.includes("tiktok.com")) return "tiktok";
    return null;
  })();

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // ignore
    }
  };

  const handleFetchVideo = async (targetUrl?: string) => {
    const inputUrl = targetUrl || url;
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tools/video-downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve video. Please ensure the link is public.");
      }

      setVideoResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Video extraction failed";
      setErrorMessage(msg);
      setVideoResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="w-full space-y-8">
      {/* Hero Input Card */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Platform Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#213026] pb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#9baaa1]">Supported Platforms:</span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
                  detectedPlatform === "youtube"
                    ? "border-red-500/50 bg-red-950/40 text-red-400 shadow-md shadow-red-500/10"
                    : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                }`}
              >
                <YoutubeIcon className="h-3.5 w-3.5" />
                <span>YouTube</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
                  detectedPlatform === "facebook"
                    ? "border-blue-500/50 bg-blue-950/40 text-blue-400 shadow-md shadow-blue-500/10"
                    : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                }`}
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
                  detectedPlatform === "instagram"
                    ? "border-pink-500/50 bg-pink-950/40 text-pink-400 shadow-md shadow-pink-500/10"
                    : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                }`}
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                <span>Instagram</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
                  detectedPlatform === "pinterest"
                    ? "border-red-600/50 bg-red-950/40 text-red-300 shadow-md shadow-red-600/10"
                    : "border-[#213026] bg-[#080e0b] text-[#9baaa1]"
                }`}
              >
                <PinterestIcon className="h-3.5 w-3.5" />
                <span>Pinterest</span>
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-0.5 text-[11px] font-mono text-[#3cff5f]">
            <Sparkles className="h-3 w-3" />
            <span>True 1080p & 720p HD + 320k MP3</span>
          </div>
        </div>

        {/* URL Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchVideo();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video link here (YouTube, Facebook, Instagram Reels, Pinterest)..."
                className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] pl-4 pr-24 py-4 text-sm text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none transition-colors"
              />

              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-xl border border-[#213026] bg-[#0c1510] px-2.5 py-1.5 text-xs text-[#9baaa1] hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
                title="Paste link from clipboard"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Paste</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-8 py-4 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#3cff5f]/20"
            >
              {isLoading ? (
                <>
                  <Radio className="h-4 w-4 animate-spin" />
                  <span>Extracting HD Streams...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download Video</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#9baaa1]">
            <span className="font-semibold text-[#62776a]">Try Samples:</span>
            {SAMPLE_LINKS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(s.url);
                  handleFetchVideo(s.url);
                }}
                className="rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1 hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {s.platform === "youtube" && <YoutubeIcon className="h-3 w-3" />}
                {s.platform === "pinterest" && <PinterestIcon className="h-3 w-3" />}
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </form>

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Unable to resolve video link</p>
              <p className="text-red-400/80 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {videoResult && (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#213026] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#3cff5f]">
                  Original High-Resolution Streams Available
                </span>
                <h3 className="text-base font-bold text-[#e7eee9] line-clamp-1">
                  {videoResult.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setVideoResult(null);
                setUrl("");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-1.5 text-xs text-[#9baaa1] hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Download Another</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Video Preview & Thumbnail */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#213026] bg-black shadow-xl flex items-center justify-center">
                {videoResult.previewUrl ? (
                  <video
                    src={videoResult.previewUrl}
                    controls
                    className="h-full w-full object-contain"
                  />
                ) : videoResult.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={videoResult.thumbnail}
                    alt={videoResult.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#9baaa1] p-6">
                    <Film className="h-10 w-10 text-[#3cff5f] mb-2" />
                    <span className="text-xs">Preview ready to download</span>
                  </div>
                )}
              </div>

              {videoResult.author && (
                <p className="text-xs text-[#9baaa1] flex items-center gap-2">
                  <span>Creator / Channel:</span>
                  <strong className="text-[#e7eee9]">{videoResult.author}</strong>
                </p>
              )}

              <div className="rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#9baaa1] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#3cff5f] shrink-0" />
                <span>Clean video file with full synchronized stereo audio track</span>
              </div>
            </div>

            {/* Right Column: Download Format Options */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9baaa1]">
                Select Video or Audio Resolution
              </h4>

              <div className="space-y-3">
                {videoResult.formats.map((fmt, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-4 transition-all hover:border-[#3cff5f]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shrink-0">
                        {fmt.isAudio ? <Music className="h-5 w-5" /> : <Film className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#e7eee9]">{fmt.quality}</span>
                          {fmt.badge && (
                            <span className="rounded-md bg-[#102a16] border border-[#2a5234] px-2 py-0.5 text-[10px] font-mono text-[#3cff5f]">
                              {fmt.badge}
                            </span>
                          )}
                          <span className="rounded-md bg-[#17221b] px-1.5 py-0.5 text-[10px] font-mono text-[#9baaa1] uppercase">
                            .{fmt.ext}
                          </span>
                        </div>
                        <p className="text-xs text-[#9baaa1] mt-0.5 flex items-center gap-2">
                          <span>{fmt.isAudio ? "High quality stereo audio track" : "Full resolution stream with complete audio"}</span>
                          {fmt.size && (
                            <>
                              <span>•</span>
                              <strong className="text-[#3cff5f]">{fmt.size}</strong>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTriggerDownload(fmt, idx)}
                        disabled={downloadingIdx === idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2.5 text-xs font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/10 disabled:opacity-75"
                      >
                        {downloadingIdx === idx ? (
                          <>
                            <Radio className="h-3.5 w-3.5 animate-spin" />
                            <span>Muxing HD...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(fmt.url)}
                        className="p-2.5 rounded-xl border border-[#213026] bg-[#0c1510] text-[#9baaa1] hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
                        title="Copy direct stream link"
                      >
                        {copiedLink === fmt.url ? (
                          <Check className="h-4 w-4 text-[#3cff5f]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
