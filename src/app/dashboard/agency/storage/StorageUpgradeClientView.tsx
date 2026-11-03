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
} from "lucide-react";
import { Workspace } from "@/types/agency";
import { UpgradePlanModal } from "@/components/agency/UpgradePlanModal";
import { AGENCY_PLANS, STORAGE_ADDONS } from "@/lib/agency/pricing-config";

interface StorageUpgradeClientViewProps {
  initialWorkspace: Workspace;
}

export function StorageUpgradeClientView({ initialWorkspace }: StorageUpgradeClientViewProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddonModal, setIsAddonModal] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const usedMB = (workspace.storage_used_bytes / (1024 * 1024)).toFixed(0);
  const totalGB = (workspace.storage_quota_bytes / (1024 * 1024 * 1024)).toFixed(0);
  const usedPercent = Math.min(
    100,
    Math.round((workspace.storage_used_bytes / workspace.storage_quota_bytes) * 100) || 0
  );

  const planList = [
    AGENCY_PLANS.free,
    AGENCY_PLANS.starter,
    AGENCY_PLANS.pro,
    AGENCY_PLANS.agency,
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-[#e7eee9]">
      {/* 1. Header & Live Storage Meter */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#4d6fff]/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1c2234]">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1b2234] border border-[#2b354d] px-3 py-0.5 text-[10px] font-mono text-[#4d6fff] uppercase tracking-wider">
                CURRENT PLAN: {workspace.plan_tier.toUpperCase()}
              </span>
              <span className="text-xs text-[#78859e]">
                · Workspace: {workspace.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Storage Management &amp; Entitlements
            </h1>
            <p className="text-xs sm:text-sm text-[#8d9ab2] mt-1 max-w-xl">
              Monitor Cloudflare R2 object storage usage and scale team collaboration seats as your client roster grows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddonModal(false);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4d6fff] hover:bg-[#5f7eff] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-lg shadow-[#4d6fff]/25 cursor-pointer self-start md:self-auto"
          >
            <Zap className="h-4 w-4" />
            <span>Upgrade Workspace Plan</span>
          </button>
        </div>

        {/* Live Gauge Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#3cff5f]" />
              <span>{usedMB} MB Used</span>
            </span>
            <span className="text-[#8d9ab2]">
              {totalGB} GB Allocated ({usedPercent}% consumed)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-[#1a2030] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedPercent > 85 ? "bg-red-500" : usedPercent > 60 ? "bg-yellow-400" : "bg-[#3cff5f]"
              }`}
              style={{ width: `${Math.max(2, usedPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Billing Cycle Switcher */}
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

      {/* 3. 4 Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {planList.map((plan) => {
          const isCurrent = workspace.plan_tier === plan.id;
          const price = billingCycle === "annual" ? plan.priceAnnualMonthlyEquivalentUSD : plan.priceMonthlyUSD;

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

                {/* Primary Specs */}
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

                {/* Feature Checklist */}
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

      {/* 4. Storage Add-ons Section */}
      <div className="rounded-3xl border border-[#22293c] bg-[#121520] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <button
            type="button"
            onClick={() => {
              setIsAddonModal(true);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d2720] border border-[#2d4734] text-[#3cff5f] text-xs font-bold hover:bg-[#25382b] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Extra Storage</span>
          </button>
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
                <p className="text-base font-black text-white">${addon.priceMonthlyUSD}<span className="text-xs font-normal text-[#707e99]">/mo</span></p>
                <p className="text-[10px] text-[#707e99]">{addon.priceMonthlyBDT} ৳</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Pricing Strategy FAQ */}
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
        onSuccess={(updated) => setWorkspace(updated)}
      />
    </div>
  );
}
