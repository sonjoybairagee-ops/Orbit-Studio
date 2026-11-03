import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AgencyVideoVersion, AgencyVideoComment, VersionStatus } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";

/**
 * Fetch all video versions and associated timestamp comments for a project.
 */
export async function getProjectVersionsWithComments(
  projectId: string
): Promise<AgencyVideoVersion[]> {
  const adminClient = createAdminClient();

  const { data: versions, error } = await adminClient
    .from("agency_video_versions")
    .select(`
      *,
      comments:agency_video_comments (
        id,
        version_id,
        project_id,
        author_id,
        author_name,
        author_email,
        timestamp_seconds,
        comment_text,
        is_resolved,
        resolved_at,
        created_at,
        updated_at
      )
    `)
    .eq("project_id", projectId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("Error fetching video versions:", error);
    return [];
  }

  return (versions || []).map((v: any) => ({
    ...v,
    comments: (v.comments || []).sort(
      (a: AgencyVideoComment, b: AgencyVideoComment) => a.timestamp_seconds - b.timestamp_seconds
    ),
  }));
}

/**
 * Add a timestamp-accurate comment on a video version.
 */
export async function addVideoComment({
  versionId,
  projectId,
  authorId,
  authorName,
  authorEmail,
  timestampSeconds,
  commentText,
  parentId,
}: {
  versionId: string;
  projectId: string;
  authorId?: string | null;
  authorName: string;
  authorEmail?: string | null;
  timestampSeconds: number;
  commentText: string;
  parentId?: string | null;
}): Promise<AgencyVideoComment> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("agency_video_comments")
    .insert({
      version_id: versionId,
      project_id: projectId,
      author_id: authorId || null,
      author_name: authorName,
      author_email: authorEmail || null,
      timestamp_seconds: Math.max(0, Number(timestampSeconds.toFixed(2))),
      comment_text: commentText.trim(),
      parent_id: parentId || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to add comment.");
  }

  // Get project workspace to log activity
  const { data: proj } = await adminClient
    .from("agency_projects")
    .select("workspace_id")
    .eq("id", projectId)
    .single();

  if (proj?.workspace_id) {
    await logAgencyActivity({
      workspaceId: proj.workspace_id,
      projectId,
      actorId: authorId || null,
      actorName: authorName,
      action: "comment.added",
      resourceType: "comment",
      resourceId: data.id,
      details: { timestamp: timestampSeconds, comment: commentText.slice(0, 50) },
    });
  }

  return data as AgencyVideoComment;
}

/**
 * Toggle resolved state of a comment.
 */
export async function toggleCommentResolved(
  commentId: string,
  isResolved: boolean,
  resolvedBy?: string
) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("agency_video_comments")
    .update({
      is_resolved: isResolved,
      resolved_by: isResolved ? resolvedBy || null : null,
      resolved_at: isResolved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update comment status.");
  }

  return data as AgencyVideoComment;
}

/**
 * Create a new video version cut for a project (e.g. v1, v2).
 */
export async function createProjectVersion({
  projectId,
  versionLabel,
  videoUrl,
  videoFileId,
  durationSeconds = 0,
  changelog = "",
  createdBy,
}: {
  projectId: string;
  versionLabel: string;
  videoUrl: string;
  videoFileId?: string | null;
  durationSeconds?: number;
  changelog?: string;
  createdBy?: string;
}): Promise<AgencyVideoVersion> {
  const adminClient = createAdminClient();

  // Find latest version number
  const { data: latest } = await adminClient
    .from("agency_video_versions")
    .select("version_number")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextNumber = latest && latest.length > 0 ? (latest[0].version_number || 0) + 1 : 1;

  const { data, error } = await adminClient
    .from("agency_video_versions")
    .insert({
      project_id: projectId,
      version_label: versionLabel || `v${nextNumber}`,
      version_number: nextNumber,
      video_url: videoUrl,
      video_file_id: videoFileId || null,
      duration_seconds: durationSeconds,
      status: "review_ready",
      changelog,
      created_by: createdBy || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create video version.");
  }

  // Update project status to client_review
  await adminClient
    .from("agency_projects")
    .update({ status: "client_review", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  return data as AgencyVideoVersion;
}
