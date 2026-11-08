import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";

/**
 * List files in an Agency OS workspace with optional filters (category, project, search).
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    let queryBuilder = adminClient
      .from("agency_project_files")
      .select(`
        id,
        workspace_id,
        project_id,
        file_name,
        r2_key,
        file_size_bytes,
        mime_type,
        category,
        created_at,
        agency_projects ( id, title )
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (projectId) {
      queryBuilder = queryBuilder.eq("project_id", projectId);
    }
    if (category && category !== "all") {
      queryBuilder = queryBuilder.eq("category", category);
    }
    if (query && query.trim()) {
      queryBuilder = queryBuilder.ilike("file_name", `%${query.trim()}%`);
    }

    const { data: files, error: fetchErr } = await queryBuilder.limit(100);

    if (fetchErr) {
      throw new Error(fetchErr.message || "Failed to load files.");
    }

    return NextResponse.json({
      success: true,
      files: files || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

