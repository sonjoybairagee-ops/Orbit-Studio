import Link from "next/link";
import { Film, Play, MessageSquare, CheckCircle2, Clock, Plus, ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { getWorkspaceProjects } from "@/lib/agency/project-service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgencyReviewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
  const projects = await getWorkspaceProjects(workspace.id);

  const reviewReadyProjects = projects.filter(
    (p) => p.status === "client_review" || p.status === "internal_review" || p.status === "revision_required"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <Film className="h-6 w-6 text-[#3cff5f]" />
            <span>Video Review &amp; Client Feedback Hub</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Frame-accurate video playback, timestamp comments, client approvals, and version-by-version review histories.
          </p>
        </div>

        <Link
          href="/dashboard/agency/projects"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Video Cut</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/50 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] text-xl">
            🎬
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">No video cuts awaiting review</h3>
          <p className="text-xs text-[#8da194] max-w-sm mx-auto mt-1">
            Create a project and upload your first video cut or MP4 render to start collecting client timestamp comments.
          </p>
          <Link
            href="/dashboard/agency/projects"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Go to Projects</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#3cff5f]/50 transition-all"
              >
                <div>
                  <div className="relative aspect-video rounded-2xl bg-[#080e0b] border border-[#1b2720] flex items-center justify-center overflow-hidden group">
                    <div className="h-12 w-12 rounded-full bg-[#3cff5f] text-[#050a08] flex items-center justify-center shadow-lg shadow-[#3cff5f]/30 group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-[#050a08] ml-0.5" />
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 bg-black/80 font-mono text-[10px] text-[#3cff5f] px-2 py-0.5 rounded-md border border-[#213026]">
                      v1.0 Ready
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#e7eee9] line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#8da194] mt-0.5">
                    {proj.agency_clients ? proj.agency_clients.name : "Internal Production"}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1b2720] flex items-center justify-between">
                  <span className="text-xs text-[#8da194] flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                    <span>{proj.unresolved_comment_count || 0} remarks</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
                    {proj.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

