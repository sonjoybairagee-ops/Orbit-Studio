"use client";

import { useState } from "react";
import {
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Film,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface ThumbnailOption {
  quality: string;
  name: string;
  resolution: string;
  aspect: string;
  url: string;
  badge: string;
  badgeColor: string;
}

export default function YoutubeThumbnailGrabberTool() {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // Sample videos for quick 1-click testing
  const sampleVideos = [
    { label: "MrBeast", url: "https://www.youtube.com/watch?v=0e3GPea1Tyg" },
    { label: "MKBHD", url: "https://www.youtube.com/watch?v=Vb0Z9gTwt4s" },
    { label: "Lofi Girl", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
  ];

  // Robust YouTube URL extractor supporting Watch, Shorts, Embed, youtu.be, and raw ID
  const extractVideoId = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Standard watch URL: youtube.com/watch?v=ID
    const watchMatch = trimmed.match(/(?:v=|\/watch\?v=|\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // Shortened URL: youtu.be/ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // Shorts URL: youtube.com/shorts/ID
    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // Embed URL: youtube.com/embed/ID
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // Live URL: youtube.com/live/ID
    const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];

    return null;
  };

  const handleProcessUrl = (urlToProcess: string) => {
    setError("");
    const id = extractVideoId(urlToProcess);
    if (!id) {
      if (urlToProcess.trim()) {
        setError("Invalid YouTube URL. Please enter a valid YouTube video link, Shorts URL, or 11-character video ID.");
      }
      setVideoId("");
      return;
    }
    setVideoId(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    handleProcessUrl(val);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputUrl(text);
      handleProcessUrl(text);
    } catch {
      setError("Unable to read from clipboard. Please paste manually into the input box.");
    }
  };

  const handleSampleClick = (url: string) => {
    setInputUrl(url);
    handleProcessUrl(url);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch {
      // Fallback
    }
  };

  const downloadThumbnail = async (imageUrl: string, qualityName: string) => {
    setDownloadingQuality(qualityName);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `youtube-thumbnail-${videoId}-${qualityName.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct window open fallback if CORS prevents blob download
      const link = document.createElement("a");
      link.href = imageUrl;
      link.target = "_blank";
      link.download = `youtube-thumbnail-${videoId}.jpg`;
      link.click();
    } finally {
      setDownloadingQuality(null);
    }
  };

  const thumbnailOptions: ThumbnailOption[] = videoId
    ? [
        {
          quality: "maxres",
          name: "Maximum Resolution HD",
          resolution: "1920 × 1080 / 1280 × 720 px",
          aspect: "16:9 Full HD",
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          badge: "Best Quality (1080p)",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        },
        {
          quality: "hq",
          name: "High Quality (HQ)",
          resolution: "480 × 360 px",
          aspect: "4:3 Standard",
          url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          badge: "Always Available",
          badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        },
        {
          quality: "sd",
          name: "Standard Definition (SD)",
          resolution: "640 × 480 px",
          aspect: "4:3 Medium",
          url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
          badge: "Standard SD",
          badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        },
        {
          quality: "mq",
          name: "Medium Quality (MQ)",
          resolution: "320 × 180 px",
          aspect: "16:9 Compact",
          url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          badge: "Small / Fast",
          badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        },
      ]
    : [];

  return (
    <div className="w-full">
      {/* Input Card */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl mb-8">
        <label className="block text-sm font-semibold text-[#e7eee9] mb-3">
          Paste YouTube Video or Shorts URL:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#3cff5f]">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={handleInputChange}
              placeholder="e.g. https://www.youtube.com/watch?v=0e3GPea1Tyg or shorts link"
              className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] pl-11 pr-4 py-3.5 text-sm text-[#e7eee9] placeholder-[#9baaa1]/50 focus:border-[#3cff5f] focus:outline-hidden focus:ring-1 focus:ring-[#3cff5f] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handlePasteClipboard}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102a16] px-5 py-3.5 text-sm font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] hover:border-[#3cff5f] transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>Paste Link</span>
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#9baaa1]">
          <span className="font-medium text-[#7d9084]">Try sample:</span>
          {sampleVideos.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSampleClick(sample.url)}
              className="rounded-full bg-[#15231c] px-3 py-1 text-xs text-[#3cff5f] border border-[#213026] hover:border-[#3cff5f]/60 hover:bg-[#192b22] transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Thumbnails Display Grid */}
      {videoId ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#213026] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#e7eee9] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#3cff5f]" />
                <span>Extracted Thumbnails</span>
              </h2>
              <p className="text-xs text-[#9baaa1] mt-1">
                Detected Video ID: <code className="text-[#3cff5f] bg-[#102a16] px-2 py-0.5 rounded-md font-mono">{videoId}</code>
              </p>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#9baaa1] hover:text-[#3cff5f] transition-colors self-start sm:self-auto"
            >
              <span>Watch Video on YouTube</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {thumbnailOptions.map((opt) => (
              <div
                key={opt.quality}
                className="group rounded-3xl border border-[#26332d] bg-[#0c1510] overflow-hidden hover:border-[#3cff5f]/50 transition-all flex flex-col shadow-lg"
              >
                {/* Header Info */}
                <div className="px-5 py-4 border-b border-[#213026] flex items-center justify-between bg-[#080e0b]/60">
                  <div>
                    <h3 className="text-sm font-bold text-[#e7eee9]">{opt.name}</h3>
                    <p className="text-xs text-[#9baaa1]">{opt.resolution}</p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${opt.badgeColor}`}
                  >
                    {opt.badge}
                  </span>
                </div>

                {/* Preview Image with fallback notice */}
                <div className="relative aspect-video w-full bg-[#050a08] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={opt.url}
                    alt={`${opt.name} for YouTube Video ${videoId}`}
                    className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-[#080e0b] border-t border-[#213026] flex items-center gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => downloadThumbnail(opt.url, opt.name)}
                    disabled={downloadingQuality === opt.name}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3cff5f] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#3cff5f]/10"
                  >
                    {downloadingQuality === opt.name ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-[#050a08] border-t-transparent rounded-full animate-spin" />
                        <span>Downloading...</span>
                      </span>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download Image</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(opt.url)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#213026] bg-[#102a16] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#3cff5f] hover:bg-[#16381e] hover:border-[#3cff5f]/50 transition-colors cursor-pointer"
                    title="Copy direct thumbnail URL"
                  >
                    {copiedUrl === opt.url ? (
                      <>
                        <Check className="h-4 w-4 text-[#3cff5f]" />
                        <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4">
            <Film className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#e7eee9]">No Video Selected Yet</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Paste any YouTube video or Shorts link in the input box above to instantly preview and download all thumbnail qualities (up to 1080p Full HD).
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#3cff5f]">
            <CheckCircle2 className="h-4 w-4" />
            <span>100% Free • High-Res 1080p • No watermark • Instant download</span>
          </div>
        </div>
      )}
    </div>
  );
}

