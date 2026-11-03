import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProjectVersionsWithComments } from "@/lib/agency/review-service";
import { ClientPortalView } from "./ClientPortalView";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
}: {
  params: { token: string };
}) {
  const adminClient = createAdminClient();

  // Find client by portal_token
  const { data: client, error: cliErr } = await adminClient
    .from("agency_clients")
    .select(`
      *,
      workspaces ( id, name, logo_url, settings )
    `)
    .eq("portal_token", params.token)
    .single();

  if (cliErr || !client) {
    notFound();
  }

  // Fetch all projects for this client
  const { data: projects } = await adminClient
    .from("agency_projects")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  // For the active project, load versions and comments
  const activeProject = projects && projects.length > 0 ? projects[0] : null;
  const versions = activeProject
    ? await getProjectVersionsWithComments(activeProject.id)
    : [];

  return (
    <ClientPortalView
      client={client}
      workspace={(client as any).workspaces}
      projects={projects || []}
      initialVersions={versions}
    />
  );
}
