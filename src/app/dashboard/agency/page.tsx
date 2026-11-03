import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { getWorkspaceProjects } from "@/lib/agency/project-service";
import { getWorkspaceClients } from "@/lib/agency/client-service";
import { createClient } from "@/lib/supabase/server";
import {
  FolderKanban,
  Users,
  Film,
  HardDrive,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardOverview() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let workspace: any = null;
  let role: any = "owner";
  let projects: any[] = [];
  let clients: any[] = [];
  let activityRows: any[] = [];

  try {
    const res = await getOrCreateDefaultWorkspace(
      user.id,
      user.email,
      user.user_metadata?.full_name
    );
    workspace = res.workspace;
    role = res.role;

    const [pList, cList] = await Promise.all([
      getWorkspaceProjects(workspace.id, { limit: 6 }).catch(() => []),
      getWorkspaceClients(workspace.id).catch(() => []),
    ]);
    projects = pList;
    clients = cList;

    const supabase = await createClient();
    const { data: act } = await supabase
      .from("agency_activity_logs")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(8);
    activityRows = act || [];
  } catch (err) {
    console.error("Dashboard overview load error:", err);
    return null;
  }

  if (!workspace) return null;

  const activeProjectsCount = projects.filter((p) => p.status !== "delivered" && p.status !== "archived").length;
  const pendingReviewsCount = projects.filter((p) => p.status === "client_review" || p.status === "internal_review").length;
  const usedMB = (workspace.storage_used_bytes / (1024 * 1024)).toFixed(0);
  const totalGB = (workspace.storage_quota_bytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#213026] bg-gradient-to-r from-[#0c1510] via-[#08120c] to-[#0c1510] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#3cff5f]/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] font-mono text-[#3cff5f]">
                WORKSPACE: {workspace.name.toUpperCase()}
              </span>
              <span className="text-xs text-[#8da194]">· Role: {role}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[#e7eee9]">
              Agency Production Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#8da194] max-w-xl">
              Manage client video deliveries, share frame-accurate review players, collect timestamp comments, and deliver final approved renders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/agency/projects"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-lg shadow-[#3cff5f]/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Project</span>
            </Link>
            <Link
              href="/dashboard/agency/clients"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#213026] bg-[#080e0b] px-4 py-3 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:border-[#3cff5f]/40 transition-all cursor-pointer"
            >
              <Users className="h-4 w-4 text-[#3cff5f]" />
              <span>Add Client</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8da194]">Active Projects</p>
            <h3 className="text-2xl font-black text-[#e7eee9] mt-1">{activeProjectsCount}</h3>
            <p className="text-[11px] text-[#62776a] mt-0.5">{projects.length} total lifetime</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
            <FolderKanban className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Clients Managed */}
        <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8da194]">Clients Managed</p>
            <h3 className="text-2xl font-black text-[#e7eee9] mt-1">{clients.length}</h3>
            <p className="text-[11px] text-[#62776a] mt-0.5">Active client CRM profiles</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8da194]">Pending Reviews</p>
            <h3 className="text-2xl font-black text-[#e7eee9] mt-1">{pendingReviewsCount}</h3>
            <p className="text-[11px] text-[#3cff5f] mt-0.5">Awaiting feedback / approval</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
            <Film className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Cloudflare R2 Storage */}
        <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8da194]">Cloud Storage</p>
            <h3 className="text-2xl font-black text-[#e7eee9] mt-1">{usedMB} MB</h3>
            <p className="text-[11px] text-[#62776a] mt-0.5">of {totalGB} GB ({workspace.plan_tier})</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
            <HardDrive className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Recent Projects & Quick Client CRM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Video Projects */}
        <div className="lg:col-span-2 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-[#3cff5f]" />
                <span>Recent Projects</span>
              </h2>
              <p className="text-xs text-[#8da194] mt-0.5">
                Current editing timelines, versions, and review workflows
              </p>
            </div>
            <Link
              href="/dashboard/agency/projects"
              className="text-xs font-bold text-[#3cff5f] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#213026] p-8 text-center bg-[#080e0b]/50">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-xl text-[#3cff5f]">
                🎬
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">No projects yet</h3>
              <p className="text-xs text-[#8da194] max-w-xs mx-auto mt-1">
                Create your first video editing or animation project to start tracking versions and client reviews.
              </p>
              <Link
                href="/dashboard/agency/projects"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 hover:border-[#3cff5f]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] shrink-0">
                      <FileVideo className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#e7eee9] truncate">
                        {proj.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#8da194]">
                        {proj.agency_clients ? (
                          <span className="text-[#3cff5f] font-medium">
                            {proj.agency_clients.name} ({proj.agency_clients.company || "Client"})
                          </span>
                        ) : (
                          <span>Internal Project</span>
                        )}
                        <span>•</span>
                        <span>{proj.version_count} versions</span>
                        {proj.deadline && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-mono">
                              Due {new Date(proj.deadline).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === "approved" || proj.status === "delivered"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : proj.status === "client_review"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                      }`}
                    >
                      {proj.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/dashboard/agency/projects`}
                      className="rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-1.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:border-[#3cff5f]/50 transition-all"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Clients & Activity Feed */}
        <div className="space-y-6">
          {/* Quick Client CRM Widget */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3cff5f]" />
                <span>Client Roster</span>
              </h2>
              <Link
                href="/dashboard/agency/clients"
                className="text-xs font-bold text-[#3cff5f] hover:underline"
              >
                + Add
              </Link>
            </div>

            {clients.length === 0 ? (
              <p className="text-xs text-[#8da194] text-center py-4">
                No clients added yet. Add clients to assign projects and generate private review links.
              </p>
            ) : (
              <div className="space-y-2.5">
                {clients.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#213026] bg-[#080e0b]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#e7eee9] truncate">{c.name}</p>
                      <p className="text-[10px] text-[#8da194] truncate">
                        {c.company || c.email || "Individual"}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-full">
                      {c.project_count || 0} projects
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed Widget */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3cff5f]" />
              <span>Audit Activity Log</span>
            </h2>

            {(!activityRows || activityRows.length === 0) ? (
              <p className="text-xs text-[#62776a] py-3 text-center">
                Workspace audit log is clean. Actions will appear here in real-time.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {activityRows.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="border-l-2 border-[#2a5234] pl-2.5 py-1">
                    <p className="text-[#e7eee9] font-medium leading-tight">
                      <strong className="text-[#3cff5f]">{log.actor_name}</strong> {log.action.replace(".", " ")}
                    </p>
                    <span className="text-[10px] text-[#62776a] font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

