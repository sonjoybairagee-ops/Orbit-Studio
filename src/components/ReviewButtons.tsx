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

  async function act(action: "approve" | "reject") {
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
        className="rounded bg-emerald-600 px-3 py-1 text-sm disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="rounded border border-slate-700 px-3 py-1 text-sm disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
