"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  FolderTree,
  HardDrive,
  Upload,
  Search,
  FileVideo,
  Music,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  FolderKanban,
  FileArchive,
  Eye,
} from "lucide-react";
import { Workspace, AgencyProject, AgencyProjectFile, FileCategory } from "@/types/agency";
import { useStorageUpload } from "@/lib/agency/useStorageUpload";

interface AgencyFileManagerClientViewProps {
  workspace: Workspace;
  initialProjects: AgencyProject[];
  initialFiles: AgencyProjectFile[];
}

const CATEGORY_TABS: Array<{ id: string; label: string; icon: any; category?: FileCategory }> = [
  { id: "all", label: "All Assets", icon: FolderTree },
  { id: "preview", label: "Video Cuts & Previews", icon: FileVideo, category: "preview" },
  { id: "original", label: "Raw Footage", icon: FileVideo, category: "original" },
  { id: "deliverable", label: "Final Deliverables", icon: FileArchive, category: "deliverable" },
  { id: "audio", label: "Audio & SFX", icon: Music, category: "audio" },
  { id: "image", label: "Thumbnails & Stills", icon: ImageIcon, category: "image" },
  { id: "document", label: "Docs & Briefs", icon: FileText, category: "document" },
];

export function AgencyFileManagerClientView({
  workspace: initialWorkspace,
  initialProjects,
  initialFiles,
}: AgencyFileManagerClientViewProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [projects] = useState<AgencyProject[]>(initialProjects);
  const [files, setFiles] = useState<AgencyProjectFile[]>(initialFiles);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size_desc" | "name">("newest");
  const [isDropzoneOpen, setIsDropzoneOpen] = useState<boolean>(false);

  // Selected Upload Context
  const [targetProjectId, setTargetProjectId] = useState<string>(
    initialProjects[0]?.id || ""
  );
  const [targetCategory, setTargetCategory] = useState<FileCategory>("original");

  // Deletion State
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // File input ref for clicking upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage Upload Hook
  const { queue, addFilesToQueue, cancelUpload, retryUpload, clearCompleted, isUploading } =
    useStorageUpload({
      onFileUploaded: (newFile) => {
        setFiles((prev) => [newFile, ...prev]);
        // Update workspace used bytes locally
        setWorkspace((prev) => ({
          ...prev,
          storage_used_bytes: Number(prev.storage_used_bytes || 0) + Number(newFile.file_size_bytes),
          reserved_bytes: Math.max(0, Number(prev.reserved_bytes || 0) - Number(newFile.file_size_bytes)),
        }));
      },
    });

  // Calculate live storage quota metrics
  const quota = Number(workspace.storage_quota_bytes || 2147483648);
  const used = Number(workspace.storage_used_bytes || 0);
  const reserved = Number(workspace.reserved_bytes || 0);
  const available = Math.max(0, quota - used - reserved);

  const usedMB = (used / (1024 * 1024)).toFixed(1);
  const reservedMB = (reserved / (1024 * 1024)).toFixed(1);
  const availableMB = (available / (1024 * 1024)).toFixed(1);
  const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(1);

  const usedPercent = Math.min(100, Math.round((used / quota) * 100) || 0);
  const reservedPercent = Math.min(100 - usedPercent, Math.round((reserved / quota) * 100) || 0);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Tab Category filter
        if (activeTab !== "all" && file.category !== activeTab) {
          return false;
        }
        // Project filter
        if (selectedProjectId !== "all" && file.project_id !== selectedProjectId) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!file.file_name.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "size_desc") {
          return b.file_size_bytes - a.file_size_bytes;
        }
        if (sortBy === "name") {
          return a.file_name.localeCompare(b.file_name);
        }
        return 0;
      });
  }, [files, activeTab, selectedProjectId, searchQuery, sortBy]);

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!targetProjectId) {
      alert("Please select or create a project first to upload assets.");
      return;
    }
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles, {
        workspaceId: workspace.id,
        projectId: targetProjectId,
        category: targetCategory,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!targetProjectId) {
      alert("Please select or create a project first to upload assets.");
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      addFilesToQueue(selected, {
        workspaceId: workspace.id,
        projectId: targetProjectId,
        category: targetCategory,
      });
      e.target.value = "";
    }
  };

  // Handle Download via Secure Signed GET URL
  const handleDownload = async (file: AgencyProjectFile) => {
    setDownloadingFileId(file.id);
    try {
      const res = await fetch(`/api/agency/storage/download?fileId=${file.id}`);
      const data = await res.json();
      if (!res.ok || !data.downloadUrl) {
        throw new Error(data.error || "Failed to generate download link.");
      }
      // Trigger download
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      alert(msg);
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Handle Delete with atomic recalculation
  const handleDelete = async (file: AgencyProjectFile) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.file_name}" from Cloudflare R2?`)) {
      return;
    }

    setDeletingFileId(file.id);
    try {
      const res = await fetch(
        `/api/agency/storage/delete?fileId=${file.id}&workspaceId=${workspace.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete file.");
      }

      // Remove from state
      setFiles((prev) => prev.filter((f) => f.id !== file.id));

      // Decrement workspace used bytes
      setWorkspace((prev) => ({
        ...prev,
        storage_used_bytes: Math.max(0, Number(prev.storage_used_bytes || 0) - Number(file.file_size_bytes)),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
    } finally {
      setDeletingFileId(null);
    }
  };

  const getFileIcon = (mime: string, cat: FileCategory) => {
    if (mime.startsWith("video/") || cat === "preview" || cat === "original") {
      return <FileVideo className="h-5 w-5 text-[#3cff5f]" />;
    }
    if (mime.startsWith("audio/") || cat === "audio") {
      return <Music className="h-5 w-5 text-[#ffc83b]" />;
    }
    if (mime.startsWith("image/") || cat === "image") {
      return <ImageIcon className="h-5 w-5 text-[#4da6ff]" />;
    }
    if (mime.includes("zip") || mime.includes("tar") || cat === "deliverable") {
      return <FileArchive className="h-5 w-5 text-[#c07eff]" />;
    }
    return <FileText className="h-5 w-5 text-[#8da194]" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Storage Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-[#3cff5f]" />
            <span>Cloudflare R2 File Explorer &amp; Assets</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Zero-egress object storage with atomic quota reservations, direct browser-to-R2 uploads, and signed download links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsDropzoneOpen(!isDropzoneOpen)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>{isDropzoneOpen ? "Close Uploader" : "Upload Assets to R2"}</span>
          </button>
        </div>
      </div>

      {/* 2. Over-Quota Warning Alert Banner (if applicable) */}
      {workspace.is_over_quota && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 flex items-center justify-between gap-4 text-red-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-red-100">Storage Quota Exceeded</p>
              <p className="text-red-300/90 text-[11px] mt-0.5">
                Your workspace is currently over quota following a plan or add-on change. All existing files remain 100% safe, but new uploads are blocked until storage is freed or upgraded.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/agency/storage"
            className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs shrink-0 hover:bg-red-400 transition-all"
          >
            Upgrade Storage
          </a>
        </div>
      )}

      {/* 3. Storage Breakdown Bar */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#8da194] flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#3cff5f]" />
              <span className="text-[#e7eee9]">
                {workspace.name} Storage Quota ({workspace.plan_tier.toUpperCase()})
              </span>
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#3cff5f]">{usedMB} MB used</span>
              {reserved > 0 && (
                <span className="text-[#4da6ff]">({reservedMB} MB reserved)</span>
              )}
              <span className="text-[#8da194]">/ {totalGB} GB quota</span>
            </div>
          </div>

          {/* Dual Segment Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-[#1b2720] overflow-hidden flex p-0.5">
            <div
              className={`h-full rounded-l-full transition-all duration-500 ${
                usedPercent > 90 ? "bg-red-500" : usedPercent > 70 ? "bg-yellow-400" : "bg-[#3cff5f]"
              }`}
              style={{ width: `${Math.max(1, usedPercent)}%` }}
              title={`Used: ${usedMB} MB (${usedPercent}%)`}
            />
            {reservedPercent > 0 && (
              <div
                className="h-full bg-[#4da6ff] animate-pulse rounded-r-full transition-all duration-500"
                style={{ width: `${reservedPercent}%` }}
                title={`Reserved: ${reservedMB} MB (${reservedPercent}%)`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#62776a] font-mono">
            <span>Available to upload: {availableMB} MB</span>
            <span>Total files: {files.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <span className="text-xs text-[#8da194]">R2 Vault:</span>
          <span className="rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1 text-xs font-mono text-[#3cff5f]">
            compx-orbit-agency-storage
          </span>
        </div>
      </div>

      {/* 4. Upload Dropzone Drawer */}
      {isDropzoneOpen && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-3xl border-2 border-dashed border-[#3cff5f]/50 bg-[#0a130e] p-6 sm:p-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2720]">
            <div>
              <h3 className="text-sm font-bold text-[#e7eee9] flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#3cff5f]" />
                <span>Upload Assets directly to Cloudflare R2</span>
              </h3>
              <p className="text-xs text-[#8da194] mt-0.5">
                Drag and drop files here or select target project and category below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Project Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8da194]">Project:</span>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="bg-[#0c1510] border border-[#213026] text-xs font-bold text-[#e7eee9] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#3cff5f]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#8da194]">Category:</span>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as FileCategory)}
                  className="bg-[#0c1510] border border-[#213026] text-xs font-bold text-[#3cff5f] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#3cff5f]"
                >
                  <option value="original">Raw Footage / Original</option>
                  <option value="preview">Video Cut / Preview</option>
                  <option value="deliverable">Final Deliverable</option>
                  <option value="audio">Audio / SFX</option>
                  <option value="image">Thumbnail / Still</option>
                  <option value="document">Document / PDF</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#15381d] transition-all cursor-pointer"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Active Upload Queue Display */}
          {queue.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#e7eee9]">
                  Upload Queue ({queue.filter((q) => q.status === "completed").length}/{queue.length} completed)
                </span>
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="text-[11px] text-[#8da194] hover:text-[#e7eee9]"
                >
                  Clear Completed
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#1b2720] bg-[#0c1510] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#e7eee9] truncate max-w-md">
                          {item.fileName}
                        </span>
                        <span className="text-[11px] text-[#8da194] font-mono">
                          {(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB · {item.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full rounded-full bg-[#1b2720] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.status === "error"
                              ? "bg-red-500"
                              : item.status === "completed"
                              ? "bg-[#3cff5f]"
                              : "bg-[#4da6ff]"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                      {item.error && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{item.error}</span>
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {item.status === "error" && (
                        <button
                          type="button"
                          onClick={() => retryUpload(item.id)}
                          className="p-1 rounded text-[#3cff5f] hover:bg-[#102a16]"
                          title="Retry"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(item.status === "uploading" || item.status === "reserving") && (
                        <button
                          type="button"
                          onClick={() => cancelUpload(item.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-950/40"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {item.status === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-[#3cff5f]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1c2234]">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "all"
              ? files.length
              : files.filter((f) => f.category === tab.category).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#102a16] border border-[#3cff5f]/40 text-[#3cff5f] shadow-sm shadow-[#3cff5f]/15"
                  : "text-[#8da194] hover:bg-[#0c1510] hover:text-[#e7eee9] border border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className="rounded-full bg-[#1b2720] px-1.5 py-0.2 text-[10px] font-mono text-[#8da194]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 6. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62776a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by file name..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0c1510] border border-[#213026] text-xs text-[#e7eee9] placeholder-[#62776a] focus:outline-none focus:border-[#3cff5f]"
          />
        </div>

        {/* Project & Sorting controls */}
        <div className="flex items-center gap-2.5">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#8da194]">
            <FolderKanban className="h-3.5 w-3.5 text-[#62776a]" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#0c1510] border border-[#213026] text-xs text-[#e7eee9] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#3cff5f]"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-[#8da194]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#62776a]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0c1510] border border-[#213026] text-xs text-[#e7eee9] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#3cff5f]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="size_desc">File Size (Largest)</option>
              <option value="name">File Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7. File Listing Table / Grid */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-6 shadow-xl">
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[#e7eee9]">
              {searchQuery ? "No matching assets found" : "No assets in this category yet"}
            </h3>
            <p className="text-xs text-[#8da194] max-w-sm mx-auto">
              {searchQuery
                ? `No files match "${searchQuery}". Try adjusting your search query or filters.`
                : "Upload raw footage, cuts, or final deliverables directly to your private R2 bucket."}
            </p>
            <button
              type="button"
              onClick={() => setIsDropzoneOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] px-4 py-2 hover:bg-[#15381d] transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Assets</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[#1b2720] bg-[#080e0b] hover:border-[#3cff5f]/30 transition-all gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center shrink-0">
                    {getFileIcon(file.mime_type, file.category)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#e7eee9] truncate max-w-md">
                      {file.file_name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#8da194] mt-0.5">
                      <span className="uppercase text-[9px] font-mono text-[#3cff5f] bg-[#102a16] px-1.5 py-0.2 rounded border border-[#2a5234]">
                        {file.category}
                      </span>
                      <span>•</span>
                      <span>{(file.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    disabled={downloadingFileId === file.id}
                    onClick={() => handleDownload(file)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#213026] bg-[#0c1510] text-xs font-bold text-[#3cff5f] hover:bg-[#102a16] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {downloadingFileId === file.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    disabled={deletingFileId === file.id}
                    onClick={() => handleDelete(file)}
                    className="p-1.5 rounded-xl text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete file permanently"
                  >
                    {deletingFileId === file.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

