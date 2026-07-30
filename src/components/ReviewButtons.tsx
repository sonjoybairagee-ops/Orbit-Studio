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

  async function act(action: "approve" | "reject" | "reject_ban") {
    if (action === "reject_ban" && !confirm("Are you sure you want to ban this user permanently?")) return;
    setBusy(true);
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [payloadKey]: id, action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
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
  );
}
