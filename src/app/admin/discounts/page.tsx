import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DISCOUNT_CAMPAIGN, getCampaignInfo } from "@/lib/discount-campaign";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const adminClient = createAdminClient();
  const statusFilter = searchParams.status || "all";
  const searchQuery = searchParams.q?.trim() ?? "";

  // 1. Fetch all orders with Orbit100 coupon
  let query = adminClient
    .from("orders")
    .select(`
      id, amount, currency, method, txn_ref, status, created_at, reviewed_at,
      receipt_path, provider_transaction_id,
      profiles!orders_user_id_fkey ( email, full_name ),
      plans ( name, slug ),
      licenses ( id, key, status )
    `)
    .ilike("provider_transaction_id", `%${DISCOUNT_CAMPAIGN.CODE}%`)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: allDiscountOrders } = await query;

  // 2. Aggregate metrics for campaign stats
  const { data: metricsData } = await adminClient
    .from("orders")
    .select("status")
    .ilike("provider_transaction_id", `%${DISCOUNT_CAMPAIGN.CODE}%`);

  const approvedCount = metricsData?.filter((o) => o.status === "approved").length ?? 0;
  const pendingCount = metricsData?.filter((o) => o.status === "pending").length ?? 0;
  const rejectedCount = metricsData?.filter((o) => o.status === "rejected").length ?? 0;
  const totalOrders = metricsData?.length ?? 0;

  const campaign = getCampaignInfo(approvedCount, pendingCount);
  const totalSavingsBdt = approvedCount * DISCOUNT_CAMPAIGN.DISCOUNT_BDT;
  const percentageQuotaUsed = Math.min(100, Math.round((approvedCount / DISCOUNT_CAMPAIGN.TOTAL_KEYS) * 100));

  // 3. Filter orders in-memory if search query provided
  let filteredOrders = allDiscountOrders ?? [];
  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    filteredOrders = filteredOrders.filter((order: any) => {
      const email = order.profiles?.email?.toLowerCase() ?? "";
      const name = order.profiles?.full_name?.toLowerCase() ?? "";
      const txn = order.txn_ref?.toLowerCase() ?? "";
      const id = order.id?.toLowerCase() ?? "";
      return email.includes(qLower) || name.includes(qLower) || txn.includes(qLower) || id.includes(qLower);
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Marketing & Promotions</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                campaign.isActive
                  ? "bg-[#3cff5f]/20 text-[#3cff5f] border border-[#3cff5f]/30"
                  : campaign.isUpcoming
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : "bg-red-400/20 text-red-300 border border-red-400/30"
              }`}
            >
              {campaign.isActive
                ? "● Active Campaign (30 Days)"
                : campaign.isUpcoming
                ? "⏳ Scheduled for Friday (06 Nov 2026)"
                : "Campaign Ended"}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Orbit Studio Discount Campaign
          </h1>
          <p className="muted mt-1 max-w-2xl text-sm">
            Coupon <b className="font-mono text-[#3cff5f]">Orbit100</b> (100 ৳ OFF) • Max quota:{" "}
            <b>500 Keys</b>. Quota automatically decrements when order is <b>APPROVED</b>.
          </p>
        </div>

        {/* Search */}
        <form action="/admin/discounts" className="flex items-center gap-2">
          <input type="hidden" name="status" value={statusFilter} />
          <input
            name="q"
            defaultValue={searchQuery}
            className="input !mt-0 w-[260px] text-sm"
            placeholder="Search email, name, Txn ID..."
          />
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-5 border border-white/10 bg-white/[0.02]">
          <span className="muted text-xs font-bold uppercase tracking-wider">Total Quota</span>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {DISCOUNT_CAMPAIGN.TOTAL_KEYS}
          </p>
          <span className="mt-1 block text-xs text-[#8fa896]">Max campaign allocation</span>
        </div>

        <div className="card p-5 border border-[#3cff5f]/30 bg-[#3cff5f]/[0.05] shadow-[0_0_20px_rgba(60,255,95,0.06)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3cff5f]">
            ✓ Approved & Deducted
          </span>
          <p className="mt-2 font-mono text-3xl font-black text-[#3cff5f]">
            {approvedCount}
          </p>
          <span className="mt-1 block text-xs text-[#8fa896]">
            {percentageQuotaUsed}% of total quota used
          </span>
        </div>

        <div className="card p-5 border border-emerald-500/30 bg-emerald-950/20">
          <span className="muted text-xs font-bold uppercase tracking-wider">Remaining Keys</span>
          <p className="mt-2 font-mono text-3xl font-black text-emerald-400">
            {campaign.remainingKeys}
          </p>
          <span className="mt-1 block text-xs text-[#8fa896]">
            Available for purchase
          </span>
        </div>

        <div className="card p-5 border border-amber-500/30 bg-amber-950/20">
          <span className="muted text-xs font-bold uppercase tracking-wider">Pending Orders</span>
          <p className="mt-2 font-mono text-3xl font-black text-amber-400">
            {pendingCount}
          </p>
          <span className="mt-1 block text-xs text-[#8fa896]">
            Awaiting manual verification
          </span>
        </div>

        <div className="card p-5 border border-white/10 bg-white/[0.02]">
          <span className="muted text-xs font-bold uppercase tracking-wider">Total Savings Given</span>
          <p className="mt-2 font-mono text-3xl font-black text-[#ffc36f]">
            {totalSavingsBdt.toLocaleString()} ৳
          </p>
          <span className="mt-1 block text-xs text-[#8fa896]">
            {approvedCount} orders × 100 ৳ off
          </span>
        </div>
      </div>

      {/* Quota Progress Bar Banner */}
      <div className="card p-6 border border-[#3cff5f]/20 bg-gradient-to-r from-black/80 via-[#072412]/60 to-black/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white">500 Keys Campaign Progress</h3>
            <p className="muted text-xs mt-0.5">
              Campaign Window: <b>06 Nov 2026</b> to <b>06 Dec 2026</b> (30 Days) • 100 ৳ Discount
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-lg font-black text-[#3cff5f]">
              {approvedCount} / {DISCOUNT_CAMPAIGN.TOTAL_KEYS} Sold
            </span>
            <span className="block text-xs font-medium text-[#8fa896]">
              {campaign.remainingKeys} keys left
            </span>
          </div>
        </div>

        <div className="mt-4 relative h-3 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3cff5f] via-[#6ded92] to-[#a8ffbd] transition-all duration-500 shadow-[0_0_12px_rgba(60,255,95,0.6)]"
            style={{ width: `${Math.max(2, percentageQuotaUsed)}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex gap-2">
          {[
            { key: "all", label: `All Orders (${totalOrders})` },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "approved", label: `Approved (${approvedCount})` },
            { key: "rejected", label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/discounts?status=${tab.key}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? "bg-[#3cff5f] text-black shadow-[0_0_15px_rgba(60,255,95,0.3)]"
                  : "bg-white/5 text-[#aab0bd] hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <Link
          href="/admin/payments"
          className="text-xs font-bold text-[#3cff5f] hover:underline"
        >
          Go to Payments Verification center →
        </Link>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden border border-white/10">
        <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <h2 className="text-base font-black text-white">Discount Customers Log</h2>
          <p className="muted text-xs">
            Showing all orders where coupon <b className="text-white">Orbit100</b> was applied.
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl">🎁</span>
            <h3 className="mt-3 text-lg font-bold text-white">No Discount Orders Found</h3>
            <p className="muted mt-1 max-w-md mx-auto text-xs leading-5">
              {searchQuery
                ? `No orders matching query "${searchQuery}".`
                : statusFilter !== "all"
                ? `No orders with status "${statusFilter}".`
                : "The Orbit100 discount campaign starts on Friday, 6 November 2026. As soon as customers apply the coupon at checkout, their orders and approved licenses will show here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-[#8fa896]">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Method & Txn</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3">Issued License Key</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order: any) => {
                  const profile = order.profiles;
                  const license = Array.isArray(order.licenses) ? order.licenses[0] : order.licenses;
                  const isApproved = order.status === "approved";
                  const isPending = order.status === "pending";

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">
                          {profile?.email ?? "Unknown Email"}
                        </div>
                        {profile?.full_name && (
                          <div className="muted text-xs">{profile.full_name}</div>
                        )}
                        <div className="font-mono text-[10px] text-[#55695c]">
                          ID: {order.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Method & Txn */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                              order.method === "bkash"
                                ? "bg-[#e2136e]/20 text-[#ff8ebc]"
                                : order.method === "nagad"
                                ? "bg-[#f6921e]/20 text-[#fbcd9a]"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {order.method}
                          </span>
                        </div>
                        <div className="mt-1 font-mono text-xs font-semibold text-white">
                          {order.txn_ref || "N/A"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-white">
                          {order.amount} {order.currency}
                        </div>
                        <span className="inline-block mt-0.5 rounded bg-[#3cff5f]/15 px-1.5 py-0.2 text-[10px] font-bold text-[#3cff5f]">
                          -100 ৳ OFF
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isPending
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : "bg-red-400/20 text-red-300 border border-red-400/30"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isApproved
                                ? "bg-emerald-400"
                                : isPending
                                ? "bg-amber-300"
                                : "bg-red-400"
                            }`}
                          />
                          {order.status}
                        </span>
                      </td>

                      {/* Issued License */}
                      <td className="px-5 py-4 font-mono text-xs">
                        {license?.key ? (
                          <div className="inline-flex items-center gap-2 rounded bg-black/50 border border-white/10 px-2.5 py-1 text-[#3cff5f]">
                            <span>🔑 {license.key}</span>
                          </div>
                        ) : isPending ? (
                          <span className="text-xs text-amber-300/70 italic">
                            Awaiting approval
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-[#aab0bd]">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <div className="text-[10px] opacity-70">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/payments?q=${encodeURIComponent(order.txn_ref || profile?.email || "")}`}
                          className="btn-secondary !py-1 !px-2.5 text-xs font-bold hover:text-white"
                        >
                          Verify →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

