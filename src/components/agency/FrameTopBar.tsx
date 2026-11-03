"use client";

import React, { useState } from "react";
import { Search, Sparkles, HardDrive, Plus, X } from "lucide-react";
import { Workspace } from "@/types/agency";
import Link from "next/link";

interface FrameTopBarProps {
  workspace: Workspace;
  onSearchChange?: (query: string) => void;
  onOpenNewProjectModal?: () => void;
}

export function FrameTopBar({
  workspace,
  onSearchChange,
  onOpenNewProjectModal,
}: FrameTopBarProps) {
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = (val: string) => {
    setSearchVal(val);
    if (onSearchChange) onSearchChange(val);
  };

  const usedMB = (workspace.storage_used_bytes / (1024 * 1024)).toFixed(0);
  const totalGB = (workspace.storage_quota_bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <header className="h-12 border-b border-[#181c28] bg-[#0c0e15] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-40">
      {/* Left workspace slug indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#8d9ab2] tracking-wide hidden md:inline">
          CompX Orbit
        </span>
        <span className="text-xs text-[#404c63] hidden md:inline">/</span>
        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
          {workspace.name}
        </span>
      </div>

      {/* Center Search Pill (Frame.io 1:1) */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-[#5e6b84]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search projects, clients, tags..."
            className="w-full h-8 pl-9 pr-8 rounded-full bg-[#141722] border border-[#222838] text-xs text-white placeholder-[#5e6b84] focus:outline-none focus:border-[#4d6fff] focus:ring-1 focus:ring-[#4d6fff]/30 transition-all"
          />
          {searchVal && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 text-[#5e6b84] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Storage Pill */}
        <Link
          href="/dashboard/agency/storage"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131622] border border-[#212638] text-[11px] text-[#8c98af] hover:text-white hover:border-[#3cff5f]/50 transition-all"
          title="Cloud Storage Quota"
        >
          <HardDrive className="h-3 w-3 text-[#3cff5f]" />
          <span>{usedMB}MB / {totalGB}GB</span>
        </Link>

        {/* New Project Button */}
        {onOpenNewProjectModal && (
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#4d6fff] hover:bg-[#5f7eff] text-white px-3.5 py-1 text-xs font-bold transition-all shadow-md shadow-[#4d6fff]/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        )}
      </div>
    </header>
  );
}
