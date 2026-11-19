"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  Activity,
  Layers,
  Palette,
  PlayCircle,
  ArrowRight,
  Sliders,
  FolderTree,
  Volume2,
  Film,
  Tag,
  ExternalLink,
  Video,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import {
  TUTORIAL_SECTIONS,
  TUTORIAL_VIDEOS,
  TutorialSectionKey,
  TutorialVideo,
} from "@/lib/tutorials-data";

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tools: Wrench,
  studio: Sparkles,
  "motion-lab": Activity,
  morph: Layers,
  color: Palette,
  animation: PlayCircle,
  arrow: ArrowRight,
  carousel: Sliders,
  comps: FolderTree,
  sfx: Volume2,
  mogrt: Film,
  license: Tag,
};

export default function TutorialsExplorer() {
  const [selectedSection, setSelectedSection] = useState<TutorialSectionKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ready" | "upcoming">("all");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Filtered list of videos
  const filteredVideos = useMemo(() => {
    return TUTORIAL_VIDEOS.filter((video) => {
      // 1. Section filter
      if (selectedSection !== "all" && video.sectionKey !== selectedSection) {
        return false;
      }

      // 2. Status filter
      if (statusFilter === "ready" && !video.isReady) {
        return false;
      }
      if (statusFilter === "upcoming" && video.isReady) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = video.title.toLowerCase().includes(query);
        const inBanglaTitle = video.banglaTitle?.toLowerCase().includes(query) ?? false;
        const inDescription = video.description.toLowerCase().includes(query);
        const inSection = video.sectionName.toLowerCase().includes(query);
        const inTopics = video.topics.some((t) => t.toLowerCase().includes(query));
        return inTitle || inBanglaTitle || inDescription || inSection || inTopics;
      }

      return true;
    });
  }, [selectedSection, statusFilter, searchQuery]);

  // Overall counts
  const totalCount = TUTORIAL_VIDEOS.length;
  const readyCount = TUTORIAL_VIDEOS.filter((v) => v.isReady).length;
  const upcomingCount = totalCount - readyCount;

  // Active section metadata
  const activeSectionMeta = TUTORIAL_SECTIONS.find((s) => s.id === selectedSection);

  return (
    <section className="relative z-10 my-12">
      {/* SECTION TITLE & DESCRIPTION */}
      <div className="mb-8 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#45c66d]/10 text-[#45c66d] text-xs font-semibold px-3 py-1 rounded-full border border-[#45c66d]/30 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Workspace Video Guides
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            11 Core Extension Workspaces
          </h2>
          <p className="text-[#8da096] text-sm md:text-base max-w-2xl">
            বামপাশের ট্যাব থেকে যেকোনো সেকশন সিলেক্ট করুন এবং সরাসরি ভিডিও টিউটোরিয়াল দেখে মাস্টার করুন।
          </p>
        </div>

        {/* Live Counters Pill */}
        <div className="flex items-center justify-center lg:justify-end gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 bg-[#45c66d]/15 text-[#45c66d] font-semibold px-3 py-1.5 rounded-xl border border-[#45c66d]/30">
            <span className="w-2 h-2 rounded-full bg-[#45c66d] animate-pulse" />
            {readyCount} Videos Live
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-medium px-3 py-1.5 rounded-xl border border-amber-500/20">
            <Clock className="w-3 h-3" />
            {upcomingCount} In Production
          </span>
        </div>
      </div>

      {/* MOBILE ONLY: HORIZONTAL SCROLL PILLS (< lg) */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          <button
            onClick={() => setSelectedSection("all")}
            className={`whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
              selectedSection === "all"
                ? "bg-[#45c66d] text-black border-[#45c66d]"
                : "bg-[#0b110d] text-[#8da096] border-white/10"
            }`}
          >
            <span>All Workspaces</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
              {totalCount}
            </span>
          </button>
          {TUTORIAL_SECTIONS.map((sec) => {
            const Icon = SECTION_ICONS[sec.id] || Sparkles;
            const isSelected = selectedSection === sec.id;
            const liveVideos = TUTORIAL_VIDEOS.filter((v) => v.sectionKey === sec.id && v.isReady);
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all shrink-0 border ${
                  isSelected
                    ? "bg-[#45c66d] text-black font-semibold border-[#45c66d]"
                    : "bg-[#0b110d] text-[#8da096] border-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.name}</span>
                {liveVideos.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: LEFT SIDEBAR TABS + RIGHT VIDEO CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================ */}
        {/* LEFT SIDEBAR: VERTICAL TABS NAV (Sticky on desktop) */}
        {/* ================================================================ */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
          <div className="bg-[#0b110d] border border-white/10 rounded-2xl p-3 md:p-4 shadow-2xl backdrop-blur-xl">
            {/* Sidebar Title */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8da096] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#45c66d]" />
                Select Workspace Tab
              </span>
              <span className="text-[10px] font-mono text-[#45c66d] bg-[#45c66d]/10 px-2 py-0.5 rounded border border-[#45c66d]/20">
                11 Tabs
              </span>
            </div>

            {/* Vertical Tab List */}
            <nav className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* ALL WORKSPACES BUTTON */}
              <button
                onClick={() => setSelectedSection("all")}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                  selectedSection === "all"
                    ? "bg-[#45c66d] text-black font-bold shadow-[0_0_20px_rgba(69,198,109,0.35)]"
                    : "text-[#8da096] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      selectedSection === "all"
                        ? "bg-black/20 text-black"
                        : "bg-white/5 text-[#45c66d] group-hover:bg-[#45c66d]/10"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-semibold leading-tight">
                      All Workspaces
                    </div>
                    <div
                      className={`text-[10px] leading-tight ${
                        selectedSection === "all" ? "text-black/80" : "text-[#8da096]/70"
                      }`}
                    >
                      সবগুলো সেকশন একসাথে
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                    selectedSection === "all"
                      ? "bg-black text-[#45c66d] font-bold"
                      : "bg-white/5 text-[#8da096]"
                  }`}
                >
                  {totalCount}
                </span>
              </button>

              <div className="my-1.5 border-t border-white/5" />

              {/* 11 EXTENSION TABS + LICENSE */}
              {TUTORIAL_SECTIONS.map((sec) => {
                const Icon = SECTION_ICONS[sec.id] || Sparkles;
                const isSelected = selectedSection === sec.id;
                const sectionVideos = TUTORIAL_VIDEOS.filter((v) => v.sectionKey === sec.id);
                const liveCount = sectionVideos.filter((v) => v.isReady).length;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                      isSelected
                        ? "bg-gradient-to-r from-[#45c66d] to-[#38a85c] text-black font-bold shadow-[0_0_25px_rgba(69,198,109,0.4)]"
                        : "text-[#8da096] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-black/20 text-black"
                            : "bg-white/5 text-[#45c66d] group-hover:bg-[#45c66d]/15"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-xs md:text-sm font-semibold leading-tight truncate">
                          {sec.name}
                        </div>
                        <div
                          className={`text-[10px] leading-tight truncate ${
                            isSelected ? "text-black/80" : "text-[#8da096]/70"
                          }`}
                        >
                          {sec.banglaName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {liveCount > 0 ? (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            isSelected
                              ? "bg-black text-[#45c66d]"
                              : "bg-[#45c66d]/15 text-[#45c66d] border border-[#45c66d]/30"
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          {liveCount}
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-black/30 text-black"
                              : "bg-white/5 text-amber-400/80 border border-white/5"
                          }`}
                        >
                          Soon
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected
                            ? "translate-x-0.5 text-black"
                            : "opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Help / Community Link Box */}
            <div className="mt-4 pt-4 border-t border-white/5 px-2">
              <a
                href="https://chat.whatsapp.com/Fzpmh27mRBa2QODckm2uuc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[#8da096] hover:text-white transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[#45c66d]" />
                  <span>Request a Video</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#8da096]" />
              </a>
            </div>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* RIGHT CONTENT AREA: SEARCH + BANNER + VIDEOS GRID */}
        {/* ================================================================ */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          
          {/* SEARCH & AVAILABILITY STATUS FILTERS */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8da096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials by keyword (e.g. anchor, graph, morph, sfx, captions)..."
                className="w-full bg-[#0b110d] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-xs md:text-sm text-white placeholder-[#8da096]/60 focus:outline-none focus:border-[#45c66d] focus:ring-1 focus:ring-[#45c66d] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8da096] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-medium bg-[#0b110d] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "all"
                    ? "bg-[#45c66d]/15 text-[#45c66d] font-semibold border border-[#45c66d]/30"
                    : "text-[#8da096] hover:text-white"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter("ready")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "ready"
                    ? "bg-[#45c66d]/15 text-[#45c66d] font-semibold border border-[#45c66d]/30"
                    : "text-[#8da096] hover:text-white"
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                Ready ({readyCount})
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "upcoming"
                    ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                    : "text-[#8da096] hover:text-white"
                }`}
              >
                <Clock className="w-3 h-3" />
                Upcoming ({upcomingCount})
              </button>
            </div>
          </div>

          {/* ACTIVE WORKSPACE BANNER */}
          {activeSectionMeta ? (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#0d1610] to-[#070b08] border border-[#45c66d]/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#45c66d]/5 blur-3xl pointer-events-none rounded-full" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#45c66d] tracking-wider uppercase">
                      {activeSectionMeta.name} • {activeSectionMeta.banglaName}
                    </span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-[#8da096]">{activeSectionMeta.tagline}</span>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-2xl">
                    {activeSectionMeta.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSection("all")}
                  className="text-xs text-[#8da096] hover:text-white flex items-center gap-1 shrink-0 self-start sm:self-auto border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  View All Tabs
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-[#0b110d] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#8da096]">
                <Sparkles className="w-3.5 h-3.5 text-[#45c66d]" />
                <span>
                  Showing tutorials across <strong className="text-white">All 11 Extension Tabs</strong> ({filteredVideos.length} matching guides)
                </span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[11px] text-[#45c66d] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* VIDEO CARDS GRID */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16 bg-[#0b110d] border border-white/10 rounded-2xl p-8">
              <Search className="w-10 h-10 text-[#8da096]/50 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No tutorials match your filter</h3>
              <p className="text-sm text-[#8da096] mb-4">
                Try searching with a different keyword or reset the tab and status filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSection("all");
                  setStatusFilter("all");
                }}
                className="text-xs font-semibold text-[#45c66d] border border-[#45c66d]/30 bg-[#45c66d]/10 px-4 py-2 rounded-xl hover:bg-[#45c66d]/20 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredVideos.map((video) => {
                const isPlaying = playingVideoId === video.id;

                return (
                  <div
                    key={video.id}
                    className="group relative bg-[#0b110d] border border-white/10 hover:border-[#45c66d]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300"
                  >
                    {/* VIDEO PLAYER / PLACEHOLDER TOP */}
                    <div className="aspect-video relative w-full bg-black/60 overflow-hidden">
                      {video.isReady && video.youtubeId ? (
                        isPlaying ? (
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        ) : (
                          <div
                            onClick={() => setPlayingVideoId(video.id)}
                            className="relative w-full h-full cursor-pointer group/thumb"
                          >
                            <img
                              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-[#45c66d] text-black flex items-center justify-center shadow-[0_0_25px_rgba(69,198,109,0.6)] group-hover/thumb:scale-110 transition-transform duration-300">
                                <Play className="w-6 h-6 fill-black ml-0.5" />
                              </div>
                            </div>

                            {/* Duration badge */}
                            {video.duration && (
                              <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-white/10">
                                {video.duration}
                              </div>
                            )}

                            {/* Ready Pill */}
                            <div className="absolute top-2.5 left-2.5 bg-[#45c66d]/90 backdrop-blur-md text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                              Ready to Watch
                            </div>
                          </div>
                        )
                      ) : (
                        /* IN PRODUCTION PLACEHOLDER */
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br from-[#0e1611] to-[#070b08] border-b border-white/5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2.5 text-amber-400">
                            <Video className="w-6 h-6" />
                          </div>
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/15 text-amber-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30 mb-1.5">
                            <Clock className="w-3 h-3" />
                            Recording in Progress / শীঘ্রই আসছে
                          </span>
                          <p className="text-white/60 text-[11px] max-w-xs leading-relaxed">
                            এই সেকশনের স্পেসিফিক ভিডিও টিউটোরিয়াল দ্রুত আপলোড করা হবে।
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Tags row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-semibold text-[#45c66d] bg-[#45c66d]/10 px-2 py-0.5 rounded border border-[#45c66d]/20">
                            {video.sectionName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {video.badge && (
                              <span className="text-[10px] font-semibold text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                {video.badge}
                              </span>
                            )}
                            <span className="text-[10px] font-medium text-[#8da096] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                              {video.level}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#45c66d] transition-colors leading-snug line-clamp-2">
                          {video.title}
                        </h3>
                        {video.banglaTitle && (
                          <h4 className="text-[11px] text-[#8da096] mb-2 font-medium line-clamp-1">
                            {video.banglaTitle}
                          </h4>
                        )}

                        {/* Description */}
                        <p className="text-xs text-[#8da096] leading-relaxed mb-3 line-clamp-2">
                          {video.description}
                        </p>

                        {/* Feature Topics Checklist */}
                        <div className="pt-2.5 border-t border-white/5">
                          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                            {video.isReady ? "Topics Covered:" : "What You Will Learn:"}
                          </p>
                          <ul className="space-y-1">
                            {video.topics.slice(0, 4).map((topic, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-white/80 flex items-start gap-1.5"
                              >
                                <CheckCircle2
                                  className={`w-3 h-3 shrink-0 mt-0.5 ${
                                    video.isReady ? "text-[#45c66d]" : "text-amber-400/80"
                                  }`}
                                />
                                <span className="line-clamp-1">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* BOTTOM ACTION BAR */}
                      <div className="pt-3.5 mt-4 border-t border-white/10 flex items-center justify-between">
                        {video.isReady && video.youtubeId ? (
                          <>
                            <button
                              onClick={() => setPlayingVideoId(video.id)}
                              className="text-xs font-semibold text-black bg-[#45c66d] hover:bg-[#52e880] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(69,198,109,0.3)]"
                            >
                              <Play className="w-3 h-3 fill-black" />
                              {isPlaying ? "Replay Video" : "Play Video"}
                            </button>
                            <a
                              href={`https://youtu.be/${video.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#8da096] hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <span>Watch on YouTube</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              Upcoming Recording
                            </span>
                            <a
                              href="https://chat.whatsapp.com/Fzpmh27mRBa2QODckm2uuc"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#8da096] hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <span>Request Topic</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* QUICK HOW-TO-UPDATE NOTE FOR USER/ADMIN */}
      <div className="mt-16 p-5 rounded-2xl bg-[#0b110d] border border-white/10 text-xs text-[#8da096] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-white font-semibold flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#45c66d]" />
            ভবিষ্যতে নতুন ভিডিও যুক্ত করার পদ্ধতি:
          </span>
          <p className="text-white/70">
            প্রতিটি সেকশনের নতুন ভিডিও রেকর্ড করার পর শুধু <code className="text-[#45c66d] bg-black/50 px-1.5 py-0.5 rounded font-mono">src/lib/tutorials-data.ts</code> ফাইলে গিয়ে সংশ্লিষ্ট সেকশনে <code className="text-[#45c66d] bg-black/50 px-1.5 py-0.5 rounded font-mono">isReady: true</code> এবং আপনার <code className="text-[#45c66d] bg-black/50 px-1.5 py-0.5 rounded font-mono">youtubeId</code> পেস্ট করে দিলেই লাইভ হয়ে যাবে!
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 text-xs font-semibold text-black bg-[#45c66d] hover:bg-[#52e880] px-4 py-2 rounded-xl transition-all"
        >
          Get Orbit Studio
        </Link>
      </div>
    </section>
  );
}
