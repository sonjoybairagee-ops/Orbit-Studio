import { createClient } from "@/lib/supabase/server";
import { AgencyProject, ProjectPriority, ProjectStatus } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";

export async function getWorkspaceProjects(
  workspaceId: string,
  options?: {
    clientId?: string;
    status?: string;
    limit?: number;
  }
): Promise<AgencyProject[]> {
  const supabase = await createClient();
  let query = supabase
    .from("agency_projects")
    .select(`
      *,
      agency_clients ( id, name, company ),
      agency_project_files ( id ),
      agency_video_versions ( id ),
      agency_video_comments ( id, is_resolved )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (options?.clientId) {
    query = query.eq("client_id", options.clientId);
  }
  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: projects, error } = await query;
  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return (projects || []).map((p: any) => ({
    ...p,
    file_count: p.agency_project_files?.length || 0,
    version_count: p.agency_video_versions?.length || 0,
    unresolved_comment_count: (p.agency_video_comments || []).filter((c: any) => !c.is_resolved).length,
  }));
}

export async function createProjectRecord({
  workspaceId,
  clientId,
  title,
  description = "",
  status = "in_progress",
  priority = "medium",
  deadline,
  budget,
  actorId,
  actorName,
}: {
  workspaceId: string;
  clientId?: string | null;
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  deadline?: string | null;
  budget?: number | null;
  actorId?: string;
  actorName?: string;
}): Promise<AgencyProject> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agency_projects")
    .insert({
      workspace_id: workspaceId,
      client_id: clientId || null,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      deadline: deadline || null,
      budget: budget || 0,
      created_by: actorId || null,
    })
    .select(`
      *,
      agency_clients ( id, name, company )
    `)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create project.");
  }

  await logAgencyActivity({
    workspaceId,
    projectId: data.id,
    actorId,
    actorName: actorName || "Creator",
    action: "project.created",
    resourceType: "project",
    resourceId: data.id,
    details: { title: data.title, status: data.status, priority: data.priority },
  });

  return data as AgencyProject;
}

