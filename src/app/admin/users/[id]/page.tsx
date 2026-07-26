import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LicenseAdminActions } from "@/components/LicenseAdminActions";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const s = createAdminClient();

  const { data: profile } = await s
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!profile) return notFound();

  const [ordersRes, licensesRes, resetsRes] = await Promise.all([
    s.from("orders").select("*, plans(name)").eq("user_id", params.id).order("created_at", { ascending: false }),
    s.from("licenses").select("*, plans(name), activations(*)").eq("user_id", params.id).order("created_at", { ascending: false }),
    s.from("device_reset_requests").select("*").eq("user_id", params.id).order("created_at", { ascending: false }),
  ]);

  const orders = ordersRes.data ?? [];
  const licenses = licensesRes.data ?? [];
  const resets = resetsRes.data ?? [];

  return (
    <div>
      <Link href="/admin/users" className="muted text-sm hover:text-white">
        ← Back to Customers
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{profile.full_name || "Unnamed user"}</h1>
          <p className="muted mt-1">{profile.email}</p>
        </div>
        <span className={`badge ${profile.role === "admin" ? "badge-amber" : ""}`}>
          Role: {profile.role}
        </span>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-bold uppercase tracking-wider text-xs muted">Licenses ({licenses.length})</h2>
          {licenses.map((lic: any) => (
            <div key={lic.id} className="card p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <b className="block">{lic.plans?.name}</b>
                  <code className="mt-2 block font-mono text-xs text-[#bdf2cc]">{lic.key}</code>
                </div>
                <span className={`badge ${lic.status === "active" ? "badge-green" : "badge-amber"}`}>
                  {lic.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="label">Activations ({lic.activations?.length || 0} / {lic.max_devices})</p>
                {lic.activations?.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {lic.activations.map((act: any) => (
                      <li key={act.id} className="muted text-xs flex justify-between">
                        <span>{act.device_label ?? "Unknown"}</span>
                        <span>{new Date(act.last_seen).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted text-xs mt-2">No active devices</p>
                )}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <LicenseAdminActions licenseId={lic.id} status={lic.status} maxDevices={lic.max_devices} />
              </div>
            </div>
          ))}
          {licenses.length === 0 && <p className="muted text-sm">No licenses found.</p>}
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="font-bold uppercase tracking-wider text-xs muted mb-4">Orders ({orders.length})</h2>
            <div className="space-y-3">
              {orders.map((o: any) => (
                <div key={o.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <b>{o.plans?.name}</b>
                    <p className="muted text-xs mt-1">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <b className="block">{o.currency} {o.amount}</b>
                    <span className={`badge mt-1 ${o.status === "approved" ? "badge-green" : o.status === "pending" ? "badge-amber" : ""}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="muted text-sm">No orders found.</p>}
            </div>
          </div>

          <div>
            <h2 className="font-bold uppercase tracking-wider text-xs muted mb-4">Reset History ({resets.length})</h2>
            <div className="space-y-3">
              {resets.map((r: any) => (
                <div key={r.id} className="card p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                    <span className={`badge ${r.status === "approved" ? "badge-green" : r.status === "pending" ? "badge-amber" : ""}`}>
                      {r.status}
                    </span>
                  </div>
                  {r.reason && <p className="muted mt-2 text-xs">Reason: "{r.reason}"</p>}
                </div>
              ))}
              {resets.length === 0 && <p className="muted text-sm">No reset requests found.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
