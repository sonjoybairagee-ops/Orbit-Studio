import { createClient } from "@/lib/supabase/server";
import { AgencyClient, ClientStatus } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";

export async function getWorkspaceClients(workspaceId: string): Promise<AgencyClient[]> {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("agency_clients")
    .select(`
      *,
      agency_projects ( id )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return (clients || []).map((c: any) => ({
    ...c,
    project_count: c.agency_projects ? c.agency_projects.length : 0,
  }));
}

export async function createClientRecord({
  workspaceId,
  name,
  company,
  email,
  phone,
  notes,
  status = "active",
  actorId,
  actorName,
}: {
  workspaceId: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: ClientStatus;
  actorId?: string;
  actorName?: string;
}): Promise<AgencyClient> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agency_clients")
    .insert({
      workspace_id: workspaceId,
      name: name.trim(),
      company: company?.trim() || "",
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      notes: notes?.trim() || "",
      status,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create client.");
  }

  await logAgencyActivity({
    workspaceId,
    actorId,
    actorName: actorName || "Creator",
    action: "client.created",
    resourceType: "client",
    resourceId: data.id,
    details: { name: data.name, company: data.company },
  });

  return data as AgencyClient;
}

