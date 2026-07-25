"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The recovery link already went through /auth/callback, so a session
  // should exist. If it does not, the link was expired or already used.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(Boolean(data.user)));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Please use at least 8 characters.");
      return;
    }

    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (ready === null) {
    return (
      <div className="shell grid min-h-[60vh] place-items-center">
        <p className="muted">Checking your link…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="shell grid min-h-[calc(100vh-150px)] place-items-center py-14">
        <div className="card w-full max-w-[440px] p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-red-500/25 bg-red-500/10 text-2xl">
            !
          </div>
          <h1 className="mt-5 text-2xl font-black">This link has expired</h1>
          <p className="muted mt-3 leading-7">
            Password reset links can only be used once, and they stop working
            after one hour. Request a fresh one to continue.
          </p>
          <Link href="/forgot-password" className="btn-primary mt-7 w-full">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const eye = (
    <button
      type="button"
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7f8796] hover:text-white"
      onClick={() => setShow(!show)}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? "◉" : "◎"}
    </button>
  );

  return (
    <div className="shell grid min-h-[calc(100vh-150px)] place-items-center py-14">
      <form onSubmit={onSubmit} className="card w-full max-w-[440px] p-8">
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Choose a new password
        </h1>
        <p className="muted mt-3 leading-7">
          Pick something you have not used before. You will stay signed in on
          this device.
        </p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-7 space-y-5">
          <label>
            <span className="label">New password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="input pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                autoFocus
              />
              {eye}
            </div>
          </label>

          <label>
            <span className="label">Confirm new password</span>
            <input
              type={show ? "text" : "password"}
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              minLength={8}
              required
            />
          </label>

          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Updating…" : "Update password →"}
          </button>
        </div>
      </form>
    </div>
  );
}
