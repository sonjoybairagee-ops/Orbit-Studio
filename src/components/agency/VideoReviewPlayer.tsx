"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Send,
  Plus,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AgencyVideoVersion, AgencyVideoComment } from "@/types/agency";

interface VideoReviewPlayerProps {
  projectId: string;
  versions: AgencyVideoVersion[];
  isClientView?: boolean;
  clientPortalToken?: string;
  onVersionChange?: (versionId: string) => void;
}

export function VideoReviewPlayer({
  projectId,
  versions,
  isClientView = false,
  clientPortalToken,
  onVersionChange,
}: VideoReviewPlayerProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ""
  );

  const activeVersion =
    versions.find((v) => v.id === selectedVersionId) || versions[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Comments state
  const [comments, setComments] = useState<AgencyVideoComment[]>(
    activeVersion?.comments || []
  );
  const [commentText, setCommentText] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unresolved" | "resolved">("all");

  useEffect(() => {
    if (activeVersion) {
      setComments(activeVersion.comments || []);
    }
  }, [activeVersion]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeVersion) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agency/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: activeVersion.id,
          projectId,
          timestampSeconds: currentTime,
          commentText,
          authorName: authorName.trim() || (isClientView ? "Client Reviewer" : "Editor"),
        }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments([...comments, data.comment].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle comment resolution
  const handleToggleResolve = async (commentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/agency/reviews/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          isResolved: !currentStatus,
        }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, is_resolved: !currentStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (activeFilter === "unresolved") return !c.is_resolved;
    if (activeFilter === "resolved") return c.is_resolved;
    return true;
  });

  if (!activeVersion) {
    return (
      <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/50 p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-xl text-[#3cff5f]">
          🎬
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">No video cuts uploaded yet</h3>
        <p className="text-xs text-[#8da194] max-w-sm mx-auto mt-1">
          Upload an MP4, MOV, or video cut to initialize frame-accurate timestamp review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1510] border border-[#213026] p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#3cff5f]" />
          <span className="text-xs font-bold text-[#8da194]">Version:</span>
          <div className="flex items-center gap-1.5">
            {versions.map((ver) => (
              <button
                key={ver.id}
                type="button"
                onClick={() => {
                  setSelectedVersionId(ver.id);
                  onVersionChange?.(ver.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedVersionId === ver.id
                    ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                    : "bg-[#080e0b] border border-[#213026] text-[#8da194] hover:text-[#e7eee9]"
                }`}
              >
                {ver.version_label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              activeVersion.status === "approved"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {activeVersion.status.replace("_", " ")}
          </span>
          {activeVersion.changelog && (
            <span className="text-xs text-[#62776a] italic">"{activeVersion.changelog}"</span>
          )}
        </div>
      </div>

      {/* Main Review Grid: Video Player + Comments Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#213026] bg-black shadow-2xl group">
            <video
              ref={videoRef}
              src={activeVersion.video_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full aspect-video object-contain cursor-pointer"
            />

            {/* Custom Bottom Player Control Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 space-y-2">
              {/* Timeline Scrub Bar with Timestamp Comment Markers */}
              <div className="relative h-3 w-full flex items-center cursor-pointer group/bar">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.01"
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full accent-[#3cff5f] h-1.5 bg-[#213026] rounded-full cursor-pointer appearance-none"
                />

                {/* Comment Markers on timeline */}
                {duration > 0 &&
                  comments.map((c) => {
                    const leftPercent = (c.timestamp_seconds / duration) * 100;
                    return (
                      <div
                        key={c.id}
                        title={`Comment at ${formatTime(c.timestamp_seconds)}: ${c.comment_text}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          seekTo(c.timestamp_seconds);
                        }}
                        style={{ left: `${leftPercent}%` }}
                        className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full cursor-pointer transition-transform hover:scale-150 ${
                          c.is_resolved ? "bg-gray-400" : "bg-[#3cff5f] ring-2 ring-[#3cff5f]/50"
                        }`}
                      />
                    );
                  })}
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between text-xs text-[#e7eee9]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="h-8 w-8 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-[#3cff5f]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => seekTo(0)}
                    className="text-[#8da194] hover:text-[#e7eee9] cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <span className="font-mono text-xs text-[#3cff5f]">
                    {formatTime(currentTime)} <span className="text-[#62776a]">/ {formatTime(duration)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Speed switch */}
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      setPlaybackRate(rate);
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                    }}
                    className="bg-[#080e0b] border border-[#213026] text-xs font-mono text-[#3cff5f] rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="text-[#8da194] hover:text-[#e7eee9] cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Bar */}
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-3 flex items-center justify-between text-xs text-[#8da194]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-full font-bold">
                PRO TIP
              </span>
              <span>Pause at any frame and type your comment below — timestamp is captured automatically!</span>
            </div>
            <span className="font-mono text-[#3cff5f] font-bold">Frame: {formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Right 1 Col: Timestamp Comments Feed & New Comment Box */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl flex flex-col justify-between space-y-4 max-h-[620px]">
          {/* Header & Filter */}
          <div>
            <div className="flex items-center justify-between border-b border-[#1b2720] pb-3 mb-3">
              <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#3cff5f]" />
                <span>Timestamp Feedback ({comments.length})</span>
              </h3>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                    activeFilter === "all" ? "text-[#3cff5f] bg-[#102a16]" : "text-[#62776a]"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("unresolved")}
                  className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                    activeFilter === "unresolved" ? "text-amber-400 bg-amber-950/40" : "text-[#62776a]"
                  }`}
                >
                  Open
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
              {filteredComments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#62776a]">
                  No comments at this filter. Play the video, pause, and leave frame feedback!
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                      comment.is_resolved
                        ? "border-[#1b2720] bg-[#080e0b]/50 opacity-60"
                        : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Clickable timestamp seeks the player */}
                      <button
                        type="button"
                        onClick={() => seekTo(comment.timestamp_seconds)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-lg hover:bg-[#183d21] transition-colors cursor-pointer"
                        title="Click to jump to this video timestamp"
                      >
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(comment.timestamp_seconds)}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#e7eee9]">
                          {comment.author_name}
                        </span>

                        {!isClientView && (
                          <button
                            type="button"
                            onClick={() => handleToggleResolve(comment.id, comment.is_resolved)}
                            className="cursor-pointer"
                            title={comment.is_resolved ? "Mark unresolved" : "Mark resolved"}
                          >
                            {comment.is_resolved ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#3cff5f]" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-[#62776a] hover:text-[#3cff5f]" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[#e7eee9] leading-relaxed break-words">
                      {comment.comment_text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Comment Input Box */}
          <form onSubmit={handleSubmitComment} className="pt-3 border-t border-[#1b2720] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8da194]">Leaving remark at:</span>
              <span className="font-mono text-[#3cff5f] font-bold bg-[#102a16] px-2 py-0.5 rounded border border-[#2a5234]">
                {formatTime(currentTime)}
              </span>
            </div>

            {isClientView && (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name or company..."
                className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
              />
            )}

            <div className="relative">
              <textarea
                rows={2}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type revision or visual note here..."
                className="w-full rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none resize-none pr-10"
              />
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-[#3cff5f] text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
