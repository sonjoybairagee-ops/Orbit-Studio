import { createAdminClient } from "@/lib/supabase/admin";

export async function logAgencyActivity({
  workspaceId,
  projectId,
  actorId,
  actorName,
  action,
  resourceType,
  resourceId,
  details = {},
}: {
  workspaceId: string;
  projectId?: string | null;
  actorId?: string | null;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, any>;
}) {
  try {
    const adminClient = createAdminClient();
    await adminClient.from("agency_activity_logs").insert({
      workspace_id: workspaceId,
      project_id: projectId || null,
      actor_id: actorId || null,
      actor_name: actorName,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details,
    });
  } catch (err) {
    console.error("Failed to log agency activity:", err);
  }
}

