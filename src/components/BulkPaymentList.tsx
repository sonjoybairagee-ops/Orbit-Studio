"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewButtons } from "./ReviewButtons";

export function BulkPaymentList({ orders }: { orders: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ approved: number; failed: number } | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selected.length === 0) return;
    if (selected.length > 50) {
      alert("You can only approve up to 50 payments at a time.");
      return;
    }
    const confirmed = confirm(`Are you sure you want to approve ${selected.length} payments?`);
    if (!confirmed) return;

    setBusy(true);
    setResults(null);
    try {
      const res = await fetch("/api/admin/bulk-approve-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to bulk approve");
      setResults({ approved: data.approved?.length ?? 0, failed: data.failed?.length ?? 0 });
      setSelected([]);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {results && (
        <div className="card border-[#45c66d] bg-[#45c66d]/10 p-4 text-[#45c66d]">
          <b>Bulk action complete!</b>
          <p className="mt-1 text-sm">
            Successfully approved {results.approved} payments. Failed: {results.failed}.
          </p>
        </div>
      )}

      {orders.map((o) => (
        <label
          key={o.id}
          className={`card flex cursor-pointer flex-col justify-between gap-5 p-5 transition-colors hover:border-white/20 sm:flex-row sm:items-center ${
            selected.includes(o.id) ? "border-[#45c66d]/50 bg-[#45c66d]/5" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            {o.status === "pending" && (
              <input
                type="checkbox"
                className="mt-1.5 h-5 w-5 accent-[#45c66d]"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <b>{o.plans?.name}</b>
                <span
                  className={`badge ${
                    o.status === "approved"
                      ? "badge-green"
                      : o.status === "pending"
                        ? "badge-amber"
                        : ""
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <p className="muted mt-2 text-sm">{o.profiles?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge">
                  {o.currency} {o.amount}
                </span>
                <span className="badge">Txn: {o.txn_ref ?? "—"}</span>
                <span className="badge">{o.method}</span>
                {o.receipt_path && (
                  <a
                    className="badge badge-amber hover:text-white"
                    href={`/api/admin/receipt?path=${encodeURIComponent(o.receipt_path)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View receipt ↗
                  </a>
                )}
              </div>
            </div>
          </div>
          {o.status === "pending" && (
            <div onClick={(e) => e.preventDefault()}>
              <ReviewButtons
                endpoint="/api/admin/approve-order"
                payloadKey="orderId"
                id={o.id}
              />
            </div>
          )}
        </label>
      ))}

      {orders.length === 0 && (
        <div className="card grid min-h-52 place-items-center text-center">
          <div>
            <div className="text-3xl">✓</div>
            <b className="mt-3 block">Queue is clear</b>
            <p className="muted mt-1 text-sm">No payments found.</p>
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 flex w-full max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl backdrop-blur-xl">
          <div>
            <b className="block">{selected.length} selected</b>
            <span className="muted text-xs">Ready for bulk approval</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected([])}
              className="rounded px-4 py-2 text-sm font-medium hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? "Processing..." : `Approve ${selected.length}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
