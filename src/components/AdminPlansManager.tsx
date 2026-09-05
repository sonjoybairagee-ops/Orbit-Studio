"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  unit_price_usd: number;
  unit_price_bdt: number;
  currency: string;
  billing_type: string;
  max_devices: number;
  is_public: boolean;
  is_active: boolean;
  plan_extensions?: Array<{ extensions?: { name: string; slug: string; host_app: string } }>;
}

export function AdminPlansManager({ plans }: { plans: PlanItem[] }) {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [bdtPrice, setBdtPrice] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const startEdit = (p: PlanItem) => {
    setEditingPlan(p);
    setName(p.name);
    setUsdPrice(p.unit_price_usd ?? p.price ?? 3);
    setBdtPrice(p.unit_price_bdt ?? Math.round((p.unit_price_usd ?? p.price ?? 3) * 120));
    setIsPublic(p.is_public);
    setIsActive(p.is_active);
    setMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan.id,
          name,
          unit_price_usd: Number(usdPrice),
          unit_price_bdt: Number(bdtPrice),
          price: Number(usdPrice),
          is_public: isPublic,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok) {
        setMsg({ text: data.error || "Failed to update plan", ok: false });
      } else {
        setMsg({ text: "Plan pricing updated successfully!", ok: true });
        setTimeout(() => {
          setEditingPlan(null);
          router.refresh();
        }, 1200);
      }
    } catch {
      setBusy(false);
      setMsg({ text: "Network error", ok: false });
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="text-lg font-black text-white">Live Pricing & Plans Database</h2>
          <p className="muted mt-1 text-xs">
            Directly configure USD / BDT prices, device slots, and store visibility.
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Plan Name / Slug</th>
              <th>Supported Apps / Ext</th>
              <th>USD Price</th>
              <th>BDT Price</th>
              <th>Max Devices</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const exts = (p.plan_extensions ?? [])
                .map((pe) => pe.extensions?.name)
                .filter(Boolean);

              return (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td>
                    <b className="text-white block">{p.name}</b>
                    <code className="text-xs font-mono text-gray-400">/{p.slug}</code>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {exts.length > 0 ? (
                        exts.map((name) => (
                          <span key={name} className="badge badge-purple text-[10px]">
                            {name?.replace("CompX Orbit Studio — ", "").replace("CompX ", "")}
                          </span>
                        ))
                      ) : (
                        <span className="muted text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="font-mono font-bold text-[#45c66d]">
                    ${p.unit_price_usd ?? p.price} USD
                  </td>
                  <td className="font-mono font-bold text-[#45c66d]">
                    ৳{p.unit_price_bdt ?? Math.round((p.unit_price_usd ?? p.price) * 120)} BDT
                  </td>
                  <td>
                    <span className="badge">
                      {p.max_devices} {p.max_devices === 1 ? "Device" : "Devices"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className={`badge ${p.is_active ? "badge-green" : "badge-amber"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                      {p.is_public && (
                        <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                          Public
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="btn-secondary px-3 py-1 text-xs font-bold hover:border-[#45c66d] hover:text-[#45c66d]"
                    >
                      Edit Price ✎
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md border border-[#45c66d]/40 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black text-white">
                Edit Plan: {editingPlan.name}
              </h3>
              <button
                type="button"
                className="text-sm font-bold text-gray-400 hover:text-white"
                onClick={() => setEditingPlan(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="label mb-1 block text-xs">Plan Title</label>
                <input
                  type="text"
                  className="input text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1 block text-xs">USD Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input text-xs font-mono font-bold"
                    value={usdPrice}
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      setUsdPrice(usd);
                      setBdtPrice(Math.round(usd * 120));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="label mb-1 block text-xs">BDT Price (৳)</label>
                  <input
                    type="number"
                    className="input text-xs font-mono font-bold"
                    value={bdtPrice}
                    onChange={(e) => setBdtPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#45c66d] h-4 w-4"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Show in Public Store
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#45c66d] h-4 w-4"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Plan Active
                </label>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  className="btn-secondary px-4 py-2 text-xs"
                  onClick={() => setEditingPlan(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs font-black"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
