"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Film,
  FileVideo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  MessageSquare,
  Users,
  Building,
} from "lucide-react";
import { AgencyProject, AgencyClient, ProjectStatus, ProjectPriority } from "@/types/agency";

const STATUS_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "in_progress", label: "In Progress" },
  { id: "client_review", label: "Client Review" },
  { id: "revision_required", label: "Revision Required" },
  { id: "approved", label: "Approved" },
  { id: "delivered", label: "Delivered" },
];

export default function AgencyProjectsPage() {
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Create Project Form
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    description: "",
    status: "in_progress" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    deadline: "",
    budget: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [projRes, cliRes] = await Promise.all([
        fetch("/api/agency/projects"),
        fetch("/api/agency/clients"),
      ]);
      const projData = await projRes.json();
      const cliData = await cliRes.json();

      if (projRes.ok && projData.projects) setProjects(projData.projects);
      if (cliRes.ok && cliData.clients) setClients(cliData.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          clientId: formData.clientId || null,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          budget: formData.budget ? Number(formData.budget) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project.");
      }

      setProjects([data.project, ...projects]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        clientId: "",
        description: "",
        status: "in_progress",
        priority: "medium",
        deadline: "",
        budget: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.agency_clients && p.agency_clients.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusTab === "all" || p.status === statusTab;
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-[#3cff5f]" />
            <span>Project Production Hub</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Organize video deliverables, manage version iterations, track revision requests, and assign client reviewers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Video Project</span>
        </button>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#213026] pb-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusTab === tab.id
                ? "bg-[#102a16] border border-[#3cff5f] text-[#3cff5f] shadow-sm shadow-[#3cff5f]/15"
                : "text-[#8da194] hover:text-[#e7eee9] hover:bg-[#0c1510]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62776a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or client..."
            className="w-full rounded-xl border border-[#213026] bg-[#080e0b] pl-10 pr-3 py-2 text-xs text-[#e7eee9] placeholder-[#62776a] focus:border-[#3cff5f] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#8da194] shrink-0 font-semibold">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#3cff5f] animate-spin mb-3" />
          <p className="text-xs text-[#8da194]">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/50 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] text-xl">
            🎬
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">
            {searchQuery ? "No matching projects found" : "No projects in this category"}
          </h3>
          <p className="text-xs text-[#8da194] max-w-sm mx-auto mt-1">
            Create a new video editing project, assign a client, and begin uploading previews and collecting timestamp notes.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl hover:border-[#3cff5f]/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === "approved" || project.status === "delivered"
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : project.status === "client_review"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : project.status === "revision_required"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                    }`}
                  >
                    {project.status.replace("_", " ")}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md ${
                      project.priority === "urgent"
                        ? "bg-red-950/60 text-red-400 border border-red-800/50"
                        : project.priority === "high"
                        ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                        : "bg-[#15231c] text-[#8da194] border border-[#213026]"
                    }`}
                  >
                    {project.priority} priority
                  </span>
                </div>

                {/* Project Title & Client */}
                <h3 className="mt-3 text-base font-bold text-[#e7eee9] group-hover:text-[#3cff5f] transition-colors leading-snug line-clamp-1">
                  {project.title}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8da194]">
                  <Building className="h-3.5 w-3.5 text-[#62776a] shrink-0" />
                  <span className="truncate">
                    {project.agency_clients
                      ? `${project.agency_clients.name} (${project.agency_clients.company || "Client"})`
                      : "Internal Agency Project"}
                  </span>
                </div>

                {project.description && (
                  <p className="mt-2 text-xs text-[#62776a] line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Metrics bar */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-[#1b2720] text-xs text-[#8da194]">
                  <div className="flex items-center gap-1.5">
                    <FileVideo className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>{project.version_count || 0} Versions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                    <span>{project.unresolved_comment_count || 0} Comments</span>
                  </div>
                </div>
              </div>

              {/* Bottom footer: Deadline & Open buttons */}
              <div className="pt-3 border-t border-[#1b2720] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8da194]">
                  <Calendar className="h-3.5 w-3.5 text-[#62776a]" />
                  {project.deadline ? (
                    <span className="font-mono text-amber-400">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No deadline set</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/agency/reviews`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#102a16] border border-[#2a5234] hover:bg-[#183d21] text-xs font-bold text-[#3cff5f] transition-all cursor-pointer"
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Review</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[#8da194] hover:text-[#e7eee9] p-1.5 rounded-lg hover:bg-[#102a16] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#3cff5f]" />
              <span>Create Video Production Project</span>
            </h2>
            <p className="text-xs text-[#8da194] mt-1 mb-4">
              Initialize a project to begin uploading video cuts, collaborating, and collecting timestamp remarks.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Nike Commercial 30s Cut, Brand Teaser 4K"
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Assign Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                  >
                    <option value="">Internal / No Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Project Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Budget ($ USD, Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Creative Brief / Project Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Aspect ratio, target platforms (Reels, YouTube, TV), mood, color palettes, sound design guidelines..."
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2720]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8da194] hover:text-[#e7eee9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
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

