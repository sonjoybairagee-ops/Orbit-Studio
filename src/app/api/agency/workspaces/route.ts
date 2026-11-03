import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace, getUserWorkspaces } from "@/lib/agency/workspace-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspace, role } = await getOrCreateDefaultWorkspace(
      user.id,
      user.email,
      user.user_metadata?.full_name
    );
    const allWorkspaces = await getUserWorkspaces(user.id);

    return NextResponse.json({
      activeWorkspace: workspace,
      role,
      workspaces: allWorkspaces,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Workspace name must be at least 2 characters." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const cleanSlug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: ws, error: wsErr } = await adminClient
      .from("workspaces")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        slug: cleanSlug,
        plan_tier: "free",
        storage_quota_bytes: 2147483648, // 2 GB
        storage_used_bytes: 0,
      })
      .select("*")
      .single();

    if (wsErr || !ws) {
      return NextResponse.json({ error: wsErr?.message || "Failed to create workspace" }, { status: 400 });
    }

    await adminClient.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ workspace: ws });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

