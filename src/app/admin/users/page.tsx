import { createClient } from "@/lib/supabase/server";
export default async function UsersPage() {
  const s = await createClient();
  const { data: users } = await s
    .from("profiles")
    .select("id,full_name,email,role,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <div>
      <p className="eyebrow">Customer directory</p>
      <h1 className="mt-2 text-3xl font-black">Users</h1>
      <p className="muted mt-2">
        Every customer account across your extension ecosystem.
      </p>
      <div className="card mt-8 overflow-hidden">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((x: any) => (
                <tr key={x.id}>
                  <td className="font-semibold">
                    {x.full_name || "Unnamed user"}
                  </td>
                  <td>{x.email}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
