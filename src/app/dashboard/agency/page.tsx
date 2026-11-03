import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { getWorkspaceProjects } from "@/lib/agency/project-service";
import { getWorkspaceClients } from "@/lib/agency/client-service";
import { FrameProjectHub } from "@/components/agency/FrameProjectHub";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardOverview() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let workspace: any = null;
  let role: any = "owner";
  let projects: any[] = [];
  let clients: any[] = [];

  try {
    const res = await getOrCreateDefaultWorkspace(
      user.id,
      user.email,
      user.user_metadata?.full_name
    );
    workspace = res.workspace;
    role = res.role;

    const [pList, cList] = await Promise.all([
      getWorkspaceProjects(workspace.id, { limit: 50 }).catch(() => []),
      getWorkspaceClients(workspace.id).catch(() => []),
    ]);
    projects = pList;
    clients = cList;
  } catch (err) {
    console.error("Dashboard overview load error:", err);
    return null;
  }

  if (!workspace) return null;

  return (
    <FrameProjectHub
      workspace={workspace}
      role={role}
      initialProjects={projects}
      clients={clients}
    />
  );
}
