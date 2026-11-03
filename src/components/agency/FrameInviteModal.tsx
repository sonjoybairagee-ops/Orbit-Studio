"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Grid,
  Check,
  ChevronDown,
  X,
  Copy,
  Mail,
  Loader2,
  Users,
  LayoutGrid,
} from "lucide-react";
import { Workspace, WorkspaceRole } from "@/types/agency";

export interface FrameRoleConfig {
  id: string;
  name: string;
  role: WorkspaceRole;
  description: string;
}

export const FRAME_ROLES: FrameRoleConfig[] = [
  {
    id: "workspace_admin",
    name: "Workspace Admin",
    role: "admin",
    description: "Can manage all resources and workspace settings",
  },
  {
    id: "full_access",
    name: "Full Access",
    role: "admin",
    description: "Can manage all resources within the workspace",
  },
  {
    id: "edit_share",
    name: "Edit & Share",
    role: "editor",
    description: "Can manage resources, download, and share",
  },
  {
    id: "edit",
    name: "Edit",
    role: "editor",
    description: "Can create, move, and update a variety of resources",
  },
  {
    id: "comment_only",
    name: "Comment Only",
    role: "reviewer",
    description: "Can view and comment on the relevant resources",
  },
  {
    id: "view_only",
    name: "View Only",
    role: "reviewer",
    description: "Can view the relevant resources",
  },
];

interface FrameInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  memberCount?: number;
  suggestedUsers?: { name: string; email: string }[];
}

export function FrameInviteModal({
  isOpen,
  onClose,
  workspace,
  memberCount = 1,
  suggestedUsers = [],
}: FrameInviteModalProps) {
  const [emailOrName, setEmailOrName] = useState("");
  const [selectedRole, setSelectedRole] = useState<FrameRoleConfig>(FRAME_ROLES[0]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    token: string;
    inviteUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailOrName.trim();
    if (!clean) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/agency/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          email: clean,
          role: selectedRole.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      const inviteUrl = `${window.location.origin}/invite/${data.invitation.token}`;
      setInviteResult({
        email: clean,
        token: data.invitation.token,
        inviteUrl,
      });
      setEmailOrName("");
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to invite user";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    if (!inviteResult) return;
    navigator.clipboard.writeText(inviteResult.inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl border border-[#22293c] bg-[#121520] shadow-2xl overflow-hidden flex flex-col relative text-[#e7eee9]">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="h-4 w-4 text-[#7584a0]" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Add to {workspace.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#64728c] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-6 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              {errorMessage}
            </div>
          )}

          {inviteResult ? (
            /* Success State with Copyable Link */
            <div className="rounded-xl border border-[#233529] bg-[#0c1811] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3cff5f]">
                <Check className="h-4 w-4" />
                <span>Invitation Ready for {inviteResult.email}!</span>
              </div>
              <p className="text-xs text-[#8da194]">
                Share this secure join link directly with your teammate:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.inviteUrl}
                  className="flex-1 rounded-lg bg-[#060e0a] border border-[#213026] px-3 py-2 text-xs font-mono text-[#e7eee9] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="px-3.5 py-2 rounded-lg bg-[#3cff5f] hover:bg-[#52ff71] text-[#050a08] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#3cff5f]/20"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInviteResult(null)}
                  className="text-xs text-[#8da194] hover:text-white underline cursor-pointer"
                >
                  + Invite another member
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddInvite} className="space-y-4">
              {/* Unified Input + Role Dropdown Container (Frame.io 1:1) */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center rounded-xl bg-[#171b28] border border-[#262f44] focus-within:border-[#5d5fef] focus-within:ring-1 focus-within:ring-[#5d5fef]/30 transition-all p-1">
                  {/* Left Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    placeholder="Name or email"
                    value={emailOrName}
                    onChange={(e) => setEmailOrName(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-[#5d6a83] focus:outline-none"
                  />

                  {/* Right Role Button Pill */}
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2537] hover:bg-[#283046] text-xs font-semibold text-[#8e9cb5] hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <span>{selectedRole.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#637089]" />
                  </button>
                </div>

                <p className="text-[11px] text-[#637089] mt-1.5 px-1">
                  Add a new or existing user
                </p>

                {/* Role Selector Dropdown Menu (Frame.io 1:1) */}
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 top-12 w-80 rounded-xl bg-[#171b28] border border-[#2b354d] shadow-2xl py-1.5 z-50 text-left divide-y divide-[#20273a]">
                    <div className="py-1">
                      {FRAME_ROLES.map((r) => {
                        const isSelected = selectedRole.id === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedRole(r);
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full px-3.5 py-2.5 flex items-start justify-between text-left hover:bg-[#202638] transition-colors cursor-pointer group"
                          >
                            <div className="pr-3">
                              <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#c2cbde] group-hover:text-white"}`}>
                                {r.name}
                              </p>
                              <p className="text-[11px] text-[#707d96] mt-0.5 leading-snug">
                                {r.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-[#5d5fef] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested User Section (if available) */}
              {suggestedUsers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-[#637089] uppercase tracking-wider">
                    Suggested
                  </p>
                  <div className="space-y-1">
                    {suggestedUsers.map((u, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEmailOrName(u.email)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1a2030] transition-colors text-left cursor-pointer group"
                      >
                        <div className="h-7 w-7 rounded-full bg-[#1abc9c] text-[#050a08] font-black text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white group-hover:text-[#5d5fef] transition-colors truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-[#637089] truncate">
                            {u.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional message input */}
              <div>
                <input
                  type="text"
                  placeholder="Add a message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl bg-[#171b28] border border-[#262f44] px-3.5 py-2 text-xs text-white placeholder-[#5d6a83] focus:border-[#5d5fef] focus:outline-none"
                />
              </div>

              {/* Action Buttons: Cancel and Add */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#7584a0] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!emailOrName.trim() || isSubmitting}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    emailOrName.trim() && !isSubmitting
                      ? "bg-[#5d5fef] hover:bg-[#6e70ff] text-white shadow-lg shadow-[#5d5fef]/25 active:scale-95"
                      : "bg-[#1c2232] text-[#556177] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Add</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Bottom Attached Footer Bar (Frame.io 1:1) */}
        <div className="px-6 py-3.5 bg-[#0e111a] border-t border-[#1a2030] flex items-center justify-between text-xs text-[#7584a0]">
          <span>{memberCount} {memberCount === 1 ? "Member" : "Members"}</span>
          <Link
            href="/dashboard/agency/team"
            onClick={onClose}
            className="font-bold text-white hover:text-[#5d5fef] transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
}

