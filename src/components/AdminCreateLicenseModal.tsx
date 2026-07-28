"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCreateLicenseModal({ plans }: { plans: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [maxDevices, setMaxDevices] = useState(1);
  const [isPromotion, setIsPromotion] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !planId) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/issue-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          planId,
          maxDevices,
          isPromotion,
        }),
      });
      const json = await res.json();
      setBusy(false);

      if (!res.ok) {
        setMsg({ text: json.error ?? "Failed to generate key.", ok: false });
      } else {
        setMsg({ text: `Success! Created key: ${json.key}`, ok: true });
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          router.refresh();
        }, 2000);
      }
    } catch {
      setBusy(false);
      setMsg({ text: "Network error. Please try again.", ok: false });
    }
  }

  const seen = new Set<string>();
  const formattedPlans = (plans ?? [])
    .map((p: any) => {
      const isPrecomp =
        p.slug?.includes("v111") ||
        p.slug?.includes("legacy") ||
        p.name?.includes("Precomp") ||
        p.name?.includes("Legacy");
      const cleanName = isPrecomp ? "CompX Precomp Manager" : "Orbit Studio";
      const cleanPrice = isPrecomp ? 1 : 2;
      return {
        ...p,
        cleanName,
        cleanPrice,
      };
    })
    .filter((p: any) => {
      if (seen.has(p.cleanName)) return false;
      seen.add(p.cleanName);
      return true;
    });

  return (
    <>
      <button
        type="button"
        className="btn-primary flex items-center gap-2 text-xs font-black"
        onClick={() => setOpen(true)}
      >
        <span>＋</span> Issue New License Key
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border border-[#45c66d]/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">Issue Manual License Key</h3>
              <button
                type="button"
                className="text-sm font-bold text-gray-400 hover:text-white"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="label mb-1 block text-xs">Customer Email</label>
                <input
                  type="email"
                  className="input text-xs"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label mb-1 block text-xs">Product / Plan</label>
                <select
                  className="input text-xs font-bold"
                  value={`${planId}|${isPromotion}`}
                  onChange={(e) => {
                    const [id, promo] = e.target.value.split("|");
                    setPlanId(id);
                    setIsPromotion(promo === "true");
                  }}
                  required
                >
                  <optgroup label="Global Pay (USD)">
                    {formattedPlans.map((p: any) => (
                      <option key={`${p.id}|false|usd`} value={`${p.id}|false`}>
                        {p.cleanName} (${p.cleanPrice})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Local Pay (BDT)">
                    {formattedPlans.map((p: any) => (
                      <option key={`${p.id}|false|bdt`} value={`${p.id}|false`}>
                        {p.cleanName} ({p.cleanPrice === 1 ? 129 : 249}৳)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Promotions / Free">
                    {formattedPlans.map((p: any) => (
                      <option key={`${p.id}|true`} value={`${p.id}|true`}>
                        {p.cleanName} (Promotion / Free)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="label mb-1 block text-xs">Allowed Devices</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="input text-xs"
                  value={maxDevices}
                  onChange={(e) => setMaxDevices(Number(e.target.value))}
                  required
                />
              </div>



              {msg && (
                <div
                  className={`rounded-lg p-3 text-xs font-bold ${
                    msg.ok
                      ? "border border-[#45c66d]/30 bg-[#45c66d]/10 text-[#9cf0b4]"
                      : "border border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-xs"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-black"
                  disabled={busy}
                >
                  {busy ? "Generating…" : "Generate Key 🔑"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
