import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { createProjectRecord, getWorkspaceProjects } from "@/lib/agency/project-service";
import { AGENCY_PLANS } from "@/lib/agency/pricing-config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const wsId = searchParams.get("workspaceId");
    const clientId = searchParams.get("clientId") || undefined;
    const status = searchParams.get("status") || undefined;

    let targetWorkspaceId = wsId;
    if (!targetWorkspaceId) {
      const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
      targetWorkspaceId = workspace.id;
    }

    const projects = await getWorkspaceProjects(targetWorkspaceId, {
      clientId,
      status,
    });
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, clientId, title, description, status, priority, deadline, budget } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Project title is required." }, { status: 400 });
    }

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
      targetWorkspaceId = workspace.id;
    }

    // Enforce Active Project Limits based on Plan Tier
    const adminClient = createAdminClient();
    const { data: wsRow } = await adminClient
      .from("workspaces")
      .select("plan_tier")
      .eq("id", targetWorkspaceId)
      .single();

    const planTier = (wsRow?.plan_tier || "free") as keyof typeof AGENCY_PLANS;
    const planConfig = AGENCY_PLANS[planTier] || AGENCY_PLANS.free;

    if (planConfig.activeProjectsLimit > 0) {
      const { count: activeCount } = await adminClient
        .from("agency_projects")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", targetWorkspaceId)
        .neq("status", "archived")
        .neq("status", "delivered");

      if ((activeCount || 0) >= planConfig.activeProjectsLimit) {
        return NextResponse.json(
          {
            error: `Your ${planConfig.name} plan is limited to ${planConfig.activeProjectsLimit} active projects. Upgrade to Starter ($9/mo) for 10 projects or Pro ($19/mo) for unlimited projects.`,
          },
          { status: 403 }
        );
      }
    }

    const project = await createProjectRecord({
      workspaceId: targetWorkspaceId,
      clientId,
      title,
      description,
      status,
      priority,
      deadline,
      budget,
      actorId: user.id,
      actorName: user.user_metadata?.full_name || user.email || "Agency Creator",
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}

