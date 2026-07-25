import { createClient } from "@/lib/supabase/server";
import { ReviewButtons } from "@/components/ReviewButtons";
import { LicenseAdminActions } from "@/components/LicenseAdminActions";

export const dynamic = "force-dynamic";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default async function ResetsPage() {
  const s = await createClient();
  const { data: requests } = await s
    .from("device_reset_requests")
    .select(
      `id, reason, created_at, status,
       profiles ( email ),
       licenses ( id, key, status, max_devices, last_reset_at, reset_count,
                  plans ( name ),
                  activations ( id, device_label, last_seen, status ) )`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div>
      <p className="eyebrow">Device operations</p>
      <h1 className="mt-2 text-3xl font-black">Reset requests</h1>
      <p className="muted mt-2">
        Approving clears the seats and starts a fresh 24 hour cooldown. Use a
        forced reset when the customer needs to activate right away.
      </p>

      <div className="mt-8 space-y-4">
        {(requests ?? []).map((r: any) => {
          const lic = r.licenses;
          const seats = (lic?.activations ?? []).filter(
            (a: any) => a.status === "active",
          );
          const left = lic?.last_reset_at
            ? COOLDOWN_MS - (Date.now() - new Date(lic.last_reset_at).getTime())
            : 0;

          return (
            <article key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{lic?.plans?.name ?? "License"}</b>
                    <span className="badge badge-amber">Needs review</span>
                    {left > 0 && (
                      <span className="badge">
                        cooldown {Math.ceil(left / 3_600_000)}h
                      </span>
                    )}
                  </div>
                  <p className="muted mt-2 text-sm">{r.profiles?.email}</p>
                  <code className="mt-2 block font-mono text-xs text-[#bdf2cc]">
                    {lic?.key}
                  </code>
                  <p className="muted mt-2 text-xs">
                    Requested {new Date(r.created_at).toLocaleString()} ·{" "}
                    {lic?.reset_count ?? 0} previous reset(s)
                  </p>
                  {r.reason && (
                    <p className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3 text-sm">
                      “{r.reason}”
                    </p>
                  )}
                  {seats.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {seats.map((a: any) => (
                        <li key={a.id} className="muted text-xs">
                          ◦ {a.device_label ?? "Unnamed device"} · last seen{" "}
                          {new Date(a.last_seen).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <ReviewButtons
                  endpoint="/api/admin/approve-reset"
                  payloadKey="requestId"
                  id={r.id}
                />
              </div>

              {lic && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="label mb-2">Or act on the license directly</p>
                  <LicenseAdminActions
                    licenseId={lic.id}
                    status={lic.status}
                    maxDevices={lic.max_devices}
                  />
                </div>
              )}
            </article>
          );
        })}

        {!requests?.length && (
          <div className="card grid min-h-52 place-items-center text-center">
            <div>
              <div className="text-3xl">✓</div>
              <b className="mt-3 block">No reset requests</b>
              <p className="muted mt-1 text-sm">
                All device operations are up to date.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
