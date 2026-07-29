"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER ?? "01810520280";
const NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER ?? "01993825578";
const PADDLE_LIVE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "live_73bd9290c2f284764d988b1054f";
const PADDLE_PRICE_ID = "pri_01kydan5yvz9a050efd199wrjv";

export function CheckoutForm({ plan }: { plan: any }) {
  const router = useRouter();
  const [method, setMethod] = useState<"bkash" | "nagad" | "paddle">("bkash");
  const [txnRef, setTxnRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isPrecomp = plan.slug === "compx-v111" || (plan.name && plan.name.includes("Precomp"));
  const bkashBdtAmount = isPrecomp ? 129 : 249;

  const displayCurrency = (method === "bkash" || method === "nagad") ? "BDT" : (plan.currency ?? "USD");
  const displayPrice = (method === "bkash" || method === "nagad") ? bkashBdtAmount : (plan.price ?? 2);

  useEffect(() => {
    if (document.getElementById("paddle-js")) return;
    const script = document.createElement("script");
    script.id = "paddle-js";
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      const Paddle = (window as any).Paddle;
      if (!Paddle) return;
      // Set environment based on token prefix
      if (typeof Paddle.Environment?.set === "function") {
        Paddle.Environment.set(
          PADDLE_LIVE_TOKEN.startsWith("live_") ? "production" : "sandbox"
        );
      }
      // Paddle v2 uses Setup()
      if (typeof Paddle.Setup === "function") {
        Paddle.Setup({ token: PADDLE_LIVE_TOKEN });
      } else if (typeof Paddle.Initialize === "function") {
        Paddle.Initialize({ token: PADDLE_LIVE_TOKEN });
      }
    };
    document.body.appendChild(script);
  }, []);

  async function submitManualPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    let receiptUrl: string | null = null;

    if (file) {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setBusy(false);
        return setMsg("Please sign in again before uploading your receipt.");
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${authData.user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("receipts")
        .upload(path, file);
      if (error) {
        setBusy(false);
        return setMsg("Receipt upload failed: " + error.message);
      }
      receiptUrl = path;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        planId: plan.id,
        method: method,
        txnRef,
        receiptUrl,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error);
    setMsg("Payment submitted. Your license will appear after verification.");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  async function payPaddle() {
    setBusy(true);
    setMsg(null);
    const Paddle = (window as any).Paddle;
    if (!Paddle) {
      setBusy(false);
      return setMsg("Paddle is still loading. Please wait a moment and try again.");
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ planId: plan.id, method: "paddle" }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(json.error);
    // Always use official Paddle live price ID
    Paddle.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      customData: { order_id: json.order?.id ?? "manual" },
    });
  }

  return (
    <div className="shell grid gap-8 py-16 lg:grid-cols-[1.1fr_.9fr]">
      <section>
        <p className="eyebrow">Secure checkout</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Complete your license.
        </h1>
        <p className="muted mt-3 max-w-xl leading-7">
          Choose a payment option. Your license unlocks this extension only and
          appears in your unified CompX dashboard.
        </p>
        <div className="card mt-8 overflow-hidden">
          <div className="border-b border-white/[.06] bg-gradient-to-r from-[#45c66d]/10 to-transparent p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge">{plan.billing_type}</span>
                <h2 className="mt-3 text-2xl font-black">
                  {(plan.extensions?.name ?? plan.name ?? "").replace(/\s*Bundle\s*/gi, " ").trim()}
                </h2>
                <p className="muted mt-1">{(plan.name ?? "").replace(/\s*Bundle\s*/gi, " ").trim()} license</p>
              </div>
              <div className="text-right">
                <span className="muted text-xs font-bold">{displayCurrency}</span>
                <b className="block text-4xl font-black text-[#45c66d]">
                  {method === "paddle" ? `$${displayPrice}` : `${displayPrice} ৳`}
                </b>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {[
              "1 device activation",
              "Private download",
              "Dashboard access",
            ].map((x) => (
              <div key={x} className="flex gap-2 text-sm text-[#c7ccd6]">
                <span className="text-[#6ded92]">✓</span>
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-black">Payment method</h2>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            onClick={() => setMethod("bkash")}
            className={
              method === "bkash"
                ? "flex items-center justify-center gap-2 rounded-xl bg-[#e2136e] px-4 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(226,19,110,0.4)] transition-all"
                : "btn-secondary py-3 text-sm font-bold"
            }
          >
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">bKash</span>
            bKash (249 BDT)
          </button>
          <button
            onClick={() => setMethod("nagad")}
            className={
              method === "nagad"
                ? "flex items-center justify-center gap-2 rounded-xl bg-[#f6921e] px-4 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(246,146,30,0.4)] transition-all"
                : "btn-secondary py-3 text-sm font-bold"
            }
          >
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">Nagad</span>
            Nagad (249 BDT)
          </button>
          <button
            onClick={() => setMethod("paddle")}
            className={
              method === "paddle"
                ? "btn-primary py-3 text-sm font-black sm:col-span-1 col-span-2"
                : "btn-secondary py-3 text-sm font-bold sm:col-span-1 col-span-2"
            }
          >
            Global card ($2 USD)
          </button>
        </div>
        {method === "bkash" || method === "nagad" ? (
          <form onSubmit={submitManualPayment} className="mt-6 space-y-5">
            {/* Manual Send Money Awareness Notice */}
            <div className={`rounded-xl border p-4 text-sm leading-6 text-white ${method === 'bkash' ? 'border-[#e2136e]/40 bg-[#e2136e]/10 shadow-[0_0_25px_rgba(226,19,110,0.15)]' : 'border-[#f6921e]/40 bg-[#f6921e]/10 shadow-[0_0_25px_rgba(246,146,30,0.15)]'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${method === 'bkash' ? 'text-[#ff6ca5]' : 'text-[#f6921e]'}`}>
                  <span className={`inline-block h-2 w-2 rounded-full animate-ping ${method === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f6921e]'}`} />
                  ⚠️ {method === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black text-white ${method === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f6921e]'}`}>
                  PERSONAL (SEND MONEY)
                </span>
              </div>
              <p className={`text-sm font-bold leading-relaxed ${method === 'bkash' ? 'text-[#ffd4e5]' : 'text-[#fce4c8]'}`}>
                অবশ্যই {method === 'bkash' ? 'বিকাশের' : 'নগদের'} <b className={`text-white underline underline-offset-4 ${method === 'bkash' ? 'decoration-[#e2136e]' : 'decoration-[#f6921e]'}`}>Send Money (সেন্ড মানি)</b> অপশন ব্যবহার করে টাকা পাঠাবেন। (Merchant / Payment করা যাবে না)।
              </p>
              <div className={`mt-3 grid gap-2 rounded-lg border bg-black/40 p-3 sm:grid-cols-2 ${method === 'bkash' ? 'border-[#e2136e]/30' : 'border-[#f6921e]/30'}`}>
                <div>
                  <span className={`text-[11px] font-bold ${method === 'bkash' ? 'text-[#ff8ebc]' : 'text-[#fbcd9a]'}`}>{method === 'bkash' ? 'bKash' : 'Nagad'} Number:</span>
                  <p className="font-mono text-base font-black text-[#ffc36f]">{method === 'bkash' ? BKASH_NUMBER : NAGAD_NUMBER}</p>
                </div>
                <div>
                  <span className={`text-[11px] font-bold ${method === 'bkash' ? 'text-[#ff8ebc]' : 'text-[#fbcd9a]'}`}>Exact Amount:</span>
                  <p className="font-mono text-base font-black text-[#45c66d]">BDT {bkashBdtAmount} ৳</p>
                </div>
              </div>
            </div>
            <label>
              <span className="label">Transaction ID</span>
              <input
                className="input"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. BKH7X91..."
                required
              />
            </label>
            <label className="block cursor-pointer">
              <span className="label mb-2 block">Payment receipt screenshot</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="receipt-file-input"
                required={!file}
              />
              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#45c66d]/50 bg-[#45c66d]/10 p-4 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">📄</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{file.name}</p>
                      <p className="text-xs text-[#8fa896]">
                        {(file.size / 1024).toFixed(1)} KB · Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-bold text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                  >
                    ✕ Change
                  </button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#45c66d]/30 bg-black/30 p-6 text-center transition-all hover:border-[#45c66d] hover:bg-[#45c66d]/5"
                  onClick={() => document.getElementById("receipt-file-input")?.click()}
                >
                  <span className="mb-2 text-3xl text-[#45c66d]">📥</span>
                  <p className="text-sm font-bold text-white">
                    Click to upload {method === 'bkash' ? 'bKash' : 'Nagad'} payment screenshot
                  </p>
                  <p className="muted mt-1 text-xs">
                    PNG, JPG or JPEG screenshot from {method === 'bkash' ? 'bKash' : 'Nagad'} app (Max 10MB)
                  </p>
                </div>
              )}
            </label>
            <button disabled={busy} className="btn-primary w-full">
              {busy ? "Submitting…" : "Submit payment →"}
            </button>
          </form>
        ) : (
          <div className="mt-6">
            <div className="rounded-xl border border-white/[.07] bg-white/[.025] p-4 text-sm text-[#c8cdd6]">
              Pay securely by card through Paddle. Successful payments issue the
              license automatically.
            </div>
            <button
              onClick={payPaddle}
              disabled={busy}
              className="btn-primary mt-5 w-full"
            >
              {busy ? "Opening checkout…" : "Continue with Paddle →"}
            </button>
          </div>
        )}
        {msg && (
          <p className="mt-4 rounded-lg border border-[#45c66d]/20 bg-[#45c66d]/[.06] p-3 text-sm text-[#9cf0b4]">
            {msg}
          </p>
        )}
        <p className="muted mt-5 text-center text-xs">
          🔐 Payment details are never stored by CompX.
        </p>
      </section>
    </div>
  );
}
