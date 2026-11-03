import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceMember, WorkspaceRole } from "@/types/agency";
import { logAgencyActivity } from "./activity-logger";
import { resend } from "@/lib/resend";

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by?: string | null;
  expires_at: string;
  created_at: string;
}

/**
 * Fetch all active members of a workspace.
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const adminClient = createAdminClient();
  const { data: members, error } = await adminClient
    .from("workspace_members")
    .select(`
      id,
      workspace_id,
      user_id,
      role,
      joined_at,
      profiles (
        id,
        email,
        full_name,
        role
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching workspace members:", error);
    return [];
  }

  return (members || []) as unknown as WorkspaceMember[];
}

/**
 * Fetch pending invitations for a workspace.
 */
export async function getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  const adminClient = createAdminClient();
  const { data: invites, error } = await adminClient
    .from("workspace_invitations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }

  return (invites || []) as WorkspaceInvitation[];
}

/**
 * Invite a team member by email.
 */
export async function createWorkspaceInvitation({
  workspaceId,
  email,
  role,
  invitedBy,
  inviterName,
}: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  inviterName: string;
}): Promise<WorkspaceInvitation> {
  const adminClient = createAdminClient();
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if user with this email is already a member
  const { data: existingUser } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", cleanEmail)
    .single();

  if (existingUser) {
    const { data: isMember } = await adminClient
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", existingUser.id)
      .single();

    if (isMember) {
      throw new Error("This user is already a member of this workspace.");
    }
  }

  // 2. Check if active pending invitation already exists
  const { data: existingInvite } = await adminClient
    .from("workspace_invitations")
    .select("id, token")
    .eq("workspace_id", workspaceId)
    .eq("email", cleanEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existingInvite) {
    return existingInvite as WorkspaceInvitation;
  }

  // 3. Generate secure token
  const token = crypto.randomBytes(24).toString("hex");

  const { data: invite, error: inviteErr } = await adminClient
    .from("workspace_invitations")
    .insert({
      workspace_id: workspaceId,
      email: cleanEmail,
      role,
      token,
      invited_by: invitedBy,
      status: "pending",
    })
    .select("*")
    .single();

  if (inviteErr || !invite) {
    throw new Error(inviteErr?.message || "Failed to create invitation.");
  }

  // 4. Log activity
  await logAgencyActivity({
    workspaceId,
    actorId: invitedBy,
    actorName: inviterName,
    action: "member.invited",
    resourceType: "member",
    resourceId: invite.id,
    details: { email: cleanEmail, role },
  });

  // 5. Optionally send email via Resend if API key is present
  try {
    if (process.env.RESEND_API_KEY) {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://compxorbit.com"}/invite/${token}`;
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "CompX Orbit <noreply@compxorbit.com>",
        to: cleanEmail,
        subject: `You've been invited to join an Agency Workspace on CompX Orbit`,
        html: `
          <div style="font-family: sans-serif; background: #0c1510; color: #e7eee9; padding: 32px; border-radius: 16px;">
            <h2 style="color: #3cff5f; margin-top: 0;">CompX Orbit Agency OS</h2>
            <p><strong>${inviterName}</strong> has invited you to collaborate in their Agency Workspace with the role of <strong>${role.toUpperCase()}</strong>.</p>
            <p>Click below to accept your invitation and access video review timelines and projects:</p>
            <a href="${inviteUrl}" style="display: inline-block; background: #3cff5f; color: #050a08; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px;">
              Accept Invitation & Join Workspace →
            </a>
          </div>
        `,
      });
    }
  } catch (err) {
    console.warn("Could not dispatch invite email:", err);
  }

  return invite as WorkspaceInvitation;
}

/**
 * Accept an invitation using the token.
 */
export async function acceptWorkspaceInvitation({
  token,
  userId,
  userEmail,
}: {
  token: string;
  userId: string;
  userEmail?: string | null;
}) {
  const adminClient = createAdminClient();

  // Find pending invitation
  const { data: invite, error } = await adminClient
    .from("workspace_invitations")
    .select(`
      *,
      workspaces ( id, name )
    `)
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !invite) {
    throw new Error("Invitation token is invalid, expired, or has already been used.");
  }

  // Check if user is already a member
  const { data: existingMember } = await adminClient
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", invite.workspace_id)
    .eq("user_id", userId)
    .single();

  if (!existingMember) {
    // Add member
    await adminClient.from("workspace_members").insert({
      workspace_id: invite.workspace_id,
      user_id: userId,
      role: invite.role,
    });
  }

  // Mark invitation accepted
  await adminClient
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  // Log activity
  await logAgencyActivity({
    workspaceId: invite.workspace_id,
    actorId: userId,
    actorName: userEmail || "New Member",
    action: "member.joined",
    resourceType: "member",
    resourceId: userId,
    details: { role: invite.role },
  });

  return { workspaceId: invite.workspace_id, workspaceName: (invite as any).workspaces?.name };
}

/**
 * Remove a member from the workspace.
 */
export async function removeWorkspaceMember({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) {
  const adminClient = createAdminClient();

  // Check role of the member to ensure they're not the owner
  const { data: member } = await adminClient
    .from("workspace_members")
    .select("role, user_id")
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member) {
    throw new Error("Member not found in this workspace.");
  }

  if (member.role === "owner") {
    throw new Error("Cannot remove the Workspace Owner.");
  }

  await adminClient.from("workspace_members").delete().eq("id", memberId);
  return { success: true };
}

/**
 * Change member role.
 */
export async function updateMemberRole({
  workspaceId,
  memberId,
  newRole,
}: {
  workspaceId: string;
  memberId: string;
  newRole: WorkspaceRole;
}) {
  const adminClient = createAdminClient();

  const { data: member } = await adminClient
    .from("workspace_members")
    .select("role")
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member) throw new Error("Member not found.");
  if (member.role === "owner") throw new Error("Cannot change owner's role.");

  const { data, error } = await adminClient
    .from("workspace_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to update role.");
  return data;
}

