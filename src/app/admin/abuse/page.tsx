import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Thresholds that mark a license as worth a human look.
const RULES = [
  {
    key: "forced_resets_30d",
    limit: 3,
    label: "Forced resets (30d)",
    why: "Repeatedly asking staff to break the cooldown is the classic sharing pattern.",
  },
  {
    key: "distinct_devices_30d",
    limit: 3,
    label: "Different devices (30d)",
    why: "One person rarely changes computers more than a couple of times a month.",
  },
  {
    key: "distinct_ips_30d",
    limit: 10,
    label: "Different networks (30d)",
    why: "Many networks at once suggests the key is being passed around.",
  },
  {
    key: "failed_activations_7d",
    limit: 20,
    label: "Failed activations (7d)",
    why: "A burst of failures can mean the key is posted publicly.",
  },
] as const;

export default async function AbusePage() {
  const s = await createClient();
  const { data: rows } = await s
    .from("v_license_risk")
    .select("*")
    .order("forced_resets_30d", { ascending: false })
    .limit(200);

  const scored = (rows ?? [])
    .map((r: any) => {
      const hits = RULES.filter((rule) => (r[rule.key] ?? 0) >= rule.limit);
      return { ...r, hits };
    })
    .filter((r: any) => r.hits.length > 0)
    .sort((a: any, b: any) => b.hits.length - a.hits.length);

  // Red Alerts: Users with > 3 resets in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentResets } = await s
    .from("device_reset_requests")
    .select("user_id, profiles(email)")
    .gte("created_at", sevenDaysAgo);

  const resetCounts: Record<string, { count: number; email: string }> = {};
  (recentResets ?? []).forEach((r: any) => {
    if (!r.user_id) return;
    if (!resetCounts[r.user_id]) {
      resetCounts[r.user_id] = { count: 0, email: r.profiles?.email ?? "Unknown" };
    }
    resetCounts[r.user_id].count++;
  });

  const suspiciousUsers = Object.entries(resetCounts)
    .filter(([_, data]) => data.count > 3)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <p className="eyebrow">Trust and safety</p>
      <h1 className="mt-2 text-3xl font-black">Licence sharing signals</h1>
      <p className="muted mt-2 max-w-[640px] leading-7">
        These licenses crossed at least one threshold. Nothing here is proof on
        its own, so read the signals together before you suspend anyone.
      </p>

      <div className="stat-grid mt-7">
        {RULES.map((rule) => (
          <div key={rule.key} className="card p-5">
            <p className="label">{rule.label}</p>
            <p className="mt-1 text-2xl font-black">
              {scored.filter((r: any) => (r[rule.key] ?? 0) >= rule.limit).length}
            </p>
            <p className="muted mt-2 text-xs leading-5">{rule.why}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>License</th>
                <th>Customer</th>
                <th>Seats</th>
                <th>Forced resets</th>
                <th>Devices</th>
                <th>Networks</th>
                <th>Failures</th>
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((r: any) => (
                <tr key={r.license_id}>
                  <td>
                    <code className="font-mono text-xs text-[#bdf2cc]">
                      {r.key}
                    </code>
                  </td>
                  <td>{r.email ?? "—"}</td>
                  <td>
                    {r.active_seats}/{r.max_devices}
                  </td>
                  <td>{r.forced_resets_30d}</td>
                  <td>{r.distinct_devices_30d}</td>
                  <td>{r.distinct_ips_30d}</td>
                  <td>{r.failed_activations_7d}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.hits.length >= 2 ? "badge-amber" : ""
                      }`}
                    >
                      {r.hits.length} flag{r.hits.length === 1 ? "" : "s"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!scored.length && (
          <p className="muted p-8 text-center">
            Nothing suspicious right now. Every license is inside the normal
            range.
          </p>
        )}
      </div>

      <div className="card mt-8 overflow-hidden border-[#e35050]/30 bg-[#e35050]/5">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-black text-[#e35050] flex items-center gap-2">
            <span>🚩</span> Red Alerts (High Risk Users)
          </h2>
          <p className="muted mt-1 text-xs">Users who have reset their devices more than 3 times in the last 7 days.</p>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Customer Email</th>
                <th>Resets (7 days)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {suspiciousUsers.map((user: any) => (
                <tr key={user.userId}>
                  <td className="font-semibold text-white">{user.email}</td>
                  <td className="text-[#e35050] font-bold">{user.count} resets</td>
                  <td>
                    <Link href={`/admin/users/${user.userId}`} className="badge hover:bg-white/10">
                      Review Profile →
                    </Link>
                  </td>
                </tr>
              ))}
              {suspiciousUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-8 muted">No red alerts triggered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="muted mt-4 text-sm">
        Suspend or revoke from the{" "}
        <Link href="/admin/licenses" className="font-bold text-[#45c66d]">
          licenses page
        </Link>
        .
      </p>
    </div>
  );
}
