import { createClient } from "@/lib/supabase/server";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const s = await createClient();
  const q = searchParams.q?.trim() ?? "";

  let query = s
    .from("admin_logs")
    .select("*, profiles!admin_logs_admin_id_fkey(email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.ilike("action", `%${q}%`);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("Error fetching logs:", error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Audit Trail</p>
          <h1 className="mt-2 text-3xl font-black">Activity Logs</h1>
          <p className="muted mt-2">
            Track and monitor every administrative action performed in the system.
          </p>
        </div>
        <form action="/admin/logs" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            className="input !mt-0 w-[240px]"
            placeholder="Search action..."
          />
        </form>
      </div>

      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-left text-sm text-[#aab0bd]">
          <thead className="bg-[#121a15] text-xs font-bold uppercase tracking-wider text-[#45c66d]">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Admin Email</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target ID</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2a22]">
            {logs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  No activity logs found.
                </td>
              </tr>
            ) : (
              logs?.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {(log.profiles as any)?.email ?? "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-amber">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-white/50">
                    {log.target_id || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {log.details ? (
                      <pre className="max-w-[300px] overflow-auto rounded bg-[#0a0f0c] p-2 text-xs text-[#aab0bd]">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-white/30">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
