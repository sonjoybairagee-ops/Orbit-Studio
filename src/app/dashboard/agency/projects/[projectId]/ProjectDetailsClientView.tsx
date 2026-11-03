"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Film,
  FolderTree,
  FileText,
  PackageCheck,
  Calendar,
  Building,
  Upload,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { VideoReviewPlayer } from "@/components/agency/VideoReviewPlayer";
import { AgencyProject, AgencyVideoVersion, AgencyProjectFile, FileCategory } from "@/types/agency";

interface ProjectDetailsClientViewProps {
  project: AgencyProject;
  versions: AgencyVideoVersion[];
  files: AgencyProjectFile[];
  user: any;
}

export function ProjectDetailsClientView({
  project,
  versions: initialVersions,
  files: initialFiles,
  user,
}: ProjectDetailsClientViewProps) {
  const [activeTab, setActiveTab] = useState<"review" | "files" | "brief" | "delivery">("review");
  const [versions, setVersions] = useState<AgencyVideoVersion[]>(initialVersions);
  const [files, setFiles] = useState<AgencyProjectFile[]>(initialFiles);

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadCategory, setUploadCategory] = useState<FileCategory>("original");

  // New Version Cut Modal
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [versionLabel, setVersionLabel] = useState<string>(`v${versions.length + 1}`);
  const [versionUrl, setVersionUrl] = useState<string>("");
  const [changelog, setChangelog] = useState<string>("");
  const [isSubmittingVersion, setIsSubmittingVersion] = useState<boolean>(false);
  const [versionError, setVersionError] = useState<string>("");

  // Portal copy state
  const [copiedPortal, setCopiedPortal] = useState<boolean>(false);

  // File Upload to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Get presigned upload URL
      const presignedRes = await fetch("/api/agency/storage/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: project.workspace_id,
          projectId: project.id,
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          mimeType: selectedFile.type,
          category: uploadCategory,
        }),
      });

      const presignedData = await presignedRes.json();
      if (!presignedRes.ok) {
        throw new Error(presignedData.error || "Failed to initiate upload.");
      }

      setUploadProgress(40);

      // 2. Direct upload to Cloudflare R2
      const uploadRes = await fetch(presignedData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream",
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Direct Cloudflare R2 upload failed.");
      }

      setUploadProgress(80);

      // 3. Confirm upload and save file record
      const confirmRes = await fetch("/api/agency/storage/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: project.workspace_id,
          projectId: project.id,
          r2Key: presignedData.r2Key,
          fileName: selectedFile.name,
          fileSizeBytes: selectedFile.size,
          mimeType: selectedFile.type,
          category: uploadCategory,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmData.error || "Failed to confirm file registration.");
      }

      setUploadProgress(100);
      setFiles([confirmData.file, ...files]);

      // If category is preview/video, prompt or offer to create version
      if (selectedFile.type.startsWith("video/")) {
        setVersionUrl(`https://assets.compxorbit.com/${presignedData.r2Key}`);
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  // Create Version Cut
  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionUrl.trim()) return;

    setIsSubmittingVersion(true);
    setVersionError("");

    try {
      const res = await fetch("/api/agency/reviews/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          versionLabel,
          videoUrl: versionUrl,
          changelog,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create video version cut.");
      }

      setVersions([data.version, ...versions]);
      setIsVersionModalOpen(false);
      setVersionUrl("");
      setChangelog("");
      setVersionLabel(`v${versions.length + 2}`);
      setActiveTab("review");
    } catch (err: any) {
      setVersionError(err.message || "Failed to create version.");
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file from R2?")) return;
    try {
      const res = await fetch(
        `/api/agency/storage/delete?fileId=${fileId}&workspaceId=${project.workspace_id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setFiles(files.filter((f) => f.id !== fileId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyPortalUrl = () => {
    const portalToken = (project as any).agency_clients?.portal_token;
    if (!portalToken) return;
    const url = `${window.location.origin}/portal/${portalToken}`;
    navigator.clipboard.writeText(url);
    setCopiedPortal(true);
    setTimeout(() => setCopiedPortal(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Project Breadcrumb & Status Header */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8da194]">
              <Link href="/dashboard/agency/projects" className="hover:text-[#3cff5f]">
                Projects
              </Link>
              <span>/</span>
              <span className="text-[#e7eee9] font-medium">{project.title}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] mt-1.5 flex items-center gap-2.5">
              <span>{project.title}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  project.status === "approved" || project.status === "delivered"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : project.status === "client_review"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                }`}
              >
                {project.status.replace("_", " ")}
              </span>
            </h1>
            <p className="text-xs text-[#8da194] mt-0.5 flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-[#62776a]" />
              <span>
                Client:{" "}
                <strong className="text-[#e7eee9]">
                  {(project as any).agency_clients?.name || "Internal Agency Project"}
                </strong>
              </span>
              {project.deadline && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-mono">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsVersionModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-3.5 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Video Cut</span>
            </button>

            {(project as any).agency_clients?.portal_token && (
              <button
                type="button"
                onClick={copyPortalUrl}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-bold text-[#8da194] hover:text-[#3cff5f] hover:border-[#3cff5f]/40 transition-all cursor-pointer"
                title="Copy client's private review portal URL"
              >
                {copiedPortal ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span className="text-[#3cff5f]">Portal Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Client Review Link</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 border-t border-[#1b2720] pt-4 overflow-x-auto">
          {[
            { id: "review", label: "Video Review Room", icon: Film, count: versions.length },
            { id: "files", label: "Project Files & R2 Assets", icon: FolderTree, count: files.length },
            { id: "brief", label: "Creative Brief & Scope", icon: FileText },
            { id: "delivery", label: "Final Deliveries", icon: PackageCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? "bg-[#102a16] border border-[#3cff5f] text-[#3cff5f] shadow-sm shadow-[#3cff5f]/15"
                    : "text-[#8da194] hover:text-[#e7eee9] hover:bg-[#080e0b]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="rounded-full bg-[#080e0b] px-1.5 py-0.2 text-[10px] font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Video Review Room */}
      {activeTab === "review" && (
        <VideoReviewPlayer
          projectId={project.id}
          versions={versions}
          onVersionChange={() => {}}
        />
      )}

      {/* TAB 2: Files & Cloudflare R2 Upload */}
      {activeTab === "files" && (
        <div className="space-y-6">
          {/* Direct Upload Dropzone */}
          <div className="rounded-3xl border border-dashed border-[#2a5234] bg-[#0c1510] p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-[#8da194]">Upload Category:</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as FileCategory)}
                className="bg-[#080e0b] border border-[#213026] text-xs font-bold text-[#3cff5f] rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="original">Original Footage / Raw</option>
                <option value="preview">Video Cut / Preview</option>
                <option value="deliverable">Final Deliverable</option>
                <option value="audio">Audio / SFX</option>
                <option value="image">Thumbnail / Still</option>
              </select>
            </div>

            <label className="cursor-pointer inline-flex flex-col items-center justify-center p-4">
              <input
                type="file"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
              <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] mb-2">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#e7eee9]">
                {isUploading ? `Uploading to Cloudflare R2 (${uploadProgress}%)...` : "Click to Upload File to R2"}
              </span>
              <span className="text-[11px] text-[#62776a] mt-0.5">
                ProRes, MP4, MOV, WAV, PNG, ZIP — direct presigned upload up to 2 GB
              </span>
            </label>

            {isUploading && (
              <div className="w-64 mx-auto h-1.5 rounded-full bg-[#1b2720] overflow-hidden">
                <div
                  className="h-full bg-[#3cff5f] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-[#3cff5f]" />
              <span>Project Files in R2 ({files.length})</span>
            </h3>

            {files.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#62776a]">
                No files uploaded yet for this project.
              </div>
            ) : (
              <div className="space-y-2.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[#213026] bg-[#080e0b] gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#e7eee9] truncate">{file.file_name}</p>
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

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <a
                        href={`https://assets.compxorbit.com/${file.r2_key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#213026] bg-[#0c1510] text-xs font-bold text-[#3cff5f] hover:bg-[#102a16] transition-all"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 rounded-xl text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Creative Brief */}
      {activeTab === "brief" && (
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2 border-b border-[#1b2720] pb-3">
            <FileText className="h-4 w-4 text-[#3cff5f]" />
            <span>Creative Scope &amp; Production Brief</span>
          </h3>

          <div className="prose prose-invert max-w-none text-xs text-[#e7eee9] leading-relaxed whitespace-pre-line bg-[#080e0b] p-4 rounded-2xl border border-[#213026]">
            {project.description || "No specific creative brief provided."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5">
              <span className="text-[11px] font-bold text-[#8da194]">Assigned Client</span>
              <p className="text-xs font-bold text-[#e7eee9] mt-1">
                {(project as any).agency_clients?.name || "None"}
              </p>
              <p className="text-[11px] text-[#62776a]">{(project as any).agency_clients?.company}</p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5">
              <span className="text-[11px] font-bold text-[#8da194]">Project Budget</span>
              <p className="text-xs font-mono font-bold text-[#3cff5f] mt-1">
                ${project.budget || 0} USD
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5">
              <span className="text-[11px] font-bold text-[#8da194]">Priority</span>
              <p className="text-xs font-bold text-amber-400 uppercase font-mono mt-1">
                {project.priority} priority
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Final Deliveries & Client Approval */}
      {activeTab === "delivery" && (
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1b2720] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-[#3cff5f]" />
                <span>Final Client Deliverables &amp; Approval</span>
              </h3>
              <p className="text-xs text-[#8da194] mt-0.5">
                Share approved 4K/ProRes renders and final deliverables with client download authorization.
              </p>
            </div>

            {(project as any).agency_clients?.portal_token && (
              <a
                href={`/portal/${(project as any).agency_clients.portal_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer"
              >
                <span>View Client Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#e7eee9]">Client Approval Status:</h4>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  project.status === "approved" || project.status === "delivered"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {project.status === "approved" ? "✓ Client Approved" : "Awaiting Client Sign-Off"}
              </span>
            </div>
            <p className="text-xs text-[#8da194]">
              Send the private Client Portal link to your client. When they click "Approve Video Cut", the status updates automatically and final renders unlock.
            </p>
          </div>
        </div>
      )}

      {/* New Video Cut Version Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-2xl relative">
            <button
              onClick={() => setIsVersionModalOpen(false)}
              className="absolute right-4 top-4 text-[#8da194] hover:text-[#e7eee9] p-1.5 rounded-lg hover:bg-[#102a16]"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
              <Film className="h-4 w-4 text-[#3cff5f]" />
              <span>Add New Video Cut (Iteration)</span>
            </h2>
            <p className="text-xs text-[#8da194] mt-1 mb-4">
              Publish a new cut for timestamp-based review and client feedback.
            </p>

            {versionError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{versionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVersion} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Version Label (e.g. v1, v2, Director's Cut) *
                </label>
                <input
                  type="text"
                  required
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Video Stream / MP4 URL *
                </label>
                <input
                  type="url"
                  required
                  value={versionUrl}
                  onChange={(e) => setVersionUrl(e.target.value)}
                  placeholder="https://assets.compxorbit.com/... or sample video URL"
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs font-mono text-[#3cff5f] focus:border-[#3cff5f] focus:outline-none"
                />
                <span className="text-[10px] text-[#62776a] mt-1 block">
                  You can upload an MP4 in the Files tab or paste any public streaming link.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Iteration Notes / Changelog
                </label>
                <textarea
                  rows={2}
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="e.g. Adjusted audio mix, corrected color grading on scene 3..."
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2720]">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8da194] hover:text-[#e7eee9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVersion}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all disabled:opacity-50"
                >
                  {isSubmittingVersion ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Cut for Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

