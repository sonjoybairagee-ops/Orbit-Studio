"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Accepts CX-XXXX-XXXX-XXXX-XXXX and LG-XXXX-XXXX-XXXX-XXXX.
// Users paste keys out of email in every imaginable format, so we
// strip everything and re-group as they type.
function formatKey(raw: string) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean) return "";
  const prefix = clean.slice(0, 2);
  const rest = clean.slice(2, 18).match(/.{1,4}/g) ?? [];
  return [prefix, ...rest].join("-");
}

export function RedeemForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || key.trim().length < 6) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/license/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setMsg({ text: json.error ?? "Could not redeem that key.", ok: false });
      } else {
        setMsg({ text: "Licence added to your account.", ok: true });
        setKey("");
        router.refresh();
      }
    } catch {
      setMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#45c66d]/30 bg-black/30 p-3.5 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs">🔑</span>
        <p className="text-xs font-black uppercase tracking-wider text-[#45c66d]">Redeem Licence Key</p>
      </div>
      <p className="muted mt-1 text-[11px] leading-4">
        Enter the key we emailed you to add it to this account.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <input
          className="input text-xs font-mono tracking-wider py-2 px-3"
          value={key}
          onChange={(e) => setKey(formatKey(e.target.value))}
          placeholder="LG-XXXX-XXXX-XXXX-XXXX"
          maxLength={23}
          spellCheck={false}
          autoComplete="off"
          aria-label="Licence key"
        />
        <button
          type="submit"
          className="btn-primary w-full py-2 text-xs font-bold"
          disabled={busy || key.length < 6}
        >
          {busy ? "Checking..." : "Redeem Key"}
        </button>
      </div>

      {msg && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 text-xs font-bold ${msg.ok ? "text-[#65dc86]" : "text-[#ff8a8a]"}`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
