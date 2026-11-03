import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Workspace, WorkspaceMember, WorkspaceRole } from "@/types/agency";

/**
 * Get all workspaces the authenticated user belongs to.
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);

  const workspaceIds = (memberRows || []).map((m: any) => m.workspace_id);

  if (workspaceIds.length === 0) {
    // Check if user is owner of any workspace directly
    const { data: ownedWorkspaces } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", userId);

    if (ownedWorkspaces && ownedWorkspaces.length > 0) {
      return ownedWorkspaces as Workspace[];
    }
    return [];
  }

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)
    .order("created_at", { ascending: true });

  return (workspaces || []) as Workspace[];
}

/**
 * Get or automatically create the user's default workspace.
 * Ensures every authenticated user seamlessly has an Agency OS workspace ready on first visit.
 */
export async function getOrCreateDefaultWorkspace(
  userId: string,
  userEmail?: string | null,
  fullName?: string | null
): Promise<{ workspace: Workspace; role: WorkspaceRole }> {
  const existing = await getUserWorkspaces(userId);
  if (existing.length > 0) {
    return { workspace: existing[0], role: "owner" };
  }

  // Auto-provision initial workspace
  const adminClient = createAdminClient();
  const baseName = fullName || (userEmail ? userEmail.split("@")[0] : "Orbit Studio");
  const workspaceName = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Creative`;
  const cleanSlug = `${baseName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: createdWs, error: wsErr } = await adminClient
    .from("workspaces")
    .insert({
      owner_id: userId,
      name: workspaceName,
      slug: cleanSlug,
      plan_tier: "free",
      storage_quota_bytes: 2147483648, // 2 GB
      storage_used_bytes: 0,
      settings: {
        currency: "USD",
        brandColor: "#3cff5f",
      },
    })
    .select("*")
    .single();

  if (wsErr || !createdWs) {
    throw new Error(`Failed to initialize default workspace: ${wsErr?.message || "Unknown error"}`);
  }

  // Insert membership as owner
  await adminClient.from("workspace_members").insert({
    workspace_id: createdWs.id,
    user_id: userId,
    role: "owner",
  });

  // Log activity
  await adminClient.from("agency_activity_logs").insert({
    workspace_id: createdWs.id,
    actor_id: userId,
    actor_name: fullName || userEmail || "Agency Creator",
    action: "workspace.initialized",
    resource_type: "workspace",
    resource_id: createdWs.id,
    details: { name: workspaceName, tier: "free" },
  });

  return { workspace: createdWs as Workspace, role: "owner" };
}

/**
 * Check membership and role of a user in a specific workspace.
 */
export async function getWorkspaceMemberRole(
  workspaceId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  return (data?.role as WorkspaceRole) || null;
}

