import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BanUserButton } from "@/components/BanUserButton";

function getUserSourceInfo(user: any) {
  const licenses = user.licenses ?? [];
  const isLegacy = !!user.legacy_source || licenses.some((l: any) => 
    l.license_type === "legacy_demo" || 
    l.plans?.name?.toLowerCase().includes("legacy") || 
    l.plans?.name?.toLowerCase().includes("v1.1.1")
  );

  const isPromo = licenses.some((l: any) => 
    l.license_type === "nfr" || 
    l.license_type === "promotion" || 
    (l.notes || "").toLowerCase().includes("promo") ||
    (l.notes || "").toLowerCase().includes("promotion")
  );

  const orders = licenses.flatMap((l: any) => l.orders ?? []).filter(Boolean);
  const paidOrders = orders.filter((o: any) => o.status === "approved" || Number(o.amount) > 0);
  const isPaid = paidOrders.length > 0 || licenses.some((l: any) => l.license_type === "paid" && !isPromo && !isLegacy);

  let badgeLabel = "⚪ No License";
  let badgeCls = "badge bg-gray-600/20 text-gray-400 border border-gray-500/30 text-[10px]";

  if (isPromo) {
    badgeLabel = "🎁 Free Promo";
    badgeCls = "badge badge-purple text-[10px]";
  } else if (isPaid) {
    badgeLabel = "💳 Paid User";
    badgeCls = "badge badge-green text-[10px]";
  } else if (isLegacy) {
    badgeLabel = "📦 Legacy User";
    badgeCls = "badge badge-amber text-[10px]";
  }

  const paymentMethods = Array.from(new Set([
    ...orders.map((o: any) => o.method).filter(Boolean),
    ...(isPromo ? ["promo"] : []),
    ...(isLegacy ? ["legacy"] : [])
  ]));

  return { isLegacy, isPromo, isPaid, badgeLabel, badgeCls, paymentMethods };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; plan?: string; status?: string };
}) {
  const s = createAdminClient();
  const q = searchParams.q?.trim() ?? "";
  const plan = searchParams.plan?.trim() ?? "";
  const status = searchParams.status?.trim() ?? "all";

  // Fetch all plans for the dropdown
  const { data: allPlans } = await s.from("plans").select("id,name").order("name");

  let selectStr = "id,full_name,email,role,legacy_source,created_at,is_banned,licenses(id,license_type,notes,status,created_at,orders(id,method,amount,currency,status),plans(name))";
  if (plan) {
    selectStr = "id,full_name,email,role,legacy_source,created_at,is_banned,licenses!inner(id,license_type,notes,status,created_at,orders(id,method,amount,currency,status),plans(name))";
  }

  let query = s
    .from("profiles")
    .select(selectStr)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }
  
  if (plan) {
    query = query.eq("licenses.plan_id", plan);
  }

  if (status === "active") {
    query = query.eq("is_banned", false);
  } else if (status === "banned") {
    query = query.eq("is_banned", true);
  }

  const { data: users, error } = await query;
  if (error) {
    console.error("UsersPage query error:", error);
  }

  let filteredUsers = users ?? [];
  if (status === "paid") {
    filteredUsers = filteredUsers.filter((u: any) => getUserSourceInfo(u).isPaid);
  } else if (status === "promo") {
    filteredUsers = filteredUsers.filter((u: any) => getUserSourceInfo(u).isPromo);
  } else if (status === "legacy") {
    filteredUsers = filteredUsers.filter((u: any) => getUserSourceInfo(u).isLegacy);
  }

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "paid", label: "Paid Users 💳" },
    { id: "promo", label: "Free / Promo 🎁" },
    { id: "legacy", label: "Legacy Users 📦" },
    { id: "active", label: "Active" },
    { id: "banned", label: "Banned" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Customer directory</p>
          <h1 className="mt-2 text-3xl font-black">Users</h1>
          <p className="muted mt-2">
            Every customer account across your extension ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/export-users" download className="btn-secondary px-3 py-1.5 text-xs font-bold">
            Export CSV 📥
          </a>
          <form action="/admin/users" className="flex items-center gap-2">
            <select
              name="plan"
              defaultValue={plan}
              className="input !mt-0 w-[200px]"
            >
              <option value="">All Products</option>
              {allPlans?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              name="q"
              defaultValue={q}
              className="input !mt-0 w-[240px]"
              placeholder="Search name or email…"
            />
            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs font-bold">
              Filter
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/users?status=${tab.id}${q ? `&q=${encodeURIComponent(q)}` : ""}${plan ? `&plan=${encodeURIComponent(plan)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              status === tab.id
                ? "bg-[#45c66d] text-black"
                : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Type / Source</th>
                <th>Payment Method</th>
                <th>Products</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((x: any) => {
                const info = getUserSourceInfo(x);
                const products = Array.from(
                  new Set(x.licenses?.map((l: any) => l.plans?.name).filter(Boolean))
                );
                return (
                  <tr key={x.id}>
                    <td className="font-semibold">
                      <Link href={`/admin/users/${x.id}`} className="hover:text-[#45c66d] hover:underline">
                        {x.full_name || "Unnamed user"}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/users/${x.id}`} className="hover:text-[#45c66d]">
                        {x.email}
                      </Link>
                      {x.is_banned && (
                        <span className="ml-2 badge bg-red-600/20 text-red-500 border border-red-500/30 text-[10px]">
                          BANNED
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={info.badgeCls}>
                        {info.badgeLabel}
                      </span>
                    </td>
                    <td>
                      {info.paymentMethods.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {info.paymentMethods.map((m) => {
                            const mUpper = m.toUpperCase();
                            let cls = "badge text-[10px]";
                            if (m === "bkash") cls = "badge bg-pink-600/20 text-pink-400 border border-pink-500/30 text-[10px]";
                            else if (m === "nagad") cls = "badge bg-orange-600/20 text-orange-400 border border-orange-500/30 text-[10px]";
                            else if (m === "paddle") cls = "badge bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px]";
                            else if (m === "promo") cls = "badge badge-purple text-[10px]";
                            else if (m === "legacy") cls = "badge badge-amber text-[10px]";
                            else cls = "badge badge-amber text-[10px]";
                            return (
                              <span key={m} className={cls}>
                                {m === "promo" ? "Free / Promo" : m === "legacy" ? "Legacy Claim" : mUpper}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {products.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {products.map((p: any) => (
                            <span key={p as string} className="badge badge-purple text-[10px]">
                              {(p as string).replace(/Bundle/gi, "").trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${x.role === "admin" ? "badge-amber" : ""}`}
                      >
                        {x.role}
                      </span>
                    </td>
                    <td className="muted">
                      {new Date(x.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${x.id}`}
                          className="btn-secondary px-2.5 py-1 text-xs font-bold transition-all hover:border-[#45c66d] hover:text-[#45c66d]"
                          title="View user profile, licenses and orders"
                        >
                          Details
                        </Link>
                        {x.role !== "admin" && (
                          <BanUserButton userId={x.id} isBanned={x.is_banned} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
