"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  List as ListIcon,
  Filter,
  ArrowUpDown,
  Plus,
  MoreHorizontal,
  Users,
  Film,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Share2,
  Sparkles,
  X,
  Lock,
  ChevronDown,
} from "lucide-react";
import { FrameInviteModal } from "./FrameInviteModal";
import { AgencyProject, AgencyClient, Workspace, WorkspaceRole } from "@/types/agency";

interface FrameProjectHubProps {
  workspace: Workspace;
  role: WorkspaceRole;
  initialProjects: AgencyProject[];
  clients: AgencyClient[];
}

// Preset Frame.io-inspired abstract gradients for project covers
const GRADIENT_PRESETS = [
  {
    id: "coral-peach",
    label: "Coral Peach (Frame.io)",
    style: "bg-gradient-to-br from-[#ff6b6b] via-[#ff8e72] to-[#ffaf7a]",
  },
  {
    id: "sunset-violet",
    label: "Sunset Violet",
    style: "bg-gradient-to-br from-[#6a11cb] via-[#8e2de2] to-[#f857a6]",
  },
  {
    id: "cyber-orbit",
    label: "Orbit Cyber Green",
    style: "bg-gradient-to-br from-[#102a16] via-[#1a4d25] to-[#3cff5f]",
  },
  {
    id: "electric-blue",
    label: "Electric Sapphire",
    style: "bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c6ff]",
  },
  {
    id: "midnight-gold",
    label: "Midnight Amber",
    style: "bg-gradient-to-br from-[#232526] via-[#414345] to-[#f39c12]",
  },
];

