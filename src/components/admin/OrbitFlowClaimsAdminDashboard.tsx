"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Zap,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Clock,
  Eye,
  Check,
  Filter,
  Users,
  Mail,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { OrbitFlowClaim } from "@/lib/orbitFlowClaims";

interface OrbitFlowClaimsAdminDashboardProps {
  initialClaims: OrbitFlowClaim[];
}

export function OrbitFlowClaimsAdminDashboard({
  initialClaims,
}: OrbitFlowClaimsAdminDashboardProps) {
  const [claims, setClaims] = useState<OrbitFlowClaim[]>(initialClaims);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedClaim, setSelectedClaim] = useState<OrbitFlowClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered claims list
  const filteredClaims = useMemo(() => {
    return claims.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.full_name || "").toLowerCase().includes(q);
        const matchesEmail = (item.email || "").toLowerCase().includes(q);
        const matchesKey = (item.license_key || "").toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesKey;
      }
      return true;
    });
  }, [claims, statusFilter, searchQuery]);

  // Metrics
  const totalCount = claims.length;
  const approvedCount = claims.filter((c) => c.status === "approved").length;
  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const rejectedCount = claims.filter((c) => c.status === "rejected").length;

  // Refresh data from server
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/orbit-flow-claims");
      const data = await res.json();
      if (res.ok && data.claims) {
        setClaims(data.claims);
        setActionMessage({ kind: "ok", text: "Claims list refreshed." });
      } else {
        setActionMessage({ kind: "err", text: data.error || "Failed to refresh" });
      }
    } catch {
      setActionMessage({ kind: "err", text: "Network error refreshing claims" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Approve Claim Action
  const handleApprove = async (claim: OrbitFlowClaim) => {
    setActionLoadingId(claim.id);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/orbit-flow-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          id: claim.id,
          email: claim.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setActionMessage({ kind: "err", text: data.error || "Failed to approve claim" });
      } else {
        setActionMessage({
          kind: "ok",
          text: `Approved! License issued: ${data.licenseKey || "Active"} for ${claim.email}`,
        });
        // Update local state
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id || c.email === claim.email
              ? {
                  ...c,
                  status: "approved",
                  license_key: data.licenseKey || c.license_key,
                  approved_at: new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch {
      setActionMessage({ kind: "err", text: "Network error while approving" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Claim Action
  const handleReject = async (claim: OrbitFlowClaim, notes?: string) => {
    setActionLoadingId(claim.id);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/orbit-flow-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          id: claim.id,
          email: claim.email,
          notes: notes || adminNotes || "Claim rejected by administrator",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setActionMessage({ kind: "err", text: data.error || "Failed to reject claim" });
      } else {
        setActionMessage({ kind: "ok", text: `Claim for ${claim.email} marked as rejected.` });
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id || c.email === claim.email
              ? {
                  ...c,
                  status: "rejected",
                  notes: notes || adminNotes || c.notes,
                }
              : c
          )
        );
        setSelectedClaim(null);
      }
    } catch {
      setActionMessage({ kind: "err", text: "Network error while rejecting" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy License Key helper
  const copyKey = (key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Copy all approved emails
  const handleCopyApprovedEmails = () => {
    const emails = claims
      .filter((c) => c.status === "approved")
      .map((c) => c.email)
      .join(", ");
    if (navigator?.clipboard && emails) {
      navigator.clipboard.writeText(emails);
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 2500);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Full Name", "Email", "Facebook Share URL", "Status", "License Key", "Submitted At", "Approved At"];
    const rows = filteredClaims.map((c) => [
      `"${c.full_name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${(c.social_share_url || "").replace(/"/g, '""')}"`,
      c.status,
      c.license_key || "",
      c.created_at,
      c.approved_at || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orbit_flow_claims_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0ea5e9]/15 border border-[#0ea5e9]/30 text-[#0ea5e9]">
              <Zap className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-[#0ea5e9]/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#38bdf8] border border-[#0ea5e9]/20">
              Product Extension Claim
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">
            Orbit Flow Claims
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#8c97a8]">
            Review landing page license requests. Approving a claim instantly issues a lifetime 1-device Orbit Flow key linked to their dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#38bdf8]" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Action Notification Banner ── */}
      {actionMessage && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-bold ${
            actionMessage.kind === "ok"
              ? "bg-[#45c66d]/15 border border-[#45c66d]/30 text-[#45c66d]"
              : "bg-red-500/15 border border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c97a8]">
              Total Claims
            </span>
            <Users className="h-4 w-4 text-[#8c97a8]" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
            {totalCount}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Pending Review
            </span>
            <span className="relative flex h-2 w-2">
              {pendingCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {pendingCount}
          </p>
        </div>

        {/* Approved */}
        <div className="rounded-2xl border border-[#45c66d]/30 bg-[#45c66d]/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#45c66d]">
              Approved &amp; Issued
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#45c66d]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-2xl sm:text-3xl font-black text-[#45c66d] font-mono">
              {approvedCount}
            </p>
            {approvedCount > 0 && (
              <button
                onClick={handleCopyApprovedEmails}
                className="text-[10px] font-bold text-[#45c66d] hover:underline"
              >
                {copiedEmails ? "✓ Copied" : "Copy Emails"}
              </button>
            )}
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">
              Rejected
            </span>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-red-400 font-mono">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* ── Filters and Search ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 p-3 sm:p-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["all", `All (${totalCount})`],
              ["pending", `Pending (${pendingCount})`],
              ["approved", `Approved (${approvedCount})`],
              ["rejected", `Rejected (${rejectedCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === key
                  ? "bg-[#0ea5e9] text-black shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                  : "bg-white/[0.04] text-[#8c97a8] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8c97a8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or key..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#5d6778] focus:border-[#0ea5e9] focus:outline-none"
          />
        </div>
      </div>

      {/* ── Claims List Table ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-black/40 text-[11px] font-bold uppercase tracking-wider text-[#8c97a8]">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Facebook Post</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">License Key</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#afbeb4]">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8c97a8]">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] text-xl">
                      🔍
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">No claims found</p>
                    <p className="mt-1 text-xs text-[#6e7a8a]">
                      {searchQuery ? "Try refining your search filter" : "No submissions in this category yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const isBusy = actionLoadingId === claim.id;
                  const isApproved = claim.status === "approved";
                  const isPending = claim.status === "pending";
                  const isRejected = claim.status === "rejected";

                  return (
                    <tr
                      key={claim.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Applicant Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">
                            {claim.full_name}
                          </span>
                          <span className="text-[11px] text-[#8c97a8] font-mono mt-0.5">
                            {claim.email}
                          </span>
                        </div>
                      </td>

                      {/* Facebook Share Post Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {claim.social_share_url ? (
                          <a
                            href={claim.social_share_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1877F2]/40 bg-[#1877F2]/10 px-2.5 py-1 text-[11px] font-bold text-[#1877F2] hover:bg-[#1877F2]/20 transition-all"
                            title={claim.social_share_url}
                          >
                            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>View Post</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#6e7a8a] italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#45c66d]/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#45c66d] border border-[#45c66d]/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#45c66d]"></span>
                            Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400 border border-amber-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-400 border border-red-500/30">
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* License Key */}
                      <td className="py-3.5 px-4">
                        {claim.license_key ? (
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-black/60 px-2 py-0.5 font-mono text-xs font-bold text-[#45c66d] border border-white/[0.06]">
                              {claim.license_key}
                            </code>
                            <button
                              onClick={() => copyKey(claim.license_key!)}
                              className="rounded p-1 text-[#8c97a8] hover:text-white transition-colors"
                              title="Copy License Key"
                            >
                              {copiedKey === claim.license_key ? (
                                <Check className="h-3.5 w-3.5 text-[#45c66d]" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6e7a8a] italic">
                            Not yet generated
                          </span>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#8c97a8]">
                        <div>{new Date(claim.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-[#616b7a]">
                          {new Date(claim.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(claim)}
                                disabled={isBusy}
                                className="flex items-center gap-1.5 rounded-lg bg-[#45c66d] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#38b55e] transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(69,198,109,0.25)]"
                              >
                                {isBusy ? (
                                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setSelectedClaim(claim)}
                                disabled={isBusy}
                                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleApprove(claim)}
                              disabled={isBusy}
                              title="Re-sync license or resend email"
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-bold text-[#8c97a8] hover:text-white transition-all disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3 w-3 ${isBusy ? "animate-spin" : ""}`} />
                              <span>Re-issue</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApprove(claim)}
                              disabled={isBusy}
                              className="flex items-center gap-1.5 rounded-lg bg-[#0ea5e9]/20 border border-[#0ea5e9]/40 px-3 py-1.5 text-xs font-bold text-[#38bdf8] hover:bg-[#0ea5e9]/30 transition-all disabled:opacity-50"
                            >
                              <span>Re-evaluate &amp; Approve</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedClaim(claim);
                              setAdminNotes(claim.notes || "");
                            }}
                            className="rounded-lg p-1.5 text-[#8c97a8] hover:bg-white/[0.06] hover:text-white transition-all"
                            title="Inspect details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inspection / Reject Modal ── */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c120e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Claim Inspection Details
                </h3>
                <p className="text-xs text-[#8c97a8] mt-0.5">
                  Applicant: {selectedClaim.full_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-[#8c97a8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold">Email:</span>
                <span className="font-mono text-white text-sm">{selectedClaim.email}</span>
              </div>

              {selectedClaim.social_share_url && (
                <div>
                  <span className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold">Facebook Post Link:</span>
                  <a
                    href={selectedClaim.social_share_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] hover:underline mt-0.5 font-mono break-all"
                  >
                    <span>{selectedClaim.social_share_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold">Current Status:</span>
                <span className="font-bold text-white capitalize">{selectedClaim.status}</span>
              </div>

              {selectedClaim.license_key && (
                <div>
                  <span className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold">Issued License Key:</span>
                  <code className="font-mono text-[#45c66d] font-bold text-sm bg-black/50 px-2 py-1 rounded inline-block mt-1">
                    {selectedClaim.license_key}
                  </code>
                </div>
              )}

              {selectedClaim.ip_address && (
                <div>
                  <span className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold">IP Address:</span>
                  <span className="font-mono text-[#afbeb4]">{selectedClaim.ip_address}</span>
                </div>
              )}

              <div>
                <label className="text-[#8c97a8] block text-[11px] uppercase tracking-wider font-bold mb-1">
                  Admin Notes / Rejection Reason:
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes or reason for rejection..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-xs text-white placeholder-[#546070] focus:border-[#0ea5e9] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedClaim(null)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              {selectedClaim.status !== "rejected" && (
                <button
                  onClick={() => handleReject(selectedClaim, adminNotes)}
                  disabled={actionLoadingId === selectedClaim.id}
                  className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              )}
              {selectedClaim.status !== "approved" && (
                <button
                  onClick={() => {
                    handleApprove(selectedClaim);
                    setSelectedClaim(null);
                  }}
                  disabled={actionLoadingId === selectedClaim.id}
                  className="rounded-xl bg-[#45c66d] px-4 py-2 text-xs font-bold text-black hover:bg-[#38b55e] disabled:opacity-50"
                >
                  Approve Claim
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
