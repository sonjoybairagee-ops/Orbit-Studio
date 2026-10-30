"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Tag,
  Search,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Hash,
  Eye,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface TagData {
  success: boolean;
  videoId: string;
  videoUrl: string;
  title: string;
  channelTitle: string;
  viewCount: string;
  description: string;
  tags: string[];
  hashtags: string[];
  seo: {
    tagCount: number;
    totalTagChars: number;
    isUnderLimit: boolean;
    titleLength: number;
    hasDescription: boolean;
  };
  thumbnails: {
    maxres: string;
    hq: string;
  };
}

export default function YoutubeTagExtractorTool() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<TagData | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copiedType, setCopiedType] = useState<string>("");

  const handleFetchTags = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || urlInput;
    if (!targetUrl.trim()) {
      setError("Please paste a valid YouTube URL or video ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setCopiedType("");

    try {
      const res = await fetch(`/api/tools/youtube-tags?url=${encodeURIComponent(targetUrl.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to extract tags from this video.");
      }

      setData(json);
      // Select all tags by default
      setSelectedTags(new Set(json.tags));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load video tags.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    setSelectedTags(next);
  };

  const selectAll = () => {
    if (!data) return;
    setSelectedTags(new Set(data.tags));
  };

  const deselectAll = () => {
    setSelectedTags(new Set());
  };

  const copyTags = (tagList: string[], type: string) => {
    if (tagList.length === 0) return;
    const text = tagList.join(", ");
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(""), 2500);
  };

  const downloadTxt = () => {
    if (!data) return;
    const tagsToExport = Array.from(selectedTags);
    const content = `YouTube Video Tags Extracted with Compx Orbit
Video: ${data.title}
Channel: ${data.channelTitle}
URL: ${data.videoUrl}

--- TAGS (Comma-Separated for YouTube Studio) ---
${tagsToExport.join(", ")}

--- HASHTAGS ---
${data.hashtags.join(" ")}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-tags-${data.videoId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedCharsCount = Array.from(selectedTags).reduce(
    (acc, t) => acc + t.length + 1,
    0
  );

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchTags();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9baaa1]" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste any YouTube video URL or Shorts link (e.g. https://youtu.be/...)"
              className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] pl-12 pr-4 py-4 text-sm text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-7 py-4 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-[#050a08] border-t-transparent rounded-full animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  <span>Extract Tags</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const sample = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                setUrlInput(sample);
                handleFetchTags(sample);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-4 py-4 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Tags Results Display */}
      {data && (
        <div className="space-y-6">
          {/* Video Metadata Header Card */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-7 shadow-2xl flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full md:w-56 aspect-video rounded-2xl overflow-hidden bg-black shrink-0 border border-[#213026]">
              <Image
                src={data.thumbnails.maxres || data.thumbnails.hq}
                alt={data.title}
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#9baaa1]">
                <span className="font-semibold text-[#3cff5f]">{data.channelTitle}</span>
                {data.viewCount && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {data.viewCount} views
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#e7eee9] leading-snug">
                {data.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={data.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#3cff5f] hover:underline"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <span className="text-xs text-[#9baaa1]">
                  Total Tags: <strong className="text-[#e7eee9]">{data.tags.length}</strong>
                </span>

                <span className="text-xs text-[#9baaa1]">
                  Char Budget:{" "}
                  <strong className={selectedCharsCount <= 500 ? "text-[#3cff5f]" : "text-red-400"}>
                    {selectedCharsCount} / 500
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080e0b] border border-[#213026] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#102a16] text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#15231c] text-[#9baaa1] hover:text-[#e7eee9] cursor-pointer"
              >
                Deselect All
              </button>
              <span className="text-xs text-[#9baaa1] ml-2">
                {selectedTags.size} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copyTags(Array.from(selectedTags), "selected")}
                disabled={selectedTags.size === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20 disabled:opacity-50"
              >
                {copiedType === "selected" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Selected ({selectedTags.size})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyTags(data.tags, "all")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#102a16] text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
              >
                {copiedType === "all" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>All Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy All Tags</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={downloadTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#15231c] text-[#e7eee9] border border-[#213026] hover:bg-[#1c3026] transition-colors cursor-pointer"
                title="Download as TXT file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export TXT</span>
              </button>
            </div>
          </div>

          {/* Interactive Tag Pills */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
            <h4 className="text-xs font-bold text-[#9baaa1] uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Interactive Tags (Click to select/deselect):</span>
              <span className="text-[11px] text-[#3cff5f] font-normal normal-case">
                Comma-separated format ready for YouTube Studio
              </span>
            </h4>

            {data.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => {
                  const isSelected = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#102a16] border border-[#3cff5f] text-[#3cff5f] shadow-sm shadow-[#3cff5f]/15"
                          : "bg-[#080e0b] border border-[#213026] text-[#9baaa1] hover:border-[#3cff5f]/40 hover:text-[#e7eee9]"
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected ? (
                        <Check className="h-3 w-3 text-[#3cff5f]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[#213026]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#9baaa1]">
                No public keywords or tags found on this video. (The creator may not have added tags or set them to private).
              </div>
            )}

            {/* Hashtags Section if present */}
            {data.hashtags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#213026]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#9baaa1] uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>Hashtags from Video:</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(data.hashtags.join(" "));
                      setCopiedType("hashtags");
                      setTimeout(() => setCopiedType(""), 2000);
                    }}
                    className="text-xs text-[#3cff5f] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === "hashtags" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>Copy Hashtags</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.hashtags.map((ht) => (
                    <span
                      key={ht}
                      className="inline-block px-3 py-1 rounded-lg bg-[#080e0b] border border-[#213026] text-xs font-semibold text-[#3cff5f]"
                    >
                      {ht}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

