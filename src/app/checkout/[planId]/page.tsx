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
  const { data: rawPlan } = await supabase
    .from("plans")
    .select("*, plan_extensions(extensions(name, slug))")
    .or(`id.eq.${params.planId},slug.eq.${params.planId}`)
    .maybeSingle();

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
      // For Orbit plans, set a clean display name but KEEP the real max_devices and price.
      // Price is calculated per-seat in CheckoutForm using unitBdt/unitUsd × seats,
      // so the plan.price field is just the unit price (2 USD / 249 BDT).
      // We always charge ৳249 × seats, so unit price stays 2 USD regardless of seats.
      const cleanName =
        plan.max_devices > 1
          ? "Studio Team License"
          : "Orbit Studio";
      plan = { ...plan, name: cleanName };
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
