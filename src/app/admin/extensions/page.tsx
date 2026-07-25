import { createClient } from "@/lib/supabase/server";
import { NewExtensionForm } from "@/components/NewExtensionForm";
import { NewPlanForm } from "@/components/NewPlanForm";
export default async function ExtensionsPage() {
  const s = await createClient();
  const { data: extensions } = await s
    .from("extensions")
    .select("*,plans(id,name,price,currency,billing_type)")
    .order("created_at", { ascending: false });
  return (
    <div>
      <p className="eyebrow">Product publishing</p>
      <h1 className="mt-2 text-3xl font-black">Extensions & plans</h1>
      <p className="muted mt-2">
        Publish every future extension and pricing tier from here.
      </p>
      <div className="mt-8 space-y-4">
        <details className="card" open>
          <summary className="cursor-pointer list-none p-5 font-bold">
            ＋ New extension
          </summary>
          <div className="border-t border-white/[.06] p-4">
            <NewExtensionForm />
          </div>
        </details>
        <details className="card">
          <summary className="cursor-pointer list-none p-5 font-bold">
            ＋ New pricing plan
          </summary>
          <div className="border-t border-white/[.06] p-4">
            <NewPlanForm extensions={extensions ?? []} />
          </div>
        </details>
      </div>
      <div className="mt-10 grid gap-4 xl:grid-cols-2">
        {(extensions ?? []).map((x: any) => {
          const isPrecomp = x.slug.includes("v111") || x.slug.includes("legacy") || x.name.includes("v1.1.1");
          const displayVersion = isPrecomp ? "1.1.1" : (x.latest_version ?? "2.3.1");
          const displayName = isPrecomp ? "CompX Precomp Manager (Legacy)" : x.name;

          return (
            <article key={x.id} className="card p-6 border border-[#45c66d]/20 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#45c66d]/10 font-black text-[#45c66d]">
                  CX
                </div>
                <span className={`badge ${x.is_active ? "badge-green" : ""}`}>
                  {x.is_active ? "Published & Active" : "Hidden"}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{displayName}</h3>
              <p className="muted mt-1 text-xs font-mono">
                /{x.slug} · v{displayVersion}
              </p>
              <p className="muted mt-3 text-sm leading-6">{x.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {isPrecomp ? (
                  <span className="badge badge-green font-bold">
                    CompX Precomp Manager · USD $1
                  </span>
                ) : (
                  <span className="badge badge-green font-bold">
                    Orbit Studio · USD $2
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
