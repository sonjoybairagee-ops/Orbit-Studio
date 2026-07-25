"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/send-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      setBusy(false);

      if (!res.ok && json.error) {
        setError(json.error);
        return;
      }
      setSent(true);
    } catch {
      setBusy(false);
      setSent(true);
    }
  }

  return (
    <div className="shell grid min-h-[calc(100vh-150px)] place-items-center py-14">
      <div className="w-full max-w-[440px]">
        {sent ? (
          <div className="card p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#45c66d]/25 bg-[#45c66d]/10 text-2xl">
              ✉
            </div>
            <h1 className="mt-5 text-2xl font-black">Check your inbox</h1>
            <p className="muted mt-3 leading-7">
              If an account exists for <b className="text-white">{email}</b>,
              we have sent a link to reset your password. The link expires in
              one hour.
            </p>
            <p className="muted mt-4 text-sm">
              Nothing arrived? Check your spam folder, or{" "}
              <button
                onClick={() => setSent(false)}
                className="font-bold text-[#45c66d]"
              >
                try another address
              </button>
              .
            </p>
            <Link href="/login" className="btn-secondary mt-7 w-full">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card p-8">
            <p className="eyebrow">Account recovery</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Forgot your password?
            </h1>
            <p className="muted mt-3 leading-7">
              Enter the email you signed up with and we will send you a link to
              choose a new password.
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <label className="mt-7 block">
              <span className="label">Email address</span>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>

            <button disabled={busy} className="btn-primary mt-6 w-full">
              {busy ? "Sending…" : "Send reset link →"}
            </button>

            <p className="muted mt-6 text-center text-sm">
              Remembered it?{" "}
              <Link href="/login" className="font-bold text-[#45c66d]">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
