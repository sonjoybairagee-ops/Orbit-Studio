"use client";

import { useState } from "react";
import { X, Zap, Check, AlertCircle, Loader2, CreditCard, Smartphone } from "lucide-react";
import { Workspace } from "@/types/agency";

interface UpgradePlanModalProps {
  workspace: Workspace;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedWs: Workspace) => void;
}

const TIERS = [
  { id: "starter", name: "Production Starter", gb: 25, bdt: 2000, usd: 19 },
  { id: "pro", name: "Studio Pro", gb: 100, bdt: 5000, usd: 49, popular: true },
  { id: "agency", name: "Enterprise Agency", gb: 500, bdt: 15000, usd: 149 },
];

export function UpgradePlanModal({
  workspace,
  isOpen,
  onClose,
  onSuccess,
}: UpgradePlanModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>("pro");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [txnRef, setTxnRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const currentTierObj = TIERS.find((t) => t.id === selectedTier) || TIERS[1];
  const bkashNumber = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01833946001";

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
          targetTier: selectedTier,
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
    } catch (err: any) {
      setError(err.message || "Failed to process upgrade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8da194] hover:text-[#e7eee9] p-1.5 rounded-lg hover:bg-[#102a16]"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-base sm:text-lg font-black text-[#e7eee9] flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#3cff5f]" />
          <span>Scale Agency OS Storage &amp; Team</span>
        </h2>
        <p className="text-xs text-[#8da194] mt-1 mb-4">
          Select an agency tier to expand Cloudflare R2 bucket quota and unlock multi-editor seats.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpgrade} className="space-y-4">
          {/* Tier Selection Radio */}
          <div className="grid grid-cols-3 gap-2.5">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === tier.id
                    ? "border-[#3cff5f] bg-[#102a16] shadow-md shadow-[#3cff5f]/15"
                    : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/40"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-1.5 py-0.2 text-[8px] font-bold text-[#050a08]">
                    POPULAR
                  </span>
                )}
                <p className="text-xs font-bold text-[#e7eee9] truncate">{tier.name.split(" ")[0]}</p>
                <p className="text-sm font-black text-[#3cff5f] mt-1">{tier.gb} GB</p>
                <p className="text-[10px] text-[#8da194] mt-0.5 font-mono">
                  ${tier.usd} / {tier.bdt} ৳
                </p>
              </button>
            ))}
          </div>

          {/* Payment Method Tabs */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-3">
            <label className="block text-xs font-bold text-[#8da194]">Choose Payment Channel:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bkash", label: "bKash" },
                { id: "nagad", label: "Nagad" },
                { id: "card", label: "Card / Int'l" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    paymentMethod === m.id
                      ? "bg-[#3cff5f] text-[#050a08]"
                      : "bg-[#0c1510] border border-[#213026] text-[#8da194] hover:text-[#e7eee9]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === "bkash" || paymentMethod === "nagad" ? (
              <div className="rounded-xl border border-[#2a5234] bg-[#102a16] p-3 text-xs text-[#e7eee9] space-y-1">
                <p>
                  Send <strong className="text-[#3cff5f]">{currentTierObj.bdt} ৳</strong> via {paymentMethod.toUpperCase()} (Send Money):
                </p>
                <p className="font-mono text-sm font-black text-[#3cff5f]">{bkashNumber}</p>
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-[#8da194] mb-1">
                    Enter TrxID / Transaction Reference:
                  </label>
                  <input
                    type="text"
                    required
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder="e.g. BL99X1Z..."
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs font-mono text-[#3cff5f] focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#213026] bg-[#0c1510] p-3 text-xs text-[#8da194]">
                Direct Card checkout via Paddle (${currentTierObj.usd} USD / month). Click below to activate.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b2720]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#8da194] hover:text-[#e7eee9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-[#3cff5f]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Activating Plan...</span>
                </>
              ) : (
                <span>Activate {currentTierObj.name} ({currentTierObj.gb} GB)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
