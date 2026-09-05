import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminAnalyticsChart } from "@/components/AdminAnalyticsChart";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const s = createAdminClient();
  const [metricsResult, r, e, bannedData] = await Promise.all([
    s.rpc("admin_dashboard_metrics"),
    s
      .from("device_reset_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    s
      .from("extensions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    s.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
  ]);
  if (metricsResult.error) {
    throw new Error(`Could not load admin metrics: ${metricsResult.error.message}`);
  }
  const metrics = (metricsResult.data ?? {}) as any;
  const revenue = metrics.revenue ?? {};
  const planSales = (metrics.plan_sales ?? []) as Array<{
    name: string;
    orders: number;
    seats: number;
  }>;
  const methodSales = (metrics.method_sales ?? []) as Array<{
    method: string;
    orders: number;
  }>;
  const dailySales = (metrics.daily_sales ?? []) as Array<{
    date: string;
    orders: number;
  }>;
  const pendingOrders = Number(metrics.pending_orders ?? 0);
  const { data: recent } = await s
    .from("orders")
    .select(
      "id,amount,currency,status,created_at,profiles!orders_user_id_fkey(email),plans(name)",
    )
    .order("created_at", { ascending: false })
    .limit(6);
    
  const totalUSD = Number(revenue.USD ?? 0);
  const totalBDT = Number(revenue.BDT ?? 0);
  const todaySignups = Number(metrics.today_signups ?? 0);
  const todayOrders = Number(metrics.today_orders ?? 0);
  const activeLicenses = Number(metrics.active_licenses ?? 0);
  const seatsSold = Number(metrics.seats_sold ?? 0);

  const cards = [
    ["Active products", e.count ?? 0, "◈"],
    ["All users", Number(metrics.users_total ?? 0), "◎"],
    ["Paying customers", Number(metrics.paying_customers ?? 0), "◎"],
    ["Active licenses", activeLicenses, "⌁"],
    ["Seats sold", seatsSold, "⌁"],
    ["Seats in use", Number(metrics.active_seats_used ?? 0), "⌁"],
    ["Action required", pendingOrders + (r.count ?? 0), "⚡"],
    ["Today's Signups", todaySignups, "📈"],
    ["Today's Purchases", todayOrders, "🛒"],
    ["Banned Users", bannedData.count ?? 0, "🚫"],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Admin Command Center
          </h1>
          <p className="muted mt-2">
            Real-time revenue velocity, product licensing health, and fraud prevention signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/licenses" className="btn-secondary text-xs font-bold">
            Issue License 🔑
          </Link>
          <Link href="/admin/extensions" className="btn-primary text-xs font-black">
            ＋ Manage Products & Prices
          </Link>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      <AdminAnalyticsChart
        totalUSD={totalUSD}
        totalBDT={totalBDT}
        dailySales={dailySales}
        planSales={planSales}
        methodSales={methodSales}
        todaySignups={todaySignups}
        todayOrders={todayOrders}
        activeLicenses={activeLicenses}
        seatsSold={seatsSold}
      />

      {/* Key Operations Metric Cards */}
      <div className="stat-grid">
        {cards.map(([a, b, c]) => (
          <div key={a} className="card p-5 hover:border-white/20 transition-all">
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
                    <td>{x.plans?.name ?? "—"}</td>
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
            <b className="text-2xl text-[#78e397]">{pendingOrders}</b>
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
