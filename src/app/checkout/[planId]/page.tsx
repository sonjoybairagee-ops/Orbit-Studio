import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { planId: string };
  searchParams: { seats?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const requestedSeats = Math.max(1, Math.min(10, parseInt(searchParams.seats ?? "1", 10) || 1));

  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.planId);
  const planQuery = supabase
    .from("plans")
    .select("*, plan_extensions(extensions(name, slug))");

  const { data: rawPlan } = isUuid
    ? await planQuery.eq("id", params.planId).maybeSingle()
    : await planQuery.eq("slug", params.planId).maybeSingle();

  if (!rawPlan || !rawPlan.is_active || !rawPlan.is_public) notFound();

  let plan = rawPlan;
  {
    // Normalize plan display:
    // - CompX v1.1.1 legacy plan
    const isPrecomp =
      plan.slug === "compx-v111" || (plan.name && plan.name.includes("Precomp"));

    if (isPrecomp) {
      // Keep legacy plan as-is, just normalize name and price
      plan = { ...plan, name: "CompX Precomp Manager" };
    } else {
      const isMulti = plan.max_devices > 1 || requestedSeats > 1;
      const cleanName = isMulti ? "Studio Team License" : (plan.name || "Orbit Studio");
      const isPremiere = plan.slug === "orbit-premiere";
      const isBundle = plan.slug === "orbit-bundle";
      const defaultUsd = isMulti ? 4 : (isPremiere ? 2 : isBundle ? 4 : 3);
      const defaultBdt = isMulti ? 480 : (isPremiere ? 240 : isBundle ? 480 : 360);
      const unitUsd = Number(plan.unit_price_usd) > 0 ? Number(plan.unit_price_usd) : defaultUsd;
      const unitBdt = Number(plan.unit_price_bdt) > 0 ? Number(plan.unit_price_bdt) : defaultBdt;
      plan = { ...plan, name: cleanName, unit_price_usd: isMulti ? 4 : unitUsd, unit_price_bdt: isMulti ? 480 : unitBdt };
    }
  }

  // For multi-device plans, the seat count is either from the query param
  // (user picked it on the pricing page) or from plan.max_devices.
  const effectiveSeats =
    plan.max_devices > 1
      ? Math.max(plan.max_devices, requestedSeats)
      : requestedSeats;

  return <CheckoutForm plan={plan} seats={effectiveSeats} />;
}
