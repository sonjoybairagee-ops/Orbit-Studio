import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { getWorkspaceProjects } from "@/lib/agency/project-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { AgencyFileManagerClientView } from "./AgencyFileManagerClientView";
import { AgencyProjectFile } from "@/types/agency";

export const dynamic = "force-dynamic";

export default async function AgencyFilesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);

  const adminClient = createAdminClient();

  // Fetch workspace projects for upload destination selection
  const projects = await getWorkspaceProjects(workspace.id, { limit: 100 }).catch(() => []);

  // Fetch all existing files for this workspace
  const { data: fileRows } = await adminClient
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
      created_at
    `)
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const files = (fileRows || []) as AgencyProjectFile[];

  return (
    <AgencyFileManagerClientView
      workspace={workspace}
      initialProjects={projects}
      initialFiles={files}
    />
  );
}
