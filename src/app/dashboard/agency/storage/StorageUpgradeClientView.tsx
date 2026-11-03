"use client";

import { useState } from "react";
import { HardDrive, Zap, Check, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { Workspace } from "@/types/agency";
import { UpgradePlanModal } from "@/components/agency/UpgradePlanModal";

interface StorageUpgradeClientViewProps {
  initialWorkspace: Workspace;
}

const STORAGE_TIERS = [
  {
    tier: "free",
    name: "Free Creator",
    storageGB: 2,
    price: "$0",
    features: [
      "2 GB Cloudflare R2",
      "1 Active Workspace",
      "Up to 3 Clients",
      "Timestamp Video Reviews",
      "Standard 1080p Previews",
    ],
  },
  {
    tier: "starter",
    name: "Production Starter",
    storageGB: 25,
    price: "$19/mo (2,000 ৳)",
    features: [
      "25 GB Cloudflare R2",
      "Unlimited Clients",
      "Up to 5 Team Members",
      "Client Approval Portals",
      "Direct Large Video Uploads",
    ],
  },
  {
    tier: "pro",
    name: "Studio Pro",
    storageGB: 100,
    price: "$49/mo (5,000 ৳)",
    popular: true,
    features: [
      "100 GB Cloudflare R2",
      "Priority Streaming CDN",
      "Up to 15 Team Members",
      "Custom Agency Branding",
      "Unlimited Revisions",
    ],
  },
  {
    tier: "agency",
    name: "Enterprise Agency",
    storageGB: 500,
    price: "$149/mo (15,000 ৳)",
    features: [
      "500 GB Cloudflare R2",
      "Dedicated S3 CDN",
      "Unlimited Team Members",
      "Custom Client Domain Portals",
      "Dedicated Priority Support",
    ],
  },
];

export function StorageUpgradeClientView({ initialWorkspace }: StorageUpgradeClientViewProps) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const usedMB = (workspace.storage_used_bytes / (1024 * 1024)).toFixed(0);
  const totalGB = (workspace.storage_quota_bytes / (1024 * 1024 * 1024)).toFixed(1);
  const usedPercent = Math.min(
    100,
    Math.round((workspace.storage_used_bytes / workspace.storage_quota_bytes) * 100) || 0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <HardDrive className="h-6 w-6 text-[#3cff5f]" />
            <span>Storage Management &amp; Agency Entitlements</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Monitor your Cloudflare R2 high-speed object storage and scale quota for large client video deliveries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
        >
          <Zap className="h-4 w-4" />
          <span>Upgrade Storage Quota</span>
        </button>
      </div>

      {/* Main Storage Bar Card */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 rounded-full font-bold">
              Current Plan: {workspace.plan_tier.toUpperCase()}
            </span>
            <h2 className="text-2xl font-black text-[#e7eee9] mt-2">
              {usedMB} MB <span className="text-xs font-normal text-[#8da194]">used of {totalGB} GB ({usedPercent}%)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8da194]">Remaining Quota:</span>
            <span className="font-mono text-sm font-bold text-[#3cff5f]">
              {Math.max(0, Number(totalGB) * 1024 - Number(usedMB)).toFixed(0)} MB
            </span>
          </div>
        </div>

        <div className="h-3 w-full rounded-full bg-[#1b2720] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#168a35] to-[#3cff5f] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, usedPercent)}%` }}
          />
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#3cff5f]" />
          <span>Agency OS Storage &amp; Team Tiers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STORAGE_TIERS.map((tier) => {
            const isCurrent = workspace.plan_tier === tier.tier;
            return (
              <div
                key={tier.tier}
                className={`rounded-3xl border p-6 flex flex-col justify-between space-y-5 transition-all ${
                  isCurrent
                    ? "border-[#3cff5f] bg-[#0e1c12] shadow-xl shadow-[#3cff5f]/15"
                    : "border-[#213026] bg-[#0c1510] hover:border-[#3cff5f]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#e7eee9]">{tier.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                    {tier.popular && !isCurrent && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-xl font-black text-[#e7eee9]">{tier.price}</span>
                    <span className="text-xs text-[#8da194] ml-1">/ {tier.storageGB} GB</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-[#8da194]">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-[#3cff5f] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setIsModalOpen(true)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isCurrent
                      ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234] cursor-default"
                      : "bg-[#3cff5f] text-[#050a08] hover:bg-[#52ff71] cursor-pointer shadow-md shadow-[#3cff5f]/20 font-black"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Upgrade Storage Tier"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradePlanModal
        workspace={workspace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(updatedWs) => setWorkspace(updatedWs)}
      />
    </div>
  );
}
