import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { createProjectRecord, getWorkspaceProjects } from "@/lib/agency/project-service";

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

