"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function NewPlanForm({ extensions }: { extensions: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    extensionId: extensions[0]?.id ?? "",
    name: "Lifetime",
    price: "29",
    currency: "USD",
    billingType: "lifetime",
    paddlePriceId: "",
    features: "1 device, Lifetime updates, Secure download",
  });
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        features: form.features
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      }),
    });
    const j = await res.json();
    setMsg(res.ok ? "Pricing plan created." : j.error);
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="card p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="label">Extension</span>
          <select
            className="input"
            value={form.extensionId}
            onChange={(e) => setForm({ ...form, extensionId: e.target.value })}
          >
            {extensions.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Plan name</span>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          <span className="label">Price</span>
          <input
            type="number"
            className="input"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </label>
        <label>
          <span className="label">Currency</span>
          <input
            className="input"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </label>
        <label>
          <span className="label">Billing</span>
          <select
            className="input"
            value={form.billingType}
            onChange={(e) => setForm({ ...form, billingType: e.target.value })}
          >
            <option value="lifetime">Lifetime</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <label>
          <span className="label">Paddle price ID</span>
          <input
            className="input"
            value={form.paddlePriceId}
            onChange={(e) =>
              setForm({ ...form, paddlePriceId: e.target.value })
            }
            placeholder="pri_..."
          />
        </label>
        <label className="md:col-span-2">
          <span className="label">Features (comma separated)</span>
          <input
            className="input"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
        </label>
      </div>
      <div className="mt-5 text-right">
        <button className="btn-primary">Create plan</button>
      </div>
      {msg && <p className="mt-4 text-sm text-[#8ff0a9]">{msg}</p>}
    </form>
  );
}
