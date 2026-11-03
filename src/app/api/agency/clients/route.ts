import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { createClientRecord, getWorkspaceClients } from "@/lib/agency/client-service";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const wsId = searchParams.get("workspaceId");

    let targetWorkspaceId = wsId;
    if (!targetWorkspaceId) {
      const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
      targetWorkspaceId = workspace.id;
    }

    const clients = await getWorkspaceClients(targetWorkspaceId);
    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, name, company, email, phone, notes, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    }

    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
      targetWorkspaceId = workspace.id;
    }

    const client = await createClientRecord({
      workspaceId: targetWorkspaceId,
      name,
      company,
      email,
      phone,
      notes,
      status,
      actorId: user.id,
      actorName: user.user_metadata?.full_name || user.email || "Agency Creator",
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create client" }, { status: 500 });
  }
}

