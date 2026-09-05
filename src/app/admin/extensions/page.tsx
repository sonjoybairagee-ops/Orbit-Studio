import { createAdminClient } from "@/lib/supabase/admin";
import { NewExtensionForm } from "@/components/NewExtensionForm";
import { NewPlanForm } from "@/components/NewPlanForm";
import { AdminPlansManager } from "@/components/AdminPlansManager";

export const dynamic = "force-dynamic";

export default async function ExtensionsPage() {
  const s = createAdminClient();
  const [extResult, planResult] = await Promise.all([
    s.from("extensions").select("*").order("created_at", { ascending: false }),
    s.from("plans").select("*, plan_extensions(extensions(name, slug, host_app))").order("sort_order", { ascending: true }),
  ]);

  const extensions = extResult.data ?? [];
  const plans = planResult.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Product & Pricing Center</p>
          <h1 className="mt-2 text-3xl font-black">Extensions & Pricing Plans</h1>
          <p className="muted mt-2">
            Manage your Adobe extension catalogue, live USD / BDT prices, and feature tiers.
          </p>
        </div>
      </div>

      {/* Live Pricing Plans Manager */}
      <AdminPlansManager plans={plans} />

      {/* Extension Catalogue Cards */}
      <div>
        <h2 className="text-xl font-black text-white mb-4">Registered Extensions</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {extensions.map((x: any) => {
            const isPrecomp = x.slug?.includes("v111") || x.slug?.includes("legacy");
            const hostLabel = x.host_app === "AEFT" ? "After Effects (AE)" : x.host_app === "PPRO" ? "Premiere Pro (PR)" : x.host_app;

            return (
              <article key={x.id} className="card p-6 border border-[#45c66d]/20 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#45c66d]/10 font-black text-[#45c66d] text-lg">
                      {x.host_app === "AEFT" ? "AE" : x.host_app === "PPRO" ? "PR" : "CX"}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{x.name}</h3>
                      <p className="muted text-xs font-mono">
                        /{x.slug} · <span className="text-[#45c66d]">{hostLabel}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${x.is_active ? "badge-green" : "badge-amber"}`}>
                    {x.is_active ? "Active" : "Hidden"}
                  </span>
                </div>

                <p className="muted mt-3 text-sm leading-6">
                  {x.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-gray-400">
                    Bundle ID: <b className="text-gray-300">{x.bundle_id || "None"}</b>
                  </span>
                  <span className="badge badge-purple text-[10px]">
                    Host App: {x.host_app}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Creation Tools */}
      <div className="space-y-4">
        <details className="card">
          <summary className="cursor-pointer list-none p-5 font-bold flex items-center justify-between">
            <span>＋ Add New Pricing Plan</span>
            <span className="text-xs text-gray-400">Expand ▼</span>
          </summary>
          <div className="border-t border-white/[.06] p-4">
            <NewPlanForm extensions={extensions} />
          </div>
        </details>

        <details className="card">
          <summary className="cursor-pointer list-none p-5 font-bold flex items-center justify-between">
            <span>＋ Register New Extension</span>
            <span className="text-xs text-gray-400">Expand ▼</span>
          </summary>
          <div className="border-t border-white/[.06] p-4">
            <NewExtensionForm />
          </div>
        </details>
      </div>
    </div>
  );
}

