"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function BanUserButton({ userId, isBanned }: { userId: string; isBanned?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleBanToggle() {
    const action = isBanned ? "unban" : "ban";
    if (!isBanned && !confirm("Are you sure you want to ban this user permanently?")) return;
    if (isBanned && !confirm("Are you sure you want to unban this user?")) return;
    
    setBusy(true);
    const endpoint = isBanned ? "/api/admin/unban-user" : "/api/admin/ban-user";
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setBusy(false);
    
    if (!res.ok) {
      const data = await res.json();
      alert(`Failed to ${action} user: ` + (data.error || "Unknown error"));
    } else {
      alert(`User has been ${isBanned ? "unbanned" : "banned"} successfully.`);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleBanToggle}
      disabled={busy}
      className={`rounded px-2 py-1 text-[10px] font-medium disabled:opacity-50 ${
        isBanned 
          ? "bg-slate-600/20 border border-slate-500/50 text-slate-400 hover:bg-slate-600/40"
          : "bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/40"
      }`}
      title={isBanned ? "Unban User" : "Ban User"}
    >
      {busy ? "..." : (isBanned ? "Unban" : "Ban")}
    </button>
  );
}
