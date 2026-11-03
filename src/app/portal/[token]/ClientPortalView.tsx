"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Film,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Building,
  Clock,
  Sparkles,
  Download,
} from "lucide-react";
import { VideoReviewPlayer } from "@/components/agency/VideoReviewPlayer";
import { AgencyClient, AgencyProject, AgencyVideoVersion } from "@/types/agency";

interface ClientPortalViewProps {
  client: AgencyClient;
  workspace: any;
  projects: AgencyProject[];
  initialVersions: AgencyVideoVersion[];
}

export function ClientPortalView({
  client,
  workspace,
  projects,
  initialVersions,
}: ClientPortalViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ""
  );
  const [versions, setVersions] = useState<AgencyVideoVersion[]>(initialVersions);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleApproveCut = async () => {
    if (!activeProject || !confirm("Are you sure you want to approve this video cut?")) return;
    setIsApproving(true);

    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace?.id,
          title: activeProject.title,
          status: "approved",
        }),
      });

      setStatusMessage("✓ Cut Approved! Our studio will now prepare final deliverables.");
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9]">
      {/* Client Portal Header */}
      <header className="border-b border-[#213026] bg-[#0c1510]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#3cff5f] to-[#168a35] flex items-center justify-center text-[#050a08] font-black shadow-md shadow-[#3cff5f]/25">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                <span>{workspace?.name || "Creative Agency"} Client Portal</span>
                <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                  SECURE
                </span>
              </h1>
              <p className="text-xs text-[#8da194]">
                Welcome, <strong className="text-[#e7eee9]">{client.name}</strong> ({client.company || "VIP Client"})
              </p>
            </div>
          </div>

          {/* Quick Approval CTA */}
          {activeProject && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApproveCut}
                disabled={isApproving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Video Cut</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {statusMessage && (
          <div className="rounded-2xl bg-[#102a16] border border-[#2a5234] p-4 text-xs font-bold text-[#3cff5f] flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Project Switcher if client has multiple projects */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-[#8da194] shrink-0">Your Projects:</span>
            {projects.map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedProjectId === proj.id
                    ? "bg-[#3cff5f] text-[#050a08]"
                    : "bg-[#0c1510] border border-[#213026] text-[#8da194] hover:text-[#e7eee9]"
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        )}

        {/* Active Project Title Banner */}
        {activeProject ? (
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8da194]">
                <Building className="h-3.5 w-3.5 text-[#3cff5f]" />
                <span>{client.company || client.name} Production Pipeline</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#e7eee9] mt-1">
                {activeProject.title}
              </h2>
              {activeProject.description && (
                <p className="text-xs text-[#8da194] mt-1 max-w-2xl">
                  {activeProject.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeProject.status === "approved"
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {activeProject.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/50 p-12 text-center">
            <h3 className="text-sm font-bold text-[#e7eee9]">No active projects assigned yet</h3>
            <p className="text-xs text-[#8da194] mt-1">
              Your agency has not yet linked a video project to this portal. Please check back shortly!
            </p>
          </div>
        )}

        {/* Video Review Player */}
        {activeProject && (
          <VideoReviewPlayer
            projectId={activeProject.id}
            versions={versions}
            isClientView={true}
          />
        )}
      </main>
    </div>
  );
}
