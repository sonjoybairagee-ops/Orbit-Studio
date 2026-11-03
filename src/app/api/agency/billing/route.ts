import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { canManageWorkspace } from "@/lib/agency/permissions";
import { AGENCY_PLANS, STORAGE_ADDONS } from "@/lib/agency/pricing-config";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, targetTier, billingCycle = "monthly", addonId, paymentMethod, txnRef } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role || !canManageWorkspace(role)) {
      return NextResponse.json({ error: "Only workspace owners can upgrade plans." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch current workspace
    const { data: currentWs } = await adminClient
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (!currentWs) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    let newPlanTier = currentWs.plan_tier;
    let newQuotaBytes = currentWs.storage_quota_bytes;
    let actionDescription = "plan.upgraded";

    // Tier Upgrade logic
    if (targetTier && targetTier !== "free") {
      const planConfig = AGENCY_PLANS[targetTier as keyof typeof AGENCY_PLANS];
      if (!planConfig) {
        return NextResponse.json({ error: "Invalid target tier." }, { status: 400 });
      }
      newPlanTier = targetTier;
      newQuotaBytes = planConfig.storageBytes;
    }

    // Storage Add-on logic (adds extra quota to base plan)
    if (addonId) {
      const addon = STORAGE_ADDONS.find((a) => a.id === addonId);
      if (!addon) {
        return NextResponse.json({ error: "Invalid storage add-on." }, { status: 400 });
      }
      newQuotaBytes = newQuotaBytes + addon.bytes;
      actionDescription = "addon.purchased";
    }

    // Update workspace
    const { data: updatedWs, error: wsErr } = await adminClient
      .from("workspaces")
      .update({
        plan_tier: newPlanTier,
        storage_quota_bytes: newQuotaBytes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workspaceId)
      .select("*")
      .single();

    if (wsErr || !updatedWs) {
      throw new Error(wsErr?.message || "Failed to update workspace plan.");
    }

    // Audit log
    await adminClient.from("agency_activity_logs").insert({
      workspace_id: workspaceId,
      actor_id: user.id,
      actor_name: user.user_metadata?.full_name || user.email || "Owner",
      action: actionDescription,
      resource_type: "workspace",
      resource_id: workspaceId,
      details: {
        newPlan: newPlanTier,
        billingCycle,
        addonId: addonId || null,
        quotaGB: Math.round(newQuotaBytes / (1024 * 1024 * 1024)),
        paymentMethod: paymentMethod || "card",
        txnRef: txnRef || `ACT-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: updatedWs,
      plan: AGENCY_PLANS[newPlanTier as keyof typeof AGENCY_PLANS]?.name || newPlanTier,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process upgrade";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
