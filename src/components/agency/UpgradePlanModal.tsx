"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  Check,
  AlertCircle,
  Loader2,
  CreditCard,
  Smartphone,
  HardDrive,
  Users,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { Workspace } from "@/types/agency";
import { AGENCY_PLANS, STORAGE_ADDONS } from "@/lib/agency/pricing-config";

interface UpgradePlanModalProps {
  workspace: Workspace;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWs: Workspace) => void;
  initialAddon?: boolean;
}

export function UpgradePlanModal({
  workspace,
  isOpen,
  onClose,
  onSuccess,
  initialAddon = false,
}: UpgradePlanModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "agency">("pro");
  const [selectedAddon, setSelectedAddon] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"plan" | "addon">(initialAddon ? "addon" : "plan");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bkash" | "nagad">("card");
  const [txnRef, setTxnRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const planList = [AGENCY_PLANS.starter, AGENCY_PLANS.pro, AGENCY_PLANS.agency];
  const currentTierObj = AGENCY_PLANS[selectedTier];
  const bkashNumber = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01833946001";

  // Calculate pricing based on billing cycle
  const getPriceUSD = (p: typeof currentTierObj) => {
    return billingCycle === "annual" ? p.priceAnnualMonthlyEquivalentUSD : p.priceMonthlyUSD;
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/agency/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          targetTier: activeTab === "plan" ? selectedTier : undefined,
          billingCycle,
          addonId: activeTab === "addon" ? selectedAddon : undefined,
          paymentMethod,
          txnRef: txnRef.trim() || `ACT-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade workspace plan.");
      }

      onSuccess(data.workspace);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process upgrade";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl rounded-3xl border border-[#23293c] bg-[#121520] p-6 sm:p-8 shadow-2xl relative text-[#e7eee9] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#637089] hover:text-white p-1 rounded-lg hover:bg-[#1a2030] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1b2234] border border-[#2b354d] px-3 py-1 text-xs font-semibold text-[#4d6fff] mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CompX Orbit Agency OS · Entitlements</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Scale Your Agency Workspace
          </h2>
          <p className="text-xs text-[#8d9ab2] mt-1">
            Low entry pricing, unlimited client review portals, and high-speed Cloudflare R2 storage.
          </p>
        </div>

        {/* Plan vs Storage Add-on Switcher */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1f2537]">
          <div className="flex items-center rounded-xl bg-[#171b28] border border-[#262f44] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("plan")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "plan"
                  ? "bg-[#4d6fff] text-white shadow-sm"
                  : "text-[#8d9ab2] hover:text-white"
              }`}
            >
              Subscription Plans
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("addon")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "addon"
                  ? "bg-[#4d6fff] text-white shadow-sm"
                  : "text-[#8d9ab2] hover:text-white"
              }`}
            >
              Storage Add-ons
            </button>
          </div>

          {/* Annual vs Monthly Toggle */}
          {activeTab === "plan" && (
            <div className="flex items-center gap-2">
              <span className={`text-xs ${billingCycle === "monthly" ? "text-white font-bold" : "text-[#7584a0]"}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "annual" ? "monthly" : "annual")}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  billingCycle === "annual" ? "bg-[#4d6fff]" : "bg-[#252c3f]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs flex items-center gap-1 ${billingCycle === "annual" ? "text-white font-bold" : "text-[#7584a0]"}`}>
                <span>Annual</span>
                <span className="rounded-full bg-[#1b2b20] border border-[#2a4d32] px-1.5 py-0.2 text-[10px] text-[#3cff5f] font-mono">
                  Save 20%
                </span>
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpgrade} className="space-y-6">
          {activeTab === "plan" ? (
            /* 3 Plan Cards */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {planList.map((plan) => {
                const isSelected = selectedTier === plan.id;
                const price = getPriceUSD(plan);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id as any)}
                    className={`rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between relative border ${
                      isSelected
                        ? "border-[#4d6fff] bg-[#1a1f30] shadow-xl shadow-[#4d6fff]/15"
                        : "border-[#202638] bg-[#141724] hover:border-[#353f56]"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-[#4d6fff] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider shadow-md">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                      <p className="text-[11px] text-[#78859e] mt-0.5">{plan.bestFor}</p>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">${price}</span>
                        <span className="text-xs text-[#78859e]">/mo</span>
                      </div>
                      {billingCycle === "annual" && (
                        <p className="text-[10px] text-[#4d6fff] mt-0.5">
                          Billed ${plan.priceAnnualTotalUSD}/yr
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-[#20273a] space-y-2 text-xs text-[#a2aec4]">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-3.5 w-3.5 text-[#3cff5f] shrink-0" />
                          <span className="font-bold text-white">{plan.storageGB} GB</span>
                          <span className="text-[11px] text-[#707e99]">Storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-[#4d6fff] shrink-0" />
                          <span className="font-bold text-white">{plan.membersIncluded}</span>
                          <span className="text-[11px] text-[#707e99]">Members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-3.5 w-3.5 text-[#ff8e72] shrink-0" />
                          <span className="font-bold text-white">
                            {plan.activeProjectsLimit > 0 ? `${plan.activeProjectsLimit}` : "Unlimited"}
                          </span>
                          <span className="text-[11px] text-[#707e99]">Projects</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3">
                      <div
                        className={`w-full py-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-[#4d6fff] text-white"
                            : "bg-[#1c2234] text-[#8d9ab2]"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Storage Add-ons Table */
            <div className="space-y-3">
              <p className="text-xs text-[#8d9ab2]">
                Need more storage without changing your team size? Add extra Cloudflare R2 capacity to your workspace:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STORAGE_ADDONS.map((addon) => {
                  const isSelected = selectedAddon === addon.id;
                  return (
                    <div
                      key={addon.id}
                      onClick={() => setSelectedAddon(addon.id)}
                      className={`rounded-2xl p-4 text-center cursor-pointer border transition-all ${
                        isSelected
                          ? "border-[#3cff5f] bg-[#142319] shadow-lg shadow-[#3cff5f]/15"
                          : "border-[#202638] bg-[#141724] hover:border-[#353f56]"
                      }`}
                    >
                      <HardDrive className={`h-5 w-5 mx-auto mb-2 ${isSelected ? "text-[#3cff5f]" : "text-[#707e99]"}`} />
                      <h4 className="text-sm font-bold text-white">{addon.name}</h4>
                      <p className="text-base font-black text-white mt-1">${addon.priceMonthlyUSD}<span className="text-xs font-normal text-[#707e99]">/mo</span></p>
                      <p className="text-[10px] text-[#707e99] mt-0.5">{addon.priceMonthlyBDT} ৳</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="rounded-2xl bg-[#161a26] border border-[#22293c] p-4 space-y-3">
            <label className="block text-xs font-bold text-[#8d9ab2]">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-[#4d6fff] bg-[#1e2438] text-white"
                    : "border-[#262f44] bg-[#121520] text-[#7584a0] hover:text-white"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Card (Paddle)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bkash")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "bkash"
                    ? "border-[#e2136e] bg-[#e2136e]/15 text-[#e2136e]"
                    : "border-[#262f44] bg-[#121520] text-[#7584a0] hover:text-white"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>bKash (BD)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("nagad")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === "nagad"
                    ? "border-[#f7941d] bg-[#f7941d]/15 text-[#f7941d]"
                    : "border-[#262f44] bg-[#121520] text-[#7584a0] hover:text-white"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Nagad (BD)</span>
              </button>
            </div>

            {/* bKash/Nagad instructions */}
            {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
              <div className="pt-2 border-t border-[#20273a] space-y-2 text-xs text-[#8d9ab2]">
                <p>
                  Send <b>{currentTierObj.priceMonthlyBDT} BDT</b> to Personal/Merchant Number:{" "}
                  <code className="text-white font-mono bg-black/40 px-2 py-0.5 rounded border border-[#2b354d]">
                    {bkashNumber}
                  </code>
                </p>
                <input
                  type="text"
                  placeholder="Enter Transaction TrxID (e.g. BL92A829)"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full rounded-xl bg-[#121520] border border-[#262f44] px-3.5 py-2 text-xs text-white placeholder-[#505c75] focus:border-[#4d6fff] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#7584a0] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#4d6fff] hover:bg-[#5f7eff] text-white text-xs font-black shadow-lg shadow-[#4d6fff]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {activeTab === "plan"
                  ? `Activate ${currentTierObj.name} ($${getPriceUSD(currentTierObj)}/mo)`
                  : "Activate Storage Add-on"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
