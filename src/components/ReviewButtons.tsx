"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewButtons({
  endpoint,
  payloadKey,
  id,
}: {
  endpoint: string;
  payloadKey: string;
  id: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showHoldInput, setShowHoldInput] = useState(false);
  const [holdReason, setHoldReason] = useState("");

  async function act(action: "approve" | "reject" | "reject_ban" | "hold", reason?: string) {
    if (action === "reject_ban" && !confirm("Are you sure you want to ban this user permanently?")) return;
    setBusy(true);
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [payloadKey]: id, action, ...(reason ? { holdReason: reason } : {}) }),
    });
    setBusy(false);
    setShowHoldInput(false);
    setHoldReason("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => act("approve")}
          className="rounded bg-emerald-600 px-3 py-1 text-sm font-bold text-white disabled:opacity-50 hover:bg-emerald-500"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => setShowHoldInput(!showHoldInput)}
          className="rounded border border-orange-500/50 bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-400 disabled:opacity-50 hover:bg-orange-500/40"
        >
          Hold
        </button>
        <button
          disabled={busy}
          onClick={() => act("reject")}
          className="rounded border border-slate-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50 hover:bg-white/5"
        >
          Reject
        </button>
        <button
          disabled={busy}
          onClick={() => act("reject_ban")}
          className="rounded bg-red-600/20 border border-red-500/50 px-3 py-1 text-sm font-medium text-red-400 disabled:opacity-50 hover:bg-red-600/40"
          title="Reject order and ban user account"
        >
          Ban User
        </button>
      </div>
      {showHoldInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
            placeholder="Hold reason (e.g. Paid 150/249 Tk)"
            className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && holdReason.trim()) act("hold", holdReason.trim());
            }}
          />
          <button
            disabled={busy || !holdReason.trim()}
            onClick={() => act("hold", holdReason.trim())}
            className="rounded bg-orange-500 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-orange-400"
          >
            {busy ? "..." : "Confirm Hold"}
          </button>
        </div>
      )}
    </div>
  );
}
