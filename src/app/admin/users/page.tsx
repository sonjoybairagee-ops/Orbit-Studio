import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const s = await createClient();
  const q = searchParams.q?.trim() ?? "";

  let query = s
    .from("profiles")
    .select("id,full_name,email,role,created_at,licenses(plans(name))")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users } = await query;

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
          <form action="/admin/users">
            <input
              name="q"
              defaultValue={q}
              className="input !mt-0 w-[240px]"
              placeholder="Search name or email…"
            />
          </form>
        </div>
      </div>
      <div className="card mt-8 overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Products</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((x: any) => {
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
                    </td>
                    <td>
                      {products.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {products.map((p: any) => (
                            <span key={p} className="badge badge-purple text-[10px]">
                              {p.replace(/Bundle/gi, "").trim()}
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
