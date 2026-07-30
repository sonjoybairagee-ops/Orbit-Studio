"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BanUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleBan() {
    if (!confirm("Are you sure you want to ban this user permanently?")) return;
    setBusy(true);
    const res = await fetch("/api/admin/ban-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      alert("Failed to ban user: " + (data.error || "Unknown error"));
    } else {
      alert("User has been banned successfully.");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleBan}
      disabled={busy}
      className="rounded bg-red-600/20 border border-red-500/50 px-2 py-1 text-[10px] font-medium text-red-400 disabled:opacity-50 hover:bg-red-600/40"
      title="Ban User"
    >
      {busy ? "..." : "Ban"}
    </button>
  );
}
