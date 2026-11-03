import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace, getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { getWorkspaceMembers, getWorkspaceInvitations } from "@/lib/agency/team-service";
import { TeamManagerView } from "./TeamManagerView";

export const dynamic = "force-dynamic";

export default async function AgencyTeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace, role } = await getOrCreateDefaultWorkspace(user.id, user.email);

  const [members, invitations] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getWorkspaceInvitations(workspace.id),
  ]);

  return (
    <TeamManagerView
      workspace={workspace}
      initialMembers={members}
      initialInvitations={invitations}
      currentUserRole={role}
      currentUserId={user.id}
    />
  );
}
