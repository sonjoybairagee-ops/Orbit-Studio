import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getWorkspaceMembers,
  getWorkspaceInvitations,
  createWorkspaceInvitation,
  removeWorkspaceMember,
  updateMemberRole,
} from "@/lib/agency/team-service";
import { getOrCreateDefaultWorkspace, getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { canManageMembers } from "@/lib/agency/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    let workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);
      workspaceId = workspace.id;
    }

    const [members, invitations] = await Promise.all([
      getWorkspaceMembers(workspaceId),
      getWorkspaceInvitations(workspaceId),
    ]);

    return NextResponse.json({ members, invitations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, email, role } = body;

    if (!workspaceId || !email || !role) {
      return NextResponse.json({ error: "workspaceId, email, and role are required." }, { status: 400 });
    }

    // Check caller permission
    const callerRole = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!callerRole || !canManageMembers(callerRole)) {
      return NextResponse.json({ error: "Only workspace owners and admins can invite members." }, { status: 403 });
    }

    const invitation = await createWorkspaceInvitation({
      workspaceId,
      email,
      role,
      invitedBy: user.id,
      inviterName: user.user_metadata?.full_name || user.email || "Agency Admin",
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create invitation" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, memberId, newRole } = body;

    if (!workspaceId || !memberId || !newRole) {
      return NextResponse.json({ error: "workspaceId, memberId, and newRole are required." }, { status: 400 });
    }

    const callerRole = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!callerRole || !canManageMembers(callerRole)) {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    const updated = await updateMemberRole({
      workspaceId,
      memberId,
      newRole,
    });

    return NextResponse.json({ member: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update member role" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const memberId = searchParams.get("memberId");
    const invitationId = searchParams.get("invitationId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const callerRole = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!callerRole || !canManageMembers(callerRole)) {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    if (memberId) {
      await removeWorkspaceMember({ workspaceId, memberId });
      return NextResponse.json({ success: true, removed: "member" });
    }

    if (invitationId) {
      const adminClient = createAdminClient();
      await adminClient.from("workspace_invitations").delete().eq("id", invitationId).eq("workspace_id", workspaceId);
      return NextResponse.json({ success: true, removed: "invitation" });
    }

    return NextResponse.json({ error: "Specify either memberId or invitationId." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove item" }, { status: 500 });
  }
}

