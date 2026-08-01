import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { LicenseAdminActions } from "@/components/LicenseAdminActions";
import { AdminCreateLicenseModal } from "@/components/AdminCreateLicenseModal";

export const dynamic = "force-dynamic";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function cooldownLabel(lastResetAt: string | null) {
  if (!lastResetAt) return null;
  const left = COOLDOWN_MS - (Date.now() - new Date(lastResetAt).getTime());
  if (left <= 0) return null;
  return `${Math.ceil(left / 3_600_000)}h left`;
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const s = createAdminClient();
  const q = searchParams.q?.trim() ?? "";
  const statusFilter = searchParams.status ?? "";

  const { data: plans } = await s.from("plans").select("id, name, price").order("price", { ascending: true });

  let query = s
    .from("licenses")
    .select(
      `id, key, status, license_type, max_devices, last_reset_at, reset_count,
       expires_at, legacy_email, created_at,
       profiles ( email, full_name ),
       plans ( name, slug ),
       activations ( id, device_label, last_seen, status )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (statusFilter && statusFilter !== "multi_device") {
    query = query.eq("status", statusFilter);
  }
  if (q) query = query.ilike("key", `%${q}%`);

  const { data: rows } = await query;

  let licenses = (rows ?? []).map((x: any) => ({
    ...x,
    seats: (x.activations ?? []).filter((a: any) => a.status === "active"),
  }));

  if (statusFilter === "multi_device") {
    licenses = licenses.filter((x: any) => x.max_devices > 1 || x.seats.length > 1);
  }

  const tabs = [
    ["", "All"],
    ["active", "Active"],
    ["multi_device", "Multi-Device"],
    ["suspended", "Suspended"],
    ["revoked", "Revoked"],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">License inventory</p>
          <h1 className="mt-2 text-3xl font-black">All licenses</h1>
          <p className="muted mt-2">
            Every issued key, the devices using it, and the actions you can take.
          </p>
        </div>
        <AdminCreateLicenseModal plans={plans ?? []} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(([value, label]) => (
            <Link
              key={label}
              href={value ? `/admin/licenses?status=${value}` : "/admin/licenses"}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                statusFilter === value
                  ? "bg-[#45c66d] text-[#041008]"
                  : "border border-white/10 text-[#aab0bd] hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <form className="ml-auto" action="/admin/licenses">
          <input
            name="q"
            defaultValue={q}
            className="input !mt-0 w-[240px]"
            placeholder="Search a license key…"
          />
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {licenses.map((x: any) => {
          const cd = cooldownLabel(x.last_reset_at);
          return (
            <article key={x.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="font-mono text-sm tracking-wider text-[#bdf2cc]">
                      {x.key}
                    </code>
                    <span
                      className={`badge ${
                        x.status === "active"
                          ? "badge-green"
                          : x.status === "suspended"
                            ? "badge-amber"
                            : ""
                      }`}
                    >
                      {x.status}
                    </span>
                    {x.license_type === "legacy_demo" && (
                      <span className="badge">legacy demo</span>
                    )}
                    {x.license_type === "promotion" && (
                      <span className="badge badge-purple">🎁 Promotion</span>
                    )}
                    {x.max_devices > 1 && (
                      <span className="badge badge-purple font-bold">⚡ Multi-Device ({x.max_devices} slots)</span>
                    )}
                  </div>
                  <p className="muted mt-2 text-sm">
                    {x.profiles?.email ?? x.legacy_email ?? "Unclaimed"}
                    {x.plans?.name ? ` · ${x.plans.name}` : ""}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p className="font-black">
                    {x.seats.length}
                    <span className="muted">/{x.max_devices} devices</span>
                  </p>
                  <p className="muted mt-1 text-xs">
                    {x.reset_count} reset{x.reset_count === 1 ? "" : "s"}
                    {cd ? ` · cooldown ${cd}` : ""}
                  </p>
                </div>
              </div>

              {x.seats.length > 0 && (
                <ul className="mt-4 space-y-1">
                  {x.seats.map((a: any) => (
                    <li key={a.id} className="muted text-xs">
                      ◦ {a.device_label ?? "Unnamed device"} · last seen{" "}
                      {new Date(a.last_seen).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 border-t border-white/10 pt-4">
                <LicenseAdminActions
                  licenseId={x.id}
                  status={x.status}
                  maxDevices={x.max_devices}
                />
              </div>
            </article>
          );
        })}

        {!licenses.length && (
          <p className="muted card p-8 text-center">
            No licenses match this filter.
          </p>
        )}
      </div>
    </div>
  );
}
