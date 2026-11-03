"use client";

import React, { useState } from "react";
import {
  HardDrive,
  Zap,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  FolderKanban,
  HelpCircle,
  Plus,
  ArrowRight,
  AlertCircle,
  History,
  Trash2,
  RefreshCw,
  Loader2,
  Lock,
} from "lucide-react";
import { Workspace, WorkspaceStorageAddon, WorkspaceStorageTransaction } from "@/types/agency";
import { UpgradePlanModal } from "@/components/agency/UpgradePlanModal";
import { AGENCY_PLANS, STORAGE_ADDONS } from "@/lib/agency/pricing-config";

interface StorageUpgradeClientViewProps {
  initialWorkspace: Workspace;
  initialAddons?: WorkspaceStorageAddon[];
  initialTransactions?: WorkspaceStorageTransaction[];
}

export function StorageUpgradeClientView({
  initialWorkspace,
  initialAddons = [],
  initialTransactions = [],
}: StorageUpgradeClientViewProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [addons, setAddons] = useState<WorkspaceStorageAddon[]>(initialAddons);
  const [transactions, setTransactions] =
    useState<WorkspaceStorageTransaction[]>(initialTransactions);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddonModal, setIsAddonModal] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [cancellingAddonId, setCancellingAddonId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Storage quota calculations
  const quota = Number(workspace.storage_quota_bytes || 2147483648);
  const used = Number(workspace.storage_used_bytes || 0);
  const reserved = Number(workspace.reserved_bytes || 0);
  const available = Math.max(0, quota - used - reserved);

  const usedMB = (used / (1024 * 1024)).toFixed(1);
  const reservedMB = (reserved / (1024 * 1024)).toFixed(1);
  const availableMB = (available / (1024 * 1024)).toFixed(1);
  const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(1);

  const usedPercent = Math.min(100, Math.round((used / quota) * 100) || 0);
  const reservedPercent = Math.min(
    100 - usedPercent,
    Math.round((reserved / quota) * 100) || 0
  );

  const planList = [
    AGENCY_PLANS.free,
    AGENCY_PLANS.starter,
    AGENCY_PLANS.pro,
    AGENCY_PLANS.agency,
  ];

  // Refresh live stats from backend API
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/agency/storage/stats?workspaceId=${workspace.id}`);
      const data = await res.json();
      if (res.ok && data.stats) {
        setWorkspace((prev) => ({
          ...prev,
          storage_quota_bytes: data.stats.quotaBytes,
          storage_used_bytes: data.stats.usedBytes,
          reserved_bytes: data.stats.reservedBytes,
          is_over_quota: data.stats.isOverQuota,
        }));
        if (data.addons) setAddons(data.addons);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
      }
    } catch (err) {
      console.warn("Failed to refresh storage stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Safe Add-on Cancellation
  const handleCancelAddon = async (addonRecordId: string, addonName: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel "${addonName}"?\n\nExisting files are NEVER deleted. If your current usage exceeds the new quota, the workspace will enter over-quota protection and block new uploads until freed.`
      )
    ) {
      return;
    }

    setCancellingAddonId(addonRecordId);
    try {
      const res = await fetch("/api/agency/billing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          addonRecordId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel add-on.");
      }

      if (data.workspace) {
        setWorkspace(data.workspace);
      }
      setAddons((prev) => prev.filter((a) => a.id !== addonRecordId));
      alert(data.message || "Add-on cancelled successfully.");
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel add-on";
      alert(msg);
    } finally {
      setCancellingAddonId(null);
    }
  };

  const formatDeltaBytes = (bytes: number) => {
    const isNeg = bytes < 0;
    const abs = Math.abs(bytes);
    const inMB = abs / (1024 * 1024);
    if (inMB >= 1024) {
      return `${isNeg ? "-" : "+"}${(inMB / 1024).toFixed(1)} GB`;
    }
    return `${isNeg ? "-" : "+"}${inMB.toFixed(1)} MB`;
  };

  const getEventBadgeClass = (eventType: string) => {
    switch (eventType) {
      case "upload_confirmed":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "upload_reserved":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "upload_cancelled":
      case "upload_expired":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "file_deleted":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "quota_upgraded":
      case "addon_activated":
        return "bg-[#3cff5f]/10 text-[#3cff5f] border-[#3cff5f]/30";
      case "addon_cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-[#e7eee9]">
      {/* 1. Header & Live Storage Meter */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#4d6fff]/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1c2234]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1b2234] border border-[#2b354d] px-3 py-0.5 text-[10px] font-mono text-[#4d6fff] uppercase tracking-wider font-bold">
                CURRENT PLAN: {workspace.plan_tier.toUpperCase()}
              </span>
              <span className="text-xs text-[#78859e]">· Workspace: {workspace.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Storage Management &amp; Entitlements
            </h1>
            <p className="text-xs sm:text-sm text-[#8d9ab2] mt-1 max-w-xl">
              Cloudflare R2 storage quota with atomic upload reservations, append-only transactions, and recurring capacity add-ons.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={refreshStats}
              className="p-2.5 rounded-xl border border-[#2b354d] bg-[#1b2234] text-[#8d9ab2] hover:text-white transition-all cursor-pointer"
              title="Refresh Storage Metrics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#4d6fff]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAddonModal(false);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4d6fff] hover:bg-[#5f7eff] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-lg shadow-[#4d6fff]/25 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Over-Quota Warning Alert */}
        {workspace.is_over_quota && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/25 p-4 flex items-center justify-between gap-4 text-red-200 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold text-red-100">Workspace is Over Quota</p>
                <p className="text-red-300/90 text-[11px] mt-0.5">
                  Your stored files exceed your active plan allowance. Existing files remain fully accessible, but new uploads are suspended until storage is upgraded or freed.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddonModal(true);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs shrink-0 hover:bg-red-400 transition-all cursor-pointer"
            >
              Add Storage
            </button>
          </div>
        )}

        {/* Live Storage Gauge Progress Bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <span className="font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#3cff5f]" />
              <span>{usedMB} MB Used</span>
              {reserved > 0 && (
                <span className="text-[#4da6ff] font-normal">({reservedMB} MB reserved)</span>
              )}
            </span>
            <span className="text-[#8d9ab2] font-mono">
              {totalGB} GB Quota Cap · {availableMB} MB Available ({usedPercent}% used)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-[#1a2030] overflow-hidden p-0.5 flex">
            <div
              className={`h-full rounded-l-full transition-all duration-500 ${
                usedPercent > 85 ? "bg-red-500" : usedPercent > 60 ? "bg-yellow-400" : "bg-[#3cff5f]"
              }`}
              style={{ width: `${Math.max(2, usedPercent)}%` }}
              title={`Used: ${usedMB} MB`}
            />
            {reservedPercent > 0 && (
              <div
                className="h-full bg-[#4da6ff] animate-pulse rounded-r-full transition-all duration-500"
                style={{ width: `${reservedPercent}%` }}
                title={`Reserved: ${reservedMB} MB`}
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. Active Storage Add-ons Section (if any) */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#3cff5f]" />
              <span>Active Storage Add-Ons ({addons.length})</span>
            </h3>
            <p className="text-xs text-[#8d9ab2] mt-0.5">
              Additional R2 storage capacity stacked onto your base workspace plan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddonModal(true);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d2720] border border-[#2d4734] text-[#3cff5f] text-xs font-bold hover:bg-[#25382b] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Capacity</span>
          </button>
        </div>

        {addons.length === 0 ? (
          <div className="py-6 rounded-2xl bg-[#161a26] border border-[#20273a] text-center text-xs text-[#707e99]">
            No recurring storage add-ons active. Need more than {totalGB} GB? Add 250 GB, 500 GB, or 1 TB below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {addons.map((a) => {
              const gb = (a.bytes_added / (1024 * 1024 * 1024)).toFixed(0);
              const isCancelling = cancellingAddonId === a.id;

              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-[#20273a] bg-[#161a26] p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-white">+{gb} GB Extra Capacity</p>
                    <p className="text-[11px] text-[#707e99] mt-0.5">
                      {a.billing_cycle} · Active since {new Date(a.activated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={() => handleCancelAddon(a.id, `+${gb} GB Extra Capacity`)}
                    className="p-1.5 rounded-xl text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all cursor-pointer disabled:opacity-50"
                    title="Cancel add-on"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Billing Cycle Switcher & Plan Cards */}
      <div className="text-center space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Simple, Transparent Per-Workspace Pricing
        </h2>
        <p className="text-xs sm:text-sm text-[#8d9ab2] max-w-lg mx-auto">
          One flat price per agency workspace. External clients and review links are always 100% free with no account required.
        </p>

        <div className="inline-flex items-center gap-3 rounded-full bg-[#141724] border border-[#22293c] p-1.5 mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-[#4d6fff] text-white shadow-sm"
                : "text-[#7584a0] hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "annual"
                ? "bg-[#4d6fff] text-white shadow-sm"
                : "text-[#7584a0] hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-[#1b2b20] border border-[#2a4d32] px-2 py-0.2 text-[10px] text-[#3cff5f] font-mono">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* 4. 4 Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {planList.map((plan) => {
          const isCurrent = workspace.plan_tier === plan.id;
          const price =
            billingCycle === "annual"
              ? plan.priceAnnualMonthlyEquivalentUSD
              : plan.priceMonthlyUSD;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative border ${
                plan.popular
                  ? "border-[#4d6fff] bg-[#141826] shadow-xl shadow-[#4d6fff]/15"
                  : isCurrent
                  ? "border-[#3cff5f]/50 bg-[#121520]"
                  : "border-[#202638] bg-[#121520] hover:border-[#333d56]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 rounded-full bg-[#4d6fff] text-white text-[10px] font-black px-3 py-0.5 uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <span className="text-[10px] font-mono text-[#8d9ab2] uppercase tracking-wider">
                  {plan.bestFor}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{plan.name}</h3>
                <p className="text-xs text-[#707e99] mt-0.5 leading-snug">{plan.tagline}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${price}</span>
                  <span className="text-xs text-[#707e99]">/month</span>
                </div>
                {billingCycle === "annual" && plan.priceAnnualTotalUSD > 0 && (
                  <p className="text-[11px] text-[#4d6fff] mt-0.5">
                    ${plan.priceAnnualTotalUSD} billed annually
                  </p>
                )}

                <div className="mt-5 py-3 border-y border-[#1c2234] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8d9ab2]">Storage</span>
                    <span className="font-bold text-white">{plan.storageGB} GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8d9ab2]">Internal Members</span>
                    <span className="font-bold text-white">{plan.membersIncluded}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8d9ab2]">Active Projects</span>
                    <span className="font-bold text-white">
                      {plan.activeProjectsLimit > 0 ? plan.activeProjectsLimit : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8d9ab2]">Client Reviewers</span>
                    <span className="font-bold text-[#3cff5f]">Unlimited (Free)</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-[#a2aec4]">
                  {plan.features.slice(4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#3cff5f] shrink-0 mt-0.5" />
                      <span className="leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-[#1b2234] border border-[#2b354d] text-center text-xs font-bold text-[#4d6fff]"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddonModal(false);
                      setIsModalOpen(true);
                    }}
                    className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-[#4d6fff] hover:bg-[#5f7eff] text-white shadow-lg shadow-[#4d6fff]/25"
                        : "bg-[#1c2234] hover:bg-[#252c42] text-white"
                    }`}
                  >
                    {plan.id === "free" ? "Downgrade to Free" : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Storage Add-on Purchase Catalog */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-1">
            <HardDrive className="h-4 w-4" />
            <span>Need More Cloudflare R2 Capacity?</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Storage Add-Ons (Recurring Capacity)
          </h3>
          <p className="text-xs text-[#8d9ab2] mt-0.5">
            Keep your team size while scaling your media storage as client video cut sizes grow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STORAGE_ADDONS.map((addon) => (
            <div
              key={addon.id}
              className="rounded-2xl border border-[#20273a] bg-[#161a26] p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-base font-bold text-white">{addon.name}</p>
                <p className="text-xs text-[#707e99]">Additional R2 Storage</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-white">
                  ${addon.priceMonthlyUSD}
                  <span className="text-xs font-normal text-[#707e99]">/mo</span>
                </p>
                <p className="text-[10px] text-[#707e99]">{addon.priceMonthlyBDT} ৳</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Append-Only Storage Ledger / Audit Trail */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-[#4d6fff]" />
          <span>Storage Ledger &amp; Transaction Audit Trail ({transactions.length})</span>
        </h3>
        <p className="text-xs text-[#8d9ab2]">
          Immutable ledger recording every reservation, confirmation, release, and add-on change.
        </p>

        {transactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#707e99] rounded-2xl bg-[#161a26] border border-[#20273a]">
            No storage transactions recorded yet for this workspace.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-[#20273a] bg-[#161a26] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase shrink-0 ${getEventBadgeClass(
                      t.event_type
                    )}`}
                  >
                    {t.event_type.replace("_", " ")}
                  </span>
                  <span className="text-[#8d9ab2] truncate">{t.note || t.event_type}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right font-mono text-[11px]">
                  <span
                    className={
                      t.delta_bytes > 0
                        ? "text-[#3cff5f] font-bold"
                        : t.delta_bytes < 0
                        ? "text-red-400 font-bold"
                        : "text-[#8d9ab2]"
                    }
                  >
                    {formatDeltaBytes(t.delta_bytes)}
                  </span>
                  <span className="text-[#627088]">
                    {new Date(t.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Pricing FAQ */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#4d6fff]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#8d9ab2]">
          <div className="rounded-2xl bg-[#161a26] p-4 border border-[#20273a]">
            <h4 className="font-bold text-white mb-1">Is pricing per user or per workspace?</h4>
            <p className="leading-relaxed">
              All plans are <b>per workspace</b>! You do not need to purchase separate accounts for every editor. Each tier includes internal member seats, and external client reviewers are always 100% free with no account required.
            </p>
          </div>

          <div className="rounded-2xl bg-[#161a26] p-4 border border-[#20273a]">
            <h4 className="font-bold text-white mb-1">Can clients review without an account?</h4>
            <p className="leading-relaxed">
              <b>Yes!</b> Just like Frame.io, you can generate secure review portal links. Clients open the video player, leave frame-accurate timestamp feedback, and click &quot;Approve&quot; without signing up.
            </p>
          </div>

          <div className="rounded-2xl bg-[#161a26] p-4 border border-[#20273a]">
            <h4 className="font-bold text-white mb-1">How do storage add-ons work?</h4>
            <p className="leading-relaxed">
              If you run out of bucket space but do not need more editor seats, you can add 250 GB, 500 GB, 1 TB, or 2 TB recurring add-ons. They automatically stack on top of your base plan quota.
            </p>
          </div>

          <div className="rounded-2xl bg-[#161a26] p-4 border border-[#20273a]">
            <h4 className="font-bold text-white mb-1">Can I pay in BDT using bKash/Nagad?</h4>
            <p className="leading-relaxed">
              Yes. International users can pay with Credit/Debit Cards via Paddle in USD, and creators in Bangladesh can upgrade instantly via bKash or Nagad.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        workspace={workspace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialAddon={isAddonModal}
        onSuccess={(updated) => {
          setWorkspace(updated);
          refreshStats();
        }}
      />
    </div>
  );
}
