import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProjectVersionsWithComments } from "@/lib/agency/review-service";
import { VideoReviewPlayer } from "@/components/agency/VideoReviewPlayer";
import { ProjectDetailsClientView } from "./ProjectDetailsClientView";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const adminClient = createAdminClient();

  // Fetch project details
  const { data: project, error: projErr } = await adminClient
    .from("agency_projects")
    .select(`
      *,
      agency_clients ( id, name, company, email, phone, portal_token ),
      agency_project_files (
        id,
        file_name,
        r2_key,
        file_size_bytes,
        mime_type,
        category,
        created_at
      )
    `)
    .eq("id", params.projectId)
    .single();

  if (projErr || !project) {
    notFound();
  }

  // Fetch versions with comments
  const versions = await getProjectVersionsWithComments(params.projectId);

  return (
    <ProjectDetailsClientView
      project={project}
      versions={versions}
      files={project.agency_project_files || []}
      user={user}
    />
  );
}

