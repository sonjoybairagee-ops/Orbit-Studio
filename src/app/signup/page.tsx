"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton, AuthDivider } from "@/components/GoogleButton";
import { SignupAudioStage } from "@/components/SignupAudioStage";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data: authData, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (!error && authData?.user) {
      // Trigger Resend confirmation email via API route
      try {
        await fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            firstName: fullName.trim() || email.split("@")[0],
            token: authData.user.id,
          }),
        });
      } catch (e) {
        console.error("Failed to send custom confirmation email:", e);
      }
    }

    setBusy(false);
    setMsg(
      error
        ? error.message
        : "Account created. Check your email to confirm your account.",
    );
  }

  return (
    <div className="shell grid min-h-[calc(100vh-150px)] items-center gap-14 py-14 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <span className="badge badge-amber">⚡ Start in under 2 minutes</span>
        <h1 className="mt-6 text-5xl font-black tracking-[-.045em]">
          One account for every CompX extension.
        </h1>
        <p className="muted mt-4 max-w-xl text-base leading-7">
          Buy, activate, download and manage all current and future CompX
          products from a single secure dashboard.
        </p>

        {/* ── Real-Time Interactive Orbit Audio Waveform & SFX Stage ── */}
        <div className="mt-7">
          <SignupAudioStage />
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="card mx-auto w-full max-w-[480px] p-7 sm:p-9"
      >
        <p className="eyebrow">Create account</p>
        <h2 className="mt-2 text-3xl font-black">Join CompX Orbit</h2>

        <div className="mt-7">
          <GoogleButton next="/dashboard" />
        </div>
        <AuthDivider />
        {msg && (
          <div className="mt-5 rounded-lg border border-[#45c66d]/20 bg-[#45c66d]/10 p-3 text-sm text-[#9cf0b4]">
            {msg}
          </div>
        )}
        <div className="space-y-5">
          <label>
            <span className="label">Full name</span>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>
          <label>
            <span className="label">Email address</span>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            <span className="label">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
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
            {busy ? "Creating account…" : "Create free account →"}
          </button>
        </div>
        <p className="muted mt-5 text-center text-xs leading-6">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-[#45c66d]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#45c66d]">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="muted mt-5 text-center text-sm">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#45c66d]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
