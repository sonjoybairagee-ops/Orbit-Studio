import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCampaignInfo, DISCOUNT_CAMPAIGN } from "@/lib/discount-campaign";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Count approved orders using Orbit100 coupon
    const { count: approvedCount, error: approvedErr } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("provider_transaction_id", `%${DISCOUNT_CAMPAIGN.CODE}%`)
      .eq("status", "approved");

    if (approvedErr) {
      console.error("[CAMPAIGN_API] Error fetching approved discount orders:", approvedErr);
    }

    // Count pending orders using Orbit100 coupon
    const { count: pendingCount, error: pendingErr } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("provider_transaction_id", `%${DISCOUNT_CAMPAIGN.CODE}%`)
      .eq("status", "pending");

    if (pendingErr) {
      console.error("[CAMPAIGN_API] Error fetching pending discount orders:", pendingErr);
    }

    const campaign = getCampaignInfo(approvedCount ?? 0, pendingCount ?? 0);
    return NextResponse.json(campaign);
  } catch (err: any) {
    console.error("[CAMPAIGN_API] Unexpected error:", err);
    // Fallback info with 0 approved keys
    return NextResponse.json(getCampaignInfo(0, 0));
  }
}

