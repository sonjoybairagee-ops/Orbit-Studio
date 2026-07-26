"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnsubscribePage() {
  const params = useSearchParams();
  const email = params.get("email");
  const token = params.get("token");
  
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md card p-8 border-[#e35050]/20 bg-[#e35050]/5">
          <h1 className="text-xl font-bold text-[#e35050]">Invalid link</h1>
          <p className="mt-2 text-sm muted">This unsubscribe link is missing required parameters.</p>
        </div>
      </div>
    );
  }

  const handleUnsubscribe = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unsubscribe");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md card p-8 border-[#45c66d]/20 bg-[#45c66d]/5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#45c66d]/20 text-[#45c66d]">
            ✓
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#45c66d]">Unsubscribed successfully</h1>
          <p className="mt-2 text-sm muted">
            You will no longer receive marketing or broadcast emails from us at <b>{email}</b>.
            <br />
            Transactional emails (like license keys and receipts) will still be delivered.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md card p-8 w-full text-center">
        <h1 className="text-2xl font-black">Unsubscribe</h1>
        <p className="mt-3 text-sm muted">
          Are you sure you want to unsubscribe <b>{email}</b> from marketing emails?
        </p>
        
        {error && (
          <p className="mt-4 rounded-lg bg-[#e35050]/10 p-3 text-sm text-[#e35050]">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleUnsubscribe}
            disabled={busy}
            className="btn-primary flex justify-center py-3"
          >
            {busy ? "Processing..." : "Yes, unsubscribe me"}
          </button>
          <button
            onClick={() => window.history.back()}
            disabled={busy}
            className="rounded px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
