import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const s = await createClient();
  const [p, r, l, u, e, approvedData] = await Promise.all([
    s
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    s
      .from("device_reset_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    s
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    s.from("profiles").select("*", { count: "exact", head: true }),
    s
      .from("extensions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    s
      .from("orders")
      .select("amount,currency,plans(name)")
      .eq("status", "approved"),
  ]);
  const { data: recent } = await s
    .from("orders")
    .select(
      "id,amount,currency,status,created_at,profiles!orders_user_id_fkey(email),plans(name)",
    )
    .order("created_at", { ascending: false })
    .limit(6);
    
  const approvedOrders = (approvedData as any[]) ?? [];
  let totalUSD = 0;
  let totalBDT = 0;
  const productSales: Record<string, number> = {};

  approvedOrders.forEach((o) => {
    const amt = parseFloat(o.amount);
    if (!isNaN(amt)) {
      if (o.currency === "USD") totalUSD += amt;
      else if (o.currency === "BDT") totalBDT += amt;
    }
    const pName = o.plans?.name || "Unknown Plan";
    productSales[pName] = (productSales[pName] || 0) + 1;
  });

  const cards = [
    ["Active products", e.count ?? 0, "◈"],
    ["Customers", u.count ?? 0, "◎"],
    ["Active licenses", l.count ?? 0, "⌁"],
    ["Action required", (p.count ?? 0) + (r.count ?? 0), "⚡"],
  ];
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Admin command center
          </h1>
          <p className="muted mt-2">
            Products, revenue and license health in one view.
          </p>
        </div>
        <Link href="/admin/extensions" className="btn-primary">
          ＋ Publish product
        </Link>
      </div>

      <div className="stat-grid mt-8">
        <div className="card p-5 bg-[#45c66d]/10 border-[#45c66d]/30">
          <p className="muted text-xs font-bold uppercase tracking-wider text-[#45c66d]">Total USD Revenue</p>
          <b className="mt-3 block text-3xl text-[#45c66d]">${totalUSD.toFixed(2)}</b>
        </div>
        <div className="card p-5 bg-[#45c66d]/10 border-[#45c66d]/30">
          <p className="muted text-xs font-bold uppercase tracking-wider text-[#45c66d]">Total BDT Revenue</p>
          <b className="mt-3 block text-3xl text-[#45c66d]">৳{totalBDT.toFixed(2)}</b>
        </div>
        <div className="card p-5 col-span-2">
          <p className="muted text-xs font-bold uppercase tracking-wider">Plan Breakdown (Sales)</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(productSales).map(([name, count]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="badge badge-purple">{name}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(productSales).length === 0 && <span className="muted text-sm">—</span>}
          </div>
        </div>
      </div>

      <div className="stat-grid mt-8">
        {cards.map(([a, b, c]) => (
          <div key={a} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="muted text-xs font-bold uppercase tracking-wider">
                {a}
              </p>
              <span className="text-[#45c66d]">{c}</span>
            </div>
            <b className="mt-3 block text-3xl">{b}</b>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_.7fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[.06] p-5">
            <div>
              <h2 className="font-black">Recent orders</h2>
              <p className="muted mt-1 text-xs">Latest customer transactions</p>
            </div>
            <Link className="text-sm text-[#45c66d]" href="/admin/payments">
              Review all →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(recent ?? []).map((x: any) => (
                  <tr key={x.id}>
                    <td>{x.profiles?.email ?? "—"}</td>
                    <td>{x.extensions?.name}</td>
                    <td>
                      {x.currency} {x.amount}
                    </td>
                    <td>
                      <span
                        className={`badge ${x.status === "approved" ? "badge-green" : x.status === "pending" ? "badge-amber" : ""}`}
                      >
                        {x.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5">
          <h2 className="font-black">Action queue</h2>
          <p className="muted mt-1 text-xs">Items waiting for review</p>
          <Link
            href="/admin/payments"
            className="mt-6 flex items-center justify-between rounded-xl border border-white/[.06] bg-white/[.025] p-4"
          >
            <span>
              <b className="block">Payments</b>
              <small className="muted">Manual verification</small>
            </span>
            <b className="text-2xl text-[#78e397]">{p.count ?? 0}</b>
          </Link>
          <Link
            href="/admin/resets"
            className="mt-3 flex items-center justify-between rounded-xl border border-white/[.06] bg-white/[.025] p-4"
          >
            <span>
              <b className="block">Device resets</b>
              <small className="muted">Customer requests</small>
            </span>
            <b className="text-2xl text-[#78e397]">{r.count ?? 0}</b>
          </Link>
        </section>
      </div>
    </div>
  );
}
