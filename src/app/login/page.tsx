"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton, AuthDivider } from "@/components/GoogleButton";
import { Login3DStage } from "@/components/Login3DStage";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // /auth/callback redirects here with ?error=... when OAuth or a
  // confirmation link fails.
  useEffect(() => {
    const fromCallback = searchParams.get("error");
    if (fromCallback) setError(fromCallback);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="shell grid min-h-[calc(100vh-150px)] items-center gap-12 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0e1218] p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#45c66d]/10 to-transparent" />
          <div className="relative">
            <span className="badge badge-green">
              <span className="live-dot" /> Secure license portal
            </span>
            <h1 className="mt-8 max-w-lg text-5xl font-black tracking-[-.04em]">
              Your creative tools, always within reach.
            </h1>
            <p className="muted mt-4 max-w-md leading-7">
              Manage licenses, devices and downloads from one focused workspace.
            </p>

            {/* ── 3D Camera Extension Animation Stage ── */}
            <div className="mt-8">
              <Login3DStage />
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-[430px]">
        <p className="eyebrow">Welcome back</p>
        <h2 className="mt-2 text-4xl font-black tracking-tight">
          Sign in to CompX
        </h2>
        <p className="muted mt-3">
          Access your extensions, licenses and downloads.
        </p>

        <div className="mt-8">
          <GoogleButton next="/dashboard" />
        </div>
        <AuthDivider />
        {error && (
          <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <div className="space-y-5">
          <label>
            <span className="label">Email address</span>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <div className="flex items-baseline justify-between">
              <span className="label">Password</span>
              <Link
                href="/forgot-password"
                className="mb-2 text-xs font-bold text-[#45c66d] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7f8796] hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Signing in…" : "Sign in →"}
          </button>
        </div>
        <p className="muted mt-6 text-center text-sm">
          New to CompX?{" "}
          <Link href="/signup" className="font-bold text-[#45c66d]">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

// useSearchParams needs a Suspense boundary for static rendering.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="shell grid min-h-[60vh] place-items-center">
          <p className="muted">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
