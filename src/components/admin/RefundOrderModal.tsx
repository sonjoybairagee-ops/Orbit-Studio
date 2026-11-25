"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RefundableOrder {
  id: string;
  amount: number;
  currency: string;
  method: string;
  txn_ref?: string | null;
  profiles?: { email?: string | null; full_name?: string | null } | null;
  plans?: { name?: string | null } | null;
}

interface RefundOrderModalProps {
  order: RefundableOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ACCOUNT_OPTIONS = [
  {
    id: "bKash",
    label: "bKash",
    color: "border-[#e2136e] bg-[#e2136e]/15 text-[#ff6ca5]",
    activeRing: "ring-[#e2136e]",
    icon: "📱",
  },
  {
    id: "Nagad",
    label: "Nagad",
    color: "border-[#f6921e] bg-[#f6921e]/15 text-[#f6921e]",
    activeRing: "ring-[#f6921e]",
    icon: "⚡",
  },
  {
    id: "Paddle",
    label: "Paddle (USD)",
    color: "border-blue-500 bg-blue-500/15 text-blue-300",
    activeRing: "ring-blue-500",
    icon: "💳",
  },
  {
    id: "Bank",
    label: "Bank",
    color: "border-emerald-500 bg-emerald-500/15 text-emerald-300",
    activeRing: "ring-emerald-500",
    icon: "🏦",
  },
  {
    id: "Other",
    label: "Other Wallet",
    color: "border-gray-500 bg-gray-500/15 text-gray-300",
    activeRing: "ring-gray-400",
    icon: "🪙",
  },
];

export function RefundOrderModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: RefundOrderModalProps) {
  const router = useRouter();

  // Initial account selection based on customer's payment method
  const initialAccount =
    order?.method?.toLowerCase() === "nagad"
      ? "Nagad"
      : order?.method?.toLowerCase() === "paddle"
        ? "Paddle"
        : "bKash";

  const [account, setAccount] = useState<string>(initialAccount);
  const [amount, setAmount] = useState<string>(order ? String(order.amount) : "");
  const [reason, setReason] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const customerEmail =
    (order.profiles as any)?.email || (order.profiles as any)?.[0]?.email || "Customer";
  const planName =
    (order.plans as any)?.name || (order.plans as any)?.[0]?.name || "Extension License";
  const currency = order.currency || (account === "Paddle" ? "USD" : "BDT");

  async function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setError(null);

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid positive refund amount.");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to refund ${currency} ${numAmount} via ${account}?\n\nThis will revoke the customer's license, block all active devices, and deduct ${currency} ${numAmount} from ${account} in your Ledger.`,
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/refund-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          account,
          amount: numAmount,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      alert(`✓ Refund successful!\n\n${currency} ${numAmount} deducted from ${account} in Ledger.\nCustomer license revoked and hidden from dashboard.`);
      onClose();
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to process refund. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0e1411] p-6 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 text-sm font-bold">
                ↩
              </span>
              <h2 className="text-xl font-black text-white">Refund Customer Order</h2>
            </div>
            <p className="mt-1 text-xs text-[#8c97a8]">
              Process refund, deduct from Ledger, and deactivate license.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Order Info Card */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#8c97a8]">Customer:</span>
            <span className="font-semibold text-white">{customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c97a8]">Plan:</span>
            <span className="font-semibold text-emerald-400">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8c97a8]">Original Payment:</span>
            <span className="font-mono font-bold text-white">
              {order.currency} {order.amount} ({order.method?.toUpperCase()})
            </span>
          </div>
          {order.txn_ref && (
            <div className="flex justify-between">
              <span className="text-[#8c97a8]">Original Txn ID:</span>
              <span className="font-mono text-amber-300">{order.txn_ref}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleRefundSubmit} className="mt-5 space-y-4">
          {/* Account Selector */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">
              Select Refund Payment Account:
              <span className="block font-normal text-[11px] text-[#8c97a8]">
                Which account/wallet did you send this refund from? (Deducted from Ledger balance)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCOUNT_OPTIONS.map((opt) => {
                const isSelected = account === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAccount(opt.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                      opt.color
                    } ${
                      isSelected
                        ? `ring-2 ${opt.activeRing} scale-[1.02] shadow-md`
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refund Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-white">
                Refund Amount ({currency}):
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(order.amount))}
                className="text-[11px] font-semibold text-[#45c66d] hover:underline"
              >
                Set Full Amount ({order.amount})
              </button>
            </div>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 font-mono text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder={`Enter refund amount in ${currency}`}
            />
          </div>

          {/* Refund Note / Reason */}
          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Refund Note / Trx ID (Optional):
            </label>
            <input
              type="text"
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:border-rose-500 focus:outline-none"
              placeholder="e.g. bKash TrxID: 9X8Y7Z or customer changed mind"
            />
          </div>

          {/* Warning summary */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[11px] text-rose-200/90 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-rose-300">
              ⚠️ Automatic Actions upon Confirmation:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-white/80">
              <li>License key revoked &amp; all active devices blocked</li>
              <li>License system completely hidden from customer dashboard</li>
              <li>
                <strong className="text-white">
                  {currency} {amount || 0}
                </strong>{" "}
                will be deducted from{" "}
                <strong className="text-white">{account}</strong> in the Finance Ledger
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                `Confirm Refund (${currency} ${amount || 0})`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
