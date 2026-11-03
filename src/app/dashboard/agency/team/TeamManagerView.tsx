"use client";

import { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  X,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Workspace, WorkspaceMember, WorkspaceRole } from "@/types/agency";
import { WorkspaceInvitation } from "@/lib/agency/team-service";
import { canManageMembers } from "@/lib/agency/permissions";

interface TeamManagerViewProps {
  workspace: Workspace;
  initialMembers: WorkspaceMember[];
  initialInvitations: WorkspaceInvitation[];
  currentUserRole: WorkspaceRole;
  currentUserId: string;
}

export function TeamManagerView({
  workspace,
  initialMembers,
  initialInvitations,
  currentUserRole,
  currentUserId,
}: TeamManagerViewProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>(initialMembers);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>(initialInvitations);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState<string>("");

  // Form
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<WorkspaceRole>("editor");

  const isManager = canManageMembers(currentUserRole);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    setInviteError("");

    try {
      const res = await fetch("/api/agency/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          email,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite member.");
      }

      setInvitations([data.invitation, ...invitations]);
      setEmail("");
      setIsModalOpen(false);
    } catch (err: any) {
      setInviteError(err.message || "Failed to send invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;
    try {
      const res = await fetch(
        `/api/agency/team?workspaceId=${workspace.id}&memberId=${memberId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== memberId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(
        `/api/agency/team?workspaceId=${workspace.id}&invitationId=${invitationId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setInvitations(invitations.filter((i) => i.id !== invitationId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      const res = await fetch("/api/agency/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          memberId,
          newRole,
        }),
      });

      if (res.ok) {
        setMembers(
          members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(""), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#3cff5f]" />
            <span>Team Members &amp; Workspace Roles</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Collaborate with editors, motion designers, and reviewers with role-based access control.
          </p>
        </div>

        {isManager && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Role explanation callouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { role: "Owner", desc: "Full control, billing & storage caps" },
          { role: "Admin", desc: "Manages projects, files & team" },
          { role: "Editor", desc: "Uploads cuts & manages revisions" },
          { role: "Reviewer", desc: "Inspects cuts & leaves timestamp remarks" },
        ].map((r) => (
          <div key={r.role} className="rounded-2xl border border-[#213026] bg-[#0c1510] p-3.5">
            <span className="text-xs font-bold text-[#3cff5f] capitalize">{r.role}</span>
            <p className="text-[11px] text-[#8da194] mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Members Table */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
          <span>Active Workspace Members ({members.length})</span>
        </h2>

        <div className="space-y-3">
          {members.map((m) => {
            const isSelf = m.user_id === currentUserId;
            const isOwner = m.role === "owner";

            return (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#213026] bg-[#080e0b] gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] font-black text-sm shrink-0">
                    {(m.profiles?.full_name || m.profiles?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#e7eee9] truncate">
                      {m.profiles?.full_name || m.profiles?.email?.split("@")[0] || "Team Member"}
                      {isSelf && (
                        <span className="ml-2 text-[10px] text-[#3cff5f] font-mono">(You)</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#8da194] truncate">{m.profiles?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {/* Role Selector or Badge */}
                  {isManager && !isOwner && !isSelf ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as WorkspaceRole)}
                      className="bg-[#102a16] border border-[#2a5234] text-[#3cff5f] text-xs font-bold rounded-xl px-2.5 py-1 cursor-pointer focus:outline-none uppercase tracking-wider"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="reviewer">Reviewer</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
                      {m.role}
                    </span>
                  )}

                  {isManager && !isOwner && !isSelf && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1.5 rounded-xl text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Pending Invitations ({invitations.length})</span>
          </h2>

          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[#213026] bg-[#080e0b] gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#e7eee9]">{inv.email}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#15231c] text-[#8da194] border border-[#213026]">
                      {inv.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#62776a] mt-0.5 font-mono">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => copyInviteLink(inv.token)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#213026] bg-[#0c1510] text-xs font-semibold text-[#8da194] hover:text-[#3cff5f] transition-all cursor-pointer"
                  >
                    {copiedToken === inv.token ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#3cff5f]" />
                        <span className="text-[#3cff5f]">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Join Link</span>
                      </>
                    )}
                  </button>

                  {isManager && (
                    <button
                      type="button"
                      onClick={() => handleRevokeInvitation(inv.id)}
                      className="px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-950/40 cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[#8da194] hover:text-[#e7eee9] p-1.5 rounded-lg hover:bg-[#102a16]"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[#3cff5f]" />
              <span>Invite New Team Member</span>
            </h2>
            <p className="text-xs text-[#8da194] mt-1 mb-4">
              Send a join invitation link for your agency workspace.
            </p>

            {inviteError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Team Member Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@studio.com"
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Assign Workspace Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                >
                  <option value="editor">Editor — Can upload video cuts &amp; manage revisions</option>
                  <option value="reviewer">Reviewer — Inspect cuts &amp; add timestamp feedback</option>
                  <option value="admin">Admin — Full project, file &amp; team management</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2720]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8da194] hover:text-[#e7eee9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Invite...</span>
                    </>
                  ) : (
                    <span>Generate &amp; Send Invite</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
