"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Copy,
  Check,
  Play,
  Globe,
  FileText,
  AlignLeft,
  ListFilter,
  Sparkles,
  AlertCircle,
  Radio,
  Upload,
  Video,
  FileAudio,
  Trash2,
} from "lucide-react";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "h-5 w-5 text-red-500"}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface TranscriptSnippet {
  text: string;
  start: number;
  duration: number;
}

interface LanguageOption {
  code: string;
  name: string;
  isGenerated: boolean;
}

const SAMPLE_VIDEOS = [
  { title: "Viral Music Video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { title: "First Video on YouTube", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
  { title: "Steve Jobs Stanford Speech", url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc" },
];

// Helper to convert AudioBuffer into standard 16-bit PCM WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const channelData = buffer.getChannelData(0);
  const numSamples = channelData.length;
  const dataSize = numSamples * (bitDepth / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    const sample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

export default function YoutubeTranscriptTool() {
  const [url, setUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"youtube" | "local">("youtube");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    reason?: string;
    title?: string;
    author?: string;
    videoId?: string;
  } | null>(null);

  // Transcript Data
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoAuthor, setVideoAuthor] = useState<string>("");
  const [snippets, setSnippets] = useState<TranscriptSnippet[]>([]);
  const [originalSnippets, setOriginalSnippets] = useState<TranscriptSnippet[]>([]);
  const [srtData, setSrtData] = useState<string>("");
  const [originalSrt, setOriginalSrt] = useState<string>("");
  const [vttData, setVttData] = useState<string>("");
  const [originalVtt, setOriginalVtt] = useState<string>("");
  const [plainText, setPlainText] = useState<string>("");
  const [originalPlainText, setOriginalPlainText] = useState<string>("");
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [transcriptSource, setTranscriptSource] = useState<string>("");

  // Subtitle Translation State
  const [targetTranslationLang, setTargetTranslationLang] = useState<string>("original");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"timestamped" | "paragraph">("timestamped");
  const [copiedType, setCopiedType] = useState<string>("");

  // Video Player Refs
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Local Audio/Video Transcribe State
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localMediaUrl, setLocalMediaUrl] = useState<string | null>(null);
  const localFileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (localMediaUrl) {
        URL.revokeObjectURL(localMediaUrl);
      }
    };
  }, [localMediaUrl]);

  // Tab 1: Fetch YouTube Transcript by URL
  const fetchTranscript = async (targetUrl?: string, langCode?: string) => {
    const inputUrl = targetUrl || url;
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage("Extracting YouTube captions & timestamped dialogues...");
    setErrorMessage(null);
    setErrorDetails(null);

    try {
      const res = await fetch("/api/tools/youtube-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputUrl,
          lang: langCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorDetails({
          reason: data.reason,
          title: data.title,
          author: data.author,
          videoId: data.videoId,
        });
        throw new Error(data.error || "Failed to fetch transcript");
      }

      setVideoId(data.videoId);
      setVideoTitle(data.title || "");
      setVideoAuthor(data.author || "");
      setSnippets(data.snippets);
      setOriginalSnippets(data.snippets);
      setSrtData(data.srt);
      setOriginalSrt(data.srt);
      setVttData(data.vtt);
      setOriginalVtt(data.vtt);
      setPlainText(data.plainText);
      setOriginalPlainText(data.plainText);
      setLanguages(data.languages || []);
      setTranscriptSource(data.isAiGenerated ? "ai_speech" : "youtube");
      setTargetTranslationLang("original");
      if (data.activeLanguage?.code) {
        setSelectedLang(data.activeLanguage.code);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching transcript";
      setErrorMessage(msg);
      setSnippets([]);
      setVideoId(null);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  // Tab 2: Upload Video/Audio and Transcribe
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (localMediaUrl) {
      URL.revokeObjectURL(localMediaUrl);
    }

    setLocalFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalMediaUrl(objectUrl);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      setStatusMessage("Analyzing media & checking YouTube audio signatures...");

      const formData = new FormData();
      formData.append("filename", file.name);

      // If video file is larger than 15MB, extract 16kHz audio track to make upload fast and reliable
      let fileToUpload: Blob = file;
      if (file.size > 15 * 1024 * 1024 && file.type.startsWith("video/")) {
        try {
          setStatusMessage("Extracting audio stream for high-speed transcription...");
          const arrayBuffer = await file.arrayBuffer();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass({ sampleRate: 16000 });
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            fileToUpload = audioBufferToWav(audioBuffer);
            await audioCtx.close();
          }
        } catch (audioErr) {
          console.warn("Audio extraction fallback to original file:", audioErr);
          fileToUpload = file;
        }
      }

      formData.append("file", fileToUpload, file.name);
      setStatusMessage("Transcribing dialogues & generating SRT timestamps...");

      const res = await fetch("/api/tools/transcribe-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transcribe uploaded media");
      }

      setVideoTitle(data.title || file.name);
      setVideoAuthor(data.author || "Uploaded Video");
      setSnippets(data.snippets || []);
      setOriginalSnippets(data.snippets || []);
      setSrtData(data.srt || "");
      setOriginalSrt(data.srt || "");
      setVttData(data.vtt || "");
      setOriginalVtt(data.vtt || "");
      setPlainText(data.plainText || "");
      setOriginalPlainText(data.plainText || "");
      setTranscriptSource(data.source || "ai");
      setTargetTranslationLang("original");

      if (data.videoId) {
        setVideoId(data.videoId);
      } else {
        setVideoId(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error transcribing file";
      setErrorMessage(msg);
      setSnippets([]);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  // Translate Subtitles in 1-Click
  const handleTranslateSubtitles = async (targetLang: string) => {
    if (targetLang === "original") {
      setSnippets(originalSnippets);
      setSrtData(originalSrt);
      setVttData(originalVtt);
      setPlainText(originalPlainText);
      setTargetTranslationLang("original");
      return;
    }

    const sourceSnippets = originalSnippets.length > 0 ? originalSnippets : snippets;
    if (sourceSnippets.length === 0) return;

    setIsTranslating(true);
    setTargetTranslationLang(targetLang);

    try {
      const res = await fetch("/api/tools/translate-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snippets: sourceSnippets,
          targetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setSnippets(data.snippets);
      setSrtData(data.srt);
      setVttData(data.vtt);
      setPlainText(data.plainText);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to translate subtitles";
      setErrorMessage(msg);
      setTargetTranslationLang("original");
    } finally {
      setIsTranslating(false);
    }
  };

  // Jump to specific time in YouTube embed or local video
  const seekTo = (seconds: number) => {
    if (activeTab === "local" && localVideoRef.current) {
      localVideoRef.current.currentTime = seconds;
      localVideoRef.current.play();
      return;
    }

    if (iframeRef.current && videoId) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seconds, true],
        }),
        "*"
      );
    }
  };

  const formatTimestamp = (sec: number) => {
    const totalSec = Math.floor(sec);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const h = Math.floor(m / 60);
    const remM = m % 60;

    if (h > 0) {
      return `${h}:${remM.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${remM.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(""), 2000);
  };

  // Filter snippets by search query
  const filteredSnippets = snippets.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWords = plainText ? plainText.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(totalWords / 180));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isVideoFile =
    localFile?.type?.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|avi)$/i.test(localFile?.name || "");

  return (
    <div className="w-full space-y-8">
      {/* Search & URL Input Card */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Source Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <YoutubeIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                <span>YouTube Transcript & Subtitle Extractor</span>
                <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] text-[#3cff5f] font-mono">
                  100% Free
                </span>
              </h2>
              <p className="text-xs text-[#9baaa1]">
                Extract timestamped captions, download SRT/VTT, and search video dialogues
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-2xl border border-[#213026] bg-[#080e0b] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("youtube")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === "youtube"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20 font-bold"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <YoutubeIcon className="h-3.5 w-3.5 text-red-500" />
              <span>YouTube Video / Shorts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("local")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeTab === "local"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20 font-bold"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Video / Audio</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        {activeTab === "youtube" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTranscript();
            }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <YoutubeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube link or Shorts URL (e.g. https://www.youtube.com/watch?v=...)"
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] pl-12 pr-4 py-4 text-sm text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!url.trim() || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-8 py-4 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#3cff5f]/20"
              >
                {isLoading ? (
                  <>
                    <Radio className="h-4 w-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Get Transcript</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#9baaa1]">
              <span className="font-semibold text-[#62776a]">Try Sample Video:</span>
              {SAMPLE_VIDEOS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(s.url);
                    fetchTranscript(s.url);
                  }}
                  className="rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1 hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </form>
        ) : (
          /* Local File Upload Tab */
          <div className="space-y-4">
            <input
              ref={localFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/aac"
              onChange={handleLocalFileUpload}
              className="hidden"
            />

            {!localFile ? (
              <div
                onClick={() => localFileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#26332d] bg-[#080e0b] p-8 sm:p-10 text-center transition-all hover:border-[#3cff5f] hover:bg-[#0c1510] cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#e7eee9]">
                  Select or Drop MP4, WebM, MOV, MP3, or WAV
                </h3>
                <p className="mt-1 text-xs text-[#9baaa1] max-w-md">
                  Upload downloaded YouTube Shorts, podcast audio, or video clips to extract timestamped dialogue and download .SRT subtitles
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#102a16] border border-[#2a5234] px-4 py-2 text-xs font-semibold text-[#3cff5f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Choose Video or Audio File</span>
                </div>
              </div>
            ) : (
              /* Selected File Card */
              <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shrink-0">
                    {isVideoFile ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <FileAudio className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#e7eee9] truncate">
                      {localFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#9baaa1] mt-0.5">
                      <span className="font-mono text-[#3cff5f]">
                        {formatFileSize(localFile.size)}
                      </span>
                      <span>•</span>
                      <span>{isVideoFile ? "Video Clip" : "Audio File"}</span>
                      {transcriptSource && (
                        <>
                          <span>•</span>
                          <span className="text-[#3cff5f] font-medium">
                            {transcriptSource === "youtube_auto_detected"
                              ? "YouTube Captions Detected"
                              : "AI Multimodal Transcribed"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => localFileInputRef.current?.click()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3.5 py-2 text-xs font-semibold text-[#e7eee9] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Change File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalFile(null);
                      if (localMediaUrl) URL.revokeObjectURL(localMediaUrl);
                      setLocalMediaUrl(null);
                      setSnippets([]);
                      setOriginalSnippets([]);
                      setErrorMessage(null);
                    }}
                    className="p-2 rounded-xl border border-[#213026] bg-[#0c1510] text-[#9baaa1] hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Transcription Status Banner */}
            {isLoading && (
              <div className="rounded-2xl border border-[#2a5234] bg-[#102a16]/40 p-4 text-xs text-[#3cff5f] flex items-center gap-3 animate-pulse">
                <Radio className="h-4 w-4 animate-spin text-[#3cff5f] shrink-0" />
                <span className="font-semibold">{statusMessage || "Processing media & transcribing dialogues..."}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-[#160c0c] p-4 text-xs text-red-300 flex items-start gap-3 shadow-lg">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-[#e7eee9]">{errorMessage}</p>
              <p className="text-[#a08a8a] text-[11px]">
                Please verify that the link is a public YouTube video or Shorts with audible speech/audio.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Results View (When transcript is loaded) */}
      {snippets.length > 0 && (
        <div className="space-y-6">
          {/* Top Actions & Download Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#26332d] bg-[#0c1510] p-5 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#e7eee9] flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#3cff5f]" />
                {snippets.length} Dialogue Lines
              </span>
              <span>•</span>
              <span className="text-[#9baaa1]">
                Words: <strong className="text-[#e7eee9]">{totalWords}</strong>
              </span>
              <span>•</span>
              <span className="text-[#9baaa1]">
                Est. Reading Time: <strong className="text-[#3cff5f]">{readingMinutes} min</strong>
              </span>
              {transcriptSource === "ai_speech" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
                  <Sparkles className="h-3 w-3" />
                  AI Speech Transcribed
                </span>
              )}
            </div>

            {/* Export & Translation Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1-Click Translation Selector */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#9baaa1]">
                <Globe className="h-3.5 w-3.5 text-[#3cff5f]" />
                <span className="hidden sm:inline">Translate:</span>
                <select
                  value={targetTranslationLang}
                  onChange={(e) => handleTranslateSubtitles(e.target.value)}
                  disabled={isTranslating}
                  className="bg-transparent text-[#e7eee9] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="original" className="bg-[#080e0b] text-[#e7eee9]">
                    Original Subtitles
                  </option>
                  <option value="en" className="bg-[#080e0b] text-[#e7eee9]">
                    English Subtitles
                  </option>
                  <option value="bn" className="bg-[#080e0b] text-[#e7eee9]">
                    Bengali (বাংলা)
                  </option>
                  <option value="hi" className="bg-[#080e0b] text-[#e7eee9]">
                    Hindi (हिन्दी)
                  </option>
                  <option value="es" className="bg-[#080e0b] text-[#e7eee9]">
                    Spanish (Español)
                  </option>
                  <option value="ar" className="bg-[#080e0b] text-[#e7eee9]">
                    Arabic (العربية)
                  </option>
                </select>
                {isTranslating && <Radio className="h-3 w-3 animate-spin text-[#3cff5f]" />}
              </div>

              {/* SRT Download */}
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    srtData,
                    `${(videoTitle || "subtitles").replace(/[^a-zA-Z0-9_-]/g, "_")}${
                      targetTranslationLang !== "original" ? `_${targetTranslationLang}` : ""
                    }.srt`,
                    "text/plain"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-all cursor-pointer shadow-xs"
                title="Download standard SubRip subtitle file for Premiere, DaVinci, or CapCut"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .SRT</span>
              </button>

              {/* VTT Download */}
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    vttData,
                    `${(videoTitle || "subtitles").replace(/[^a-zA-Z0-9_-]/g, "_")}${
                      targetTranslationLang !== "original" ? `_${targetTranslationLang}` : ""
                    }.vtt`,
                    "text/vtt"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-bold text-[#e7eee9] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer"
                title="Download WebVTT subtitle file for web players"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .VTT</span>
              </button>

              {/* TXT Download */}
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    plainText,
                    `${(videoTitle || "transcript").replace(/[^a-zA-Z0-9_-]/g, "_")}${
                      targetTranslationLang !== "original" ? `_${targetTranslationLang}` : ""
                    }.txt`,
                    "text/plain"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-bold text-[#e7eee9] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .TXT</span>
              </button>

              {/* Copy Plain Text */}
              <button
                type="button"
                onClick={() => copyToClipboard(plainText, "plain")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-semibold text-[#9baaa1] hover:text-[#e7eee9] transition-all cursor-pointer"
              >
                {copiedType === "plain" ? (
                  <Check className="h-3.5 w-3.5 text-[#3cff5f]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedType === "plain" ? "Copied" : "Copy Text"}</span>
              </button>
            </div>
          </div>

          {/* Grid Layout: Video Player + Transcript View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Player & Media Info */}
            <div className="lg:col-span-5 space-y-4">
              {videoTitle && (
                <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4">
                  <h3 className="text-sm font-bold text-[#e7eee9] line-clamp-2 leading-snug">
                    {videoTitle}
                  </h3>
                  {videoAuthor && (
                    <p className="text-xs text-[#3cff5f] mt-1 font-medium">
                      {videoAuthor}
                    </p>
                  )}
                </div>
              )}

              {/* Player: YouTube Embed OR Local Video */}
              {activeTab === "local" && localMediaUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#213026] bg-black shadow-2xl flex items-center justify-center">
                  {isVideoFile ? (
                    <video
                      ref={localVideoRef}
                      src={localMediaUrl}
                      controls
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="p-6 text-center w-full">
                      <FileAudio className="h-12 w-12 text-[#3cff5f] mx-auto mb-3" />
                      <audio
                        ref={localVideoRef as unknown as React.RefObject<HTMLAudioElement>}
                        src={localMediaUrl}
                        controls
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ) : videoId ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#213026] bg-black shadow-2xl">
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : null}

              {/* Multi-language Selector (If YouTube video has multiple tracks) */}
              {languages.length > 1 && (
                <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#9baaa1]">
                    <Globe className="h-4 w-4 text-[#3cff5f]" />
                    <span>Caption Language:</span>
                  </div>

                  <select
                    value={selectedLang}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLang(newLang);
                      fetchTranscript(url, newLang);
                    }}
                    className="rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code} className="bg-[#080e0b] text-[#e7eee9]">
                        {l.name} {l.isGenerated ? "(Auto)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Column: Transcript Interactive Reader */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 shadow-2xl flex flex-col h-[520px]">
                {/* Search Bar & View Mode Toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#213026] pb-4 mb-4">
                  <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9baaa1]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search words in transcript..."
                      className="w-full rounded-xl border border-[#213026] bg-[#080e0b] pl-10 pr-3 py-2 text-xs text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none"
                    />
                  </div>

                  <div className="inline-flex rounded-xl border border-[#213026] bg-[#080e0b] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode("timestamped")}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        viewMode === "timestamped"
                          ? "bg-[#102a16] text-[#3cff5f] font-bold"
                          : "text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      <ListFilter className="h-3 w-3" />
                      <span>Timestamps</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("paragraph")}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        viewMode === "paragraph"
                          ? "bg-[#102a16] text-[#3cff5f] font-bold"
                          : "text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      <AlignLeft className="h-3 w-3" />
                      <span>Article View</span>
                    </button>
                  </div>
                </div>

                {/* Transcript Body */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  {viewMode === "timestamped" ? (
                    filteredSnippets.length > 0 ? (
                      filteredSnippets.map((item, idx) => (
                        <div
                          key={idx}
                          className="group flex items-start gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-[#080e0b]"
                        >
                          <button
                            type="button"
                            onClick={() => seekTo(item.start)}
                            className="shrink-0 flex items-center gap-1 rounded-lg border border-[#213026] bg-[#080e0b] px-2.5 py-1 text-[11px] font-mono text-[#3cff5f] group-hover:border-[#3cff5f] group-hover:bg-[#102a16] transition-all cursor-pointer"
                            title="Click to jump video to this moment"
                          >
                            <Play className="h-2.5 w-2.5 fill-current" />
                            <span>{formatTimestamp(item.start)}</span>
                          </button>
                          <p className="text-xs sm:text-sm text-[#e7eee9] leading-relaxed pt-0.5">
                            {item.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-[#9baaa1]">
                        No matches found for &quot;{searchQuery}&quot;
                      </div>
                    )
                  ) : (
                    /* Paragraph / Article View */
                    <div className="p-2 text-xs sm:text-sm text-[#e7eee9] leading-relaxed whitespace-pre-wrap">
                      {plainText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
