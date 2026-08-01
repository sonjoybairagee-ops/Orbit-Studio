import { redirect } from "next/navigation";
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

  const requestedSeats = Math.max(1, Math.min(20, parseInt(searchParams.seats ?? "1", 10) || 1));

  const supabase = await createClient();
  const { data: rawPlan } = await supabase
    .from("plans")
    .select("*, extensions(name, slug)")
    .eq("id", params.planId)
    .single();

  let plan = rawPlan;
  if (!plan) {
    // Fallback lookup by slug or id
    if (params.planId === "compx-v111-plan" || params.planId === "compx-v111") {
      plan = {
        id: "compx-v111-plan",
        slug: "compx-v111",
        name: "CompX Precomp Manager",
        price: 1,
        currency: "USD",
        billing_type: "lifetime",
        max_devices: 1,
        paddle_price_id: "pri_01kydan5yvz9a050efd199wrjv",
        extensions: { name: "CompX Precomp Manager", slug: "compx-v111" },
      };
    } else {
      plan = {
        id: "orbit-bundle",
        slug: "orbit-bundle",
        name: "Orbit Studio",
        price: 2,
        currency: "USD",
        billing_type: "lifetime",
        max_devices: 1,
        paddle_price_id: "pri_01kydan5yvz9a050efd199wrjv",
        extensions: { name: "Orbit Studio", slug: "orbit-studio" },
      };
    }
  } else {
    // Clean up DB plan name and price
    const isPrecomp = plan.slug === "compx-v111" || (plan.name && plan.name.includes("Precomp"));
    if (isPrecomp) {
      plan = { ...plan, name: "CompX Precomp Manager", price: 1 };
    } else {
      plan = { ...plan, name: "Orbit Studio", price: 2 };
    }
  }

  return <CheckoutForm plan={plan} seats={requestedSeats} />;
}