export function FrameProjectHub({
  workspace,
  role,
  initialProjects,
  clients,
}: FrameProjectHubProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<AgencyProject[]>(initialProjects);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [sortBy, setSortBy] = useState<"name" | "updated" | "created">("name");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Compute initials for the account badge (e.g. "SA" for Sonjoy's Account)
  const displayName = workspace.name || "Sonjoy's Account";
  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  // Filter & Sort Projects
  const filteredProjects = projects.filter((p) => {
    // Status filter
    if (filterStatus === "active") {
      if (p.status === "archived" || p.status === "delivered") return false;
    } else if (filterStatus === "review") {
      if (p.status !== "client_review" && p.status !== "internal_review") return false;
    } else if (filterStatus === "approved") {
      if (p.status !== "approved") return false;
    } else if (filterStatus === "archived") {
      if (p.status !== "archived") return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchClient = p.agency_clients?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }
    return true;
  });

  // Sort
  filteredProjects.sort((a, b) => {
    if (sortBy === "name") return a.title.localeCompare(b.title);
    if (sortBy === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setModalError("Please provide a project name.");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          title: title.trim(),
          description: description.trim(),
          clientId: selectedClientId || null,
          priority,
          coverUrl: selectedGradient, // storing preset gradient id
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");

      setProjects([data.project, ...projects]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setSelectedClientId("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradientClass = (coverUrl?: string | null) => {
    const found = GRADIENT_PRESETS.find((g) => g.id === coverUrl);
    return found ? found.style : GRADIENT_PRESETS[0].style;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Updated just now";
    if (hours < 24) return `Updated ${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Updated ${days}d ago`;
    const months = Math.floor(days / 30);
    return `Updated ${months}mo ago`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f15] text-[#e7eee9] overflow-y-auto">
      {/* ======================================================== */}
      {/* 1. WORKSPACE TITLE & ACTION BAR (Frame.io 1:1)           */}
      {/* ======================================================== */}
      <div className="px-6 sm:px-10 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181c28]">
        {/* Left: Account Avatar & Name */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5470] to-[#e63956] text-white font-black text-sm flex items-center justify-center shadow-lg shadow-[#ff5470]/25 border border-white/10 shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{displayName}</span>
              <span className="text-[10px] rounded-full bg-[#1b2234] border border-[#2b354d] px-2 py-0.5 font-mono text-[#4d6fff] uppercase tracking-wider">
                {workspace.plan_tier}
              </span>
            </h1>
            <p className="text-xs text-[#6e7b95] mt-0.5">
              {workspace.slug} · Creative Video Review Suite
            </p>
          </div>
        </div>

        {/* Right: Team Invite & + New Project Button */}
        <div className="flex items-center gap-2.5">
          {/* Team Invite Icon Button (Frame.io modal trigger) */}
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="h-9 w-9 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-[#212738] flex items-center justify-center text-[#8d9ab2] hover:text-white transition-all shadow-sm cursor-pointer"
            title="Add to Workspace"
          >
            <Users className="h-4 w-4" />
          </button>

          {/* + New Project Button (Frame.io signature blue pill) */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4d6fff] hover:bg-[#5f7eff] text-white font-bold px-4 py-2 text-xs transition-all shadow-lg shadow-[#4d6fff]/25 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>

          {/* More options */}
          <Link
            href="/dashboard/agency/storage"
            className="h-9 w-9 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-[#212738] flex items-center justify-center text-[#8d9ab2] hover:text-white transition-all shadow-sm"
            title="Workspace Settings & Storage"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTERS & VIEW MODE TOOLBAR                           */}
      {/* ======================================================== */}
      <div className="px-6 sm:px-10 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8d9ab2]">
        {/* Left: View Mode Toggle & Filter Dropdowns */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Grid / List Switcher */}
          <div className="flex items-center rounded-xl bg-[#141824] border border-[#212738] p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#252c40] text-white shadow-xs"
                  : "text-[#67748e] hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#252c40] text-white shadow-xs"
                  : "text-[#67748e] hover:text-white"
              }`}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-[#5e6b84]" />
            <span className="text-[#67748e]">Filtered by:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#141824] border border-[#212738] text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#4d6fff] cursor-pointer"
            >
              <option value="active">Active Projects</option>
              <option value="all">All Projects</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#5e6b84]" />
            <span className="text-[#67748e]">Sorted by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141824] border border-[#212738] text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#4d6fff] cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="updated">Recently Updated</option>
              <option value="created">Date Created</option>
            </select>
          </div>
        </div>

        {/* Right: Counter */}
        <div className="text-xs text-[#5e6b84]">
          <span>{filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROJECT CARDS CANVAS (Frame.io Grid 1:1)              */}
      {/* ======================================================== */}
      <div className="flex-1 px-6 sm:px-10 py-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* CARD 1: + New Project Blank Card (Frame.io signature) */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#1f2536] hover:border-[#4d6fff]/60 bg-[#11141e]/50 hover:bg-[#141824] p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group select-none shadow-sm"
            >
              <div className="h-12 w-12 rounded-full bg-[#181d2a] border border-[#262e42] flex items-center justify-center text-[#758195] group-hover:text-white group-hover:bg-[#4d6fff] group-hover:border-[#4d6fff] group-hover:scale-110 transition-all shadow-md">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#8d9ab2] group-hover:text-white transition-colors">
                New Project
              </span>
            </div>

            {/* Existing Project Cards */}
            {filteredProjects.map((project) => {
              const gradientClass = getGradientClass(project.cover_url);
              const clientName = project.agency_clients?.name || workspace.name;

              return (
                <div
                  key={project.id}
                  className="aspect-[3/4] rounded-2xl bg-[#141722] border border-[#1f2536] hover:border-[#3d4760] transition-all overflow-hidden flex flex-col group shadow-lg cursor-pointer relative"
                  onClick={() => router.push(`/dashboard/agency/projects/${project.id}`)}
                >
                  {/* Top Half: Cover Gradient / Poster */}
                  <div className={`h-[56%] w-full ${gradientClass} relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]`}>
                    {/* Status Badge Top Right */}
                    <div className="absolute top-3 right-3">
                      <span className="h-6 w-6 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        {project.status === "approved" ? "✓" : "⚡"}
                      </span>
                    </div>

                    {/* Subtle Overlay Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141722] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Bottom Half: Project Metadata */}
                  <div className="h-[44%] p-4 flex flex-col justify-between bg-[#141722] z-10">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#4d6fff] transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[#8c97ad] truncate mt-0.5">
                        {clientName}
                      </p>
                    </div>

                    {/* Card Footer: Time ago & Actions */}
                    <div className="flex items-center justify-between text-[11px] text-[#636e82] pt-2 border-t border-[#1c2232]">
                      <span>{formatTimeAgo(project.updated_at)}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/agency/projects/${project.id}`);
                        }}
                        className="p-1 rounded-md text-[#78859e] hover:text-white hover:bg-[#1e2434] transition-colors cursor-pointer"
                        title="Project Options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-[#1e2436] bg-[#141722] overflow-hidden">
            <table className="w-full text-left text-xs text-[#8d9ab2]">
              <thead className="bg-[#10131d] border-b border-[#1e2436] text-[11px] uppercase tracking-wider text-[#637089]">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2132]">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => router.push(`/dashboard/agency/projects/${project.id}`)}
                    className="hover:bg-[#181d2a] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg ${getGradientClass(project.cover_url)} shrink-0`} />
                        <span className="font-bold text-white">{project.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {project.agency_clients?.name || workspace.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-[#1b2234] border border-[#2b354d] px-2.5 py-0.5 text-[10px] font-semibold text-[#4d6fff] uppercase">
                        {project.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#636e82]">
                      {formatTimeAgo(project.updated_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/agency/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-[#4d6fff] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Open Studio</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: CREATE NEW PROJECT (Frame.io Style)            */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-[#637089] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#4d6fff]/15 border border-[#4d6fff]/30 flex items-center justify-center text-[#4d6fff]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create New Project</h3>
                <p className="text-xs text-[#78859e]">
                  Add a new client cut, music video, or commercial to your workspace
                </p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8d9ab2] mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mateperos, Nike Commercial V2..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#22293c] bg-[#171b28] px-4 py-2.5 text-xs text-white placeholder-[#505d76] focus:border-[#4d6fff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8d9ab2] mb-1.5">
                  Client (Optional)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-xl border border-[#22293c] bg-[#171b28] px-4 py-2.5 text-xs text-white focus:border-[#4d6fff] focus:outline-none"
                >
                  <option value="">No Client (Internal Studio Project)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8d9ab2] mb-1.5">
                  Card Cover Theme Gradient
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {GRADIENT_PRESETS.map((g) => (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setSelectedGradient(g.id)}
                      className={`h-12 rounded-xl ${g.style} border-2 transition-all cursor-pointer ${
                        selectedGradient === g.id
                          ? "border-white scale-105 shadow-md shadow-white/20"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1f2537]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#22293c] bg-[#171b28] text-xs font-bold text-[#8d9ab2] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#4d6fff] hover:bg-[#5f7eff] text-white text-xs font-black shadow-lg shadow-[#4d6fff]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: FRAME.IO TEAM INVITATION MODAL                 */}
      {/* ======================================================== */}
      <FrameInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspace={workspace}
        memberCount={1}
        suggestedUsers={
          clients.length > 0
            ? clients
                .filter((c) => Boolean(c.email))
                .slice(0, 3)
                .map((c) => ({ name: c.name, email: c.email! }))
            : [{ name: "Sonjoy Bairagee", email: "sonjoy.bairagee@gmail.com" }]
        }
      />
    </div>
  );
}

