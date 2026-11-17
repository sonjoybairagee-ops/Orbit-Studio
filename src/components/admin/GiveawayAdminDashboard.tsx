"use client";

import React, { useState, useMemo } from "react";
import {
  Gift,
  Award,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Shuffle,
  RotateCcw,
  Clock,
  Eye,
  Check,
  Filter,
  Users,
  Mail,
  Share2,
} from "lucide-react";
import { GiveawayEntry, GIVEAWAY_CONFIG } from "@/lib/giveaway";

interface GiveawayAdminDashboardProps {
  initialEntries: GiveawayEntry[];
}

export function GiveawayAdminDashboard({ initialEntries }: GiveawayAdminDashboardProps) {
  const [entries, setEntries] = useState<GiveawayEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "winner" | "disqualified">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const [selectedEntry, setSelectedEntry] = useState<GiveawayEntry | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Live filtered list
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (platformFilter !== "all" && item.platform !== platformFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.full_name.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesUrl = item.social_share_url.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesUrl;
      }
      return true;
    });
  }, [entries, statusFilter, platformFilter, searchQuery]);

  // Metrics
  const totalCount = entries.length;
  const winnersCount = entries.filter((e) => e.is_winner || e.status === "winner").length;
  const pendingCount = entries.filter((e) => e.status === "pending" && !e.is_winner).length;
  const disqualifiedCount = entries.filter((e) => e.status === "disqualified").length;

  const winnerEmails = useMemo(() => {
    return entries.filter((e) => e.is_winner || e.status === "winner").map((e) => e.email);
  }, [entries]);

  // Open inspection modal for an entry (when email or row is clicked)
  const openInspectModal = (entry: GiveawayEntry) => {
    setSelectedEntry(entry);
    setAdminNotes(entry.notes || "");
  };

  // Toggle winner status for an entry
  const handleToggleWinner = async (entry: GiveawayEntry, forceStatus?: "winner" | "pending" | "disqualified") => {
    setIsUpdating(true);
    const newStatus = forceStatus || (entry.status === "winner" ? "pending" : "winner");
    const isWinner = newStatus === "winner";

    try {
      const res = await fetch("/api/admin/giveaway", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          email: entry.email,
          status: newStatus,
          is_winner: isWinner,
          notes: adminNotes,
        }),
      });

      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.email === entry.email
              ? { ...e, status: newStatus, is_winner: isWinner, notes: adminNotes }
              : e
          )
        );
        if (selectedEntry?.email === entry.email) {
          setSelectedEntry((prev) =>
            prev ? { ...prev, status: newStatus, is_winner: isWinner, notes: adminNotes } : null
          );
        }
        setActionMessage(`Updated ${entry.email} to ${newStatus}`);
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Random lucky draw (50 winners)
  const handleDrawWinners = async () => {
    const confirmDraw = window.confirm(
      `Are you sure you want to run the lucky draw and randomly select 50 winners from the eligible entries?`
    );
    if (!confirmDraw) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "draw_winners", count: 50 }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const winningSet = new Set(data.winnerEmails || []);
        setEntries((prev) =>
          prev.map((e) =>
            winningSet.has(e.email)
              ? { ...e, status: "winner", is_winner: true, winner_selected_at: new Date().toISOString() }
              : e
          )
        );
        setActionMessage(`🎉 Successfully selected ${data.selectedCount} lucky winners!`);
        setTimeout(() => setActionMessage(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset winners
  const handleResetWinners = async () => {
    const confirmReset = window.confirm("Reset all winners back to pending status?");
    if (!confirmReset) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_winners" }),
      });
      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) => ({ ...e, status: "pending", is_winner: false }))
        );
        setActionMessage("All winners reset to pending.");
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Copy winner emails to clipboard
  const handleCopyWinnerEmails = () => {
    if (winnerEmails.length === 0) {
      alert("No winners selected yet.");
      return;
    }
    navigator.clipboard.writeText(winnerEmails.join(", "));
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["Full Name", "Email", "Social Share URL", "Platform", "Preferred App", "Status", "Is Winner", "Created At", "Notes"];
    const rows = entries.map((e) => [
      `"${e.full_name.replace(/"/g, '""')}"`,
      `"${e.email}"`,
      `"${e.social_share_url.replace(/"/g, '""')}"`,
      e.platform,
      e.preferred_app,
      e.status,
      e.is_winner ? "YES" : "NO",
      `"${e.created_at}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `compx-orbit-giveaway-entries-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1877F2]/20 text-[#4c9bfd] border border-[#1877F2]/30">Facebook</span>;
      case "twitter":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20">X / Twitter</span>;
      case "linkedin":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A66C2]/20 text-[#45a4ff] border border-[#0A66C2]/30">LinkedIn</span>;
      case "instagram":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4405F]/20 text-[#ff6884] border border-[#E4405F]/30">Instagram</span>;
      case "youtube":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF0000]/20 text-[#ff5252] border border-[#FF0000]/30">YouTube</span>;
      case "reddit":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF4500]/20 text-[#ff7945] border border-[#FF4500]/30">Reddit</span>;
      case "whatsapp":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#25D366]/20 text-[#3cff5f] border border-[#25D366]/30">WhatsApp</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Web</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-amber">Giveaway Campaign</span>
            <span className="text-xs text-[#3cff5f] font-mono">30-Day Lucky Draw Window</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            50 Free Extension Licenses Giveaway
          </h1>
          <p className="text-xs sm:text-sm text-[#8da194] mt-1 max-w-2xl">
            Review participant claims, verify social media share posts, and select <b>50 lucky winners</b> to receive lifetime extension licenses.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDrawWinners}
            disabled={isUpdating || totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3cff5f] hover:bg-[#52ff71] text-[#050a08] font-bold text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
            title="Randomly selects 50 winners from eligible entries"
          >
            <Shuffle className="h-4 w-4" />
            <span>Pick 50 Lucky Winners</span>
          </button>
          <button
            type="button"
            onClick={handleCopyWinnerEmails}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#234b2f] bg-[#0c1810] text-xs font-semibold text-[#8bf7a3] hover:border-[#3cff5f] transition-colors cursor-pointer"
          >
            {copiedEmails ? <Check className="h-4 w-4 text-[#3cff5f]" /> : <Copy className="h-4 w-4" />}
            <span>Copy Winner Emails ({winnersCount})</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#234b2f] bg-[#0c1810] text-xs font-semibold text-white hover:border-[#3cff5f] transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          {winnersCount > 0 && (
            <button
              type="button"
              onClick={handleResetWinners}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-red-900/60 bg-red-950/30 text-xs font-medium text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer"
              title="Reset all winners"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-semibold text-[#3cff5f] animate-in fade-in duration-200">
          {actionMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="muted text-xs font-bold uppercase tracking-wider">Total Claims</span>
          <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
          <p className="text-[11px] text-[#8da194] mt-0.5">Submitted entries</p>
        </div>
        <div className="card p-4">
          <span className="muted text-xs font-bold uppercase tracking-wider">Winners Selected</span>
          <p className="text-2xl font-black text-[#3cff5f] mt-1">
            {winnersCount} <span className="text-xs text-[#8da194]">/ 50</span>
          </p>
          <p className="text-[11px] text-[#8da194] mt-0.5">
            {50 - winnersCount > 0 ? `${50 - winnersCount} slots left` : "Quota Filled 🎉"}
          </p>
        </div>
        <div className="card p-4">
          <span className="muted text-xs font-bold uppercase tracking-wider">Pending Review</span>
          <p className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-[#8da194] mt-0.5">Eligible for draw</p>
        </div>
        <div className="card p-4">
          <span className="muted text-xs font-bold uppercase tracking-wider">Disqualified</span>
          <p className="text-2xl font-black text-red-400 mt-1">{disqualifiedCount}</p>
          <p className="text-[11px] text-[#8da194] mt-0.5">Invalid/broken posts</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 card p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#617366]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by participant email, name, or share link..."
            className="w-full bg-[#080d0a] border border-[#1a2b20] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#526357] focus:outline-none focus:border-[#3cff5f]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "all" ? "bg-[#3cff5f]/20 text-[#3cff5f] border border-[#3cff5f]/40" : "text-[#8da194] hover:text-white"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("winner")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "winner" ? "bg-[#3cff5f]/20 text-[#3cff5f] border border-[#3cff5f]/40" : "text-[#8da194] hover:text-white"
            }`}
          >
            🏆 Winners ({winnersCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "pending" ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "text-[#8da194] hover:text-white"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("disqualified")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === "disqualified" ? "bg-red-400/20 text-red-300 border border-red-400/40" : "text-[#8da194] hover:text-white"
            }`}
          >
            Disqualified ({disqualifiedCount})
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b130e] text-[#8da194] uppercase tracking-wider font-bold border-b border-[#1b2b20]">
              <tr>
                <th className="px-4 py-3.5">Participant</th>
                <th className="px-4 py-3.5">
                  <span className="text-[#3cff5f]">Clickable Email</span> (Inspect)
                </th>
                <th className="px-4 py-3.5">Social Share Link</th>
                <th className="px-4 py-3.5">Host App</th>
                <th className="px-4 py-3.5">Submitted</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16241b]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#687d70]">
                    No giveaway entries found. Share the giveaway link on the landing page!
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => (
                  <tr
                    key={item.email}
                    className={`hover:bg-[#0c1710] transition-colors ${
                      item.is_winner || item.status === "winner" ? "bg-[#102a16]/40" : ""
                    }`}
                  >
                    {/* Participant Name */}
                    <td className="px-4 py-3.5 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#162d1c] border border-[#2b5435] text-[#3cff5f] font-bold text-xs flex items-center justify-center shrink-0">
                          {item.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{item.full_name}</span>
                      </div>
                    </td>

                    {/* Email (Clickable to open Detail Modal as user requested) */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openInspectModal(item)}
                        className="inline-flex items-center gap-1.5 font-mono text-[#3cff5f] hover:underline cursor-pointer group text-left"
                        title="Click to view full details and verify post link"
                      >
                        <Mail className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                        <span>{item.email}</span>
                      </button>
                    </td>

                    {/* Social Media Link (Clickable external link) */}
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="flex items-center gap-2">
                        {getPlatformBadge(item.platform)}
                        <a
                          href={item.social_share_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-[#8da194] hover:text-[#3cff5f] hover:underline inline-flex items-center gap-1"
                          title={item.social_share_url}
                        >
                          <span className="truncate">{item.social_share_url.replace(/^https?:\/\//, "")}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Preferred App */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#afbeb4]">
                      {item.preferred_app === "BOTH" ? "AE + PR (Combo)" : item.preferred_app === "AEFT" ? "After Effects" : "Premiere Pro"}
                    </td>

                    {/* Submitted Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#687d70] font-mono text-[11px]">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.is_winner || item.status === "winner" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#3cff5f]/20 text-[#3cff5f] border border-[#3cff5f]/40 shadow-[0_0_12px_rgba(60,255,95,0.3)]">
                          <Award className="h-3 w-3" />
                          <span>Winner</span>
                        </span>
                      ) : item.status === "disqualified" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-400/20 text-red-300 border border-red-400/40">
                          <XCircle className="h-3 w-3" />
                          <span>Disqualified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleWinner(item)}
                          disabled={isUpdating}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            item.is_winner || item.status === "winner"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-[#102a16] text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e]"
                          }`}
                        >
                          {item.is_winner || item.status === "winner" ? "Unmark" : "🏆 Pick"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openInspectModal(item)}
                          className="p-1.5 rounded-lg border border-[#1e2e23] bg-[#0c1510] text-[#8da194] hover:text-white hover:border-[#3cff5f] transition-colors cursor-pointer"
                          title="Inspect details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal (Requested by user: "mail click korle share kora link ta dekhte pabo 30 day por ami eikhan theke winner annopunce korbo") */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#2e5437] bg-[#08120b] p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#1b2f21]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3cff5f] flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5" />
                  Giveaway Entry Inspection
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{selectedEntry.full_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-[#687d70] hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Email & Contact */}
            <div className="space-y-3">
              <div className="rounded-xl border border-[#1b3122] bg-[#050b07] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8da194] font-bold">Email Address:</span>
                  <a
                    href={`mailto:${selectedEntry.email}`}
                    className="font-mono text-[#3cff5f] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{selectedEntry.email}</span>
                    <Mail className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8da194] font-bold">Preferred Software:</span>
                  <span className="font-mono text-white">
                    {selectedEntry.preferred_app === "BOTH"
                      ? "After Effects + Premiere Pro"
                      : selectedEntry.preferred_app === "AEFT"
                      ? "After Effects"
                      : "Premiere Pro"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8da194] font-bold">Submitted Date:</span>
                  <span className="font-mono text-[#8da194]">
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Big Prominent Social Post Verification Box */}
              <div>
                <label className="block text-xs font-bold text-[#8da194] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Social Media Share Post Link:</span>
                  {getPlatformBadge(selectedEntry.platform)}
                </label>
                <div className="rounded-xl border border-[#2a5234] bg-[#0c1d12] p-3.5 space-y-2.5">
                  <p className="text-xs font-mono text-[#3cff5f] break-all leading-relaxed">
                    {selectedEntry.social_share_url}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#1b3824]">
                    <a
                      href={selectedEntry.social_share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#3cff5f] hover:bg-[#52ff71] text-[#050a08] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open Post in New Tab ↗</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEntry.social_share_url);
                        setActionMessage("Link copied to clipboard!");
                        setTimeout(() => setActionMessage(""), 2000);
                      }}
                      className="px-3 py-2 rounded-lg border border-[#2a5234] bg-[#102517] text-xs font-semibold text-white hover:border-[#3cff5f] transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Verification Notes */}
              <div>
                <label className="block text-xs font-bold text-[#8da194] uppercase tracking-wider mb-1.5">
                  Verification Notes:
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified post on Facebook timeline. Active profile."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#050b07] border border-[#1b3122] text-xs text-white placeholder-[#506356] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1b2f21]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleWinner(selectedEntry, "disqualified")}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 border border-red-900/40 transition-colors cursor-pointer"
                >
                  Disqualify
                </button>
                {selectedEntry.status === "disqualified" && (
                  <button
                    type="button"
                    onClick={() => handleToggleWinner(selectedEntry, "pending")}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-[#8da194] hover:text-white transition-colors cursor-pointer"
                  >
                    Set Pending
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#8da194] hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleWinner(selectedEntry)}
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md ${
                    selectedEntry.is_winner || selectedEntry.status === "winner"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                      : "bg-[#3cff5f] hover:bg-[#52ff71] text-[#050a08]"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span>
                    {selectedEntry.is_winner || selectedEntry.status === "winner"
                      ? "Remove from Winners"
                      : "Mark as Winner 🏆"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
