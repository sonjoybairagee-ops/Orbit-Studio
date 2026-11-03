import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { canManageWorkspace } from "@/lib/agency/permissions";

const PLAN_QUOTAS: Record<string, { bytes: number; name: string; priceUSD: number; priceBDT: number }> = {
  starter: {
    bytes: 25 * 1024 * 1024 * 1024, // 25 GB
    name: "Production Starter",
    priceUSD: 19,
    priceBDT: 2000,
  },
  pro: {
    bytes: 100 * 1024 * 1024 * 1024, // 100 GB
    name: "Studio Pro",
    priceUSD: 49,
    priceBDT: 5000,
  },
  agency: {
    bytes: 500 * 1024 * 1024 * 1024, // 500 GB
    name: "Enterprise Agency",
    priceUSD: 149,
    priceBDT: 15000,
  },
};

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, targetTier, paymentMethod, txnRef } = body;

    if (!workspaceId || !targetTier || !PLAN_QUOTAS[targetTier]) {
      return NextResponse.json({ error: "Valid workspaceId and targetTier are required." }, { status: 400 });
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role || !canManageWorkspace(role)) {
      return NextResponse.json({ error: "Only workspace owners can upgrade plans." }, { status: 403 });
    }

    const planInfo = PLAN_QUOTAS[targetTier];
    const adminClient = createAdminClient();

    // Upgrade workspace plan tier and storage quota
    const { data: updatedWs, error: wsErr } = await adminClient
      .from("workspaces")
      .update({
        plan_tier: targetTier,
        storage_quota_bytes: planInfo.bytes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workspaceId)
      .select("*")
      .single();

    if (wsErr || !updatedWs) {
      throw new Error(wsErr?.message || "Failed to update workspace plan.");
    }

    // Log activity
    await adminClient.from("agency_activity_logs").insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      actor_name: user.user_metadata?.full_name || user.email || "Owner",
      action: "plan.upgraded",
      resource_type: "workspace",
      resource_id: workspaceId,
      details: {
        newPlan: targetTier,
        quotaGB: planInfo.bytes / (1024 * 1024 * 1024),
        paymentMethod: paymentMethod || "manual",
        txnRef: txnRef || "MANUAL_ACTIVATION",
      },
    });

    return NextResponse.json({
      success: true,
      workspace: updatedWs,
      plan: planInfo.name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process upgrade" }, { status: 500 });
  }
}
