/**
 * Agency OS Billing API
 *
 * Handles plan upgrades and storage add-on purchases.
 * All quota changes are atomic via Postgres RPC functions.
 * payment_ref provides idempotency for duplicate payment webhooks.
 */

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
    const {
      workspaceId,
      targetTier,
      billingCycle = "monthly",
      addonId,
      paymentRef,       // idempotency key (Stripe event ID, payment gateway txn, etc.)
      txnRef,
      expiresAt,        // ISO string — optional add-on expiry date
    } = body;
    const effectivePaymentRef = paymentRef || txnRef || null;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    // Authorization: only workspace owners/admins can change billing
    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role || !canManageWorkspace(role)) {
      return NextResponse.json(
        { error: "Only workspace owners can upgrade plans." },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // Fetch current workspace
    const { data: currentWs } = await adminClient
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (!currentWs) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    // -----------------------------------------------------------------------
    // Case 1: Plan Tier Upgrade
    // -----------------------------------------------------------------------
    if (targetTier && targetTier !== "free") {
      const planConfig = AGENCY_PLANS[targetTier as keyof typeof AGENCY_PLANS];
      if (!planConfig) {
        return NextResponse.json({ error: "Invalid target tier." }, { status: 400 });
      }

      const newQuotaBytes = planConfig.storageBytes;

      const { data: updatedWs, error: wsErr } = await adminClient
        .from("workspaces")
        .update({
          plan_tier:           targetTier,
          storage_quota_bytes: newQuotaBytes,
          // Clear over-quota if new plan is larger
          is_over_quota:
            currentWs.storage_used_bytes + currentWs.reserved_bytes > newQuotaBytes
              ? true
              : false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workspaceId)
        .select("*")
        .single();

      if (wsErr || !updatedWs) {
        throw new Error(wsErr?.message || "Failed to update workspace plan.");
      }

      // Ledger entry for plan upgrade
      await adminClient.from("workspace_storage_transactions").insert({
        workspace_id: workspaceId,
        event_type:   "quota_upgraded",
        delta_bytes:  newQuotaBytes - currentWs.storage_quota_bytes,
        balance_after: updatedWs.storage_used_bytes,
        actor_id:     user.id,
        note:         `Plan upgraded to ${targetTier} (${billingCycle})`,
      });

      // Audit log
      await adminClient.from("agency_activity_logs").insert({
        workspace_id: workspaceId,
        actor_id:     user.id,
        actor_name:   user.user_metadata?.full_name || user.email || "Owner",
        action:       "plan.upgraded",
        resource_type: "workspace",
        resource_id:   workspaceId,
        details: {
          newPlan:    targetTier,
          billingCycle,
          quotaGB:    Math.round(newQuotaBytes / (1024 * 1024 * 1024)),
          paymentRef: effectivePaymentRef,
        },
      });

      return NextResponse.json({
        success: true,
        workspace: updatedWs,
        plan: planConfig.name,
      });
    }

    // -----------------------------------------------------------------------
    // Case 2: Storage Add-on Purchase (atomic + idempotent)
    // -----------------------------------------------------------------------
    if (addonId) {
      const addon = STORAGE_ADDONS.find((a) => a.id === addonId);
      if (!addon) {
        return NextResponse.json({ error: "Invalid storage add-on." }, { status: 400 });
      }

      // Atomic add-on activation via Postgres function (idempotent via payment_ref)
      const { data: addonRecordId, error: rpcError } = await adminClient.rpc(
        "agency_activate_storage_addon",
        {
          p_workspace_id:  workspaceId,
          p_addon_id:      addonId,
          p_bytes_added:   addon.bytes,
          p_billing_cycle: billingCycle,
          p_payment_ref:   effectivePaymentRef,
          p_expires_at:    expiresAt || null,
          p_actor_id:      user.id,
        }
      );

      if (rpcError) {
        // Duplicate payment_ref = idempotent response
        if (rpcError.code === "23505") {
          return NextResponse.json({ success: true, duplicate: true });
        }
        throw new Error(rpcError.message || "Failed to activate storage add-on.");
      }

      // Fetch updated workspace state
      const { data: updatedWs } = await adminClient
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      // Audit log
      await adminClient.from("agency_activity_logs").insert({
        workspace_id:  workspaceId,
        actor_id:      user.id,
        actor_name:    user.user_metadata?.full_name || user.email || "Owner",
        action:        "addon.purchased",
        resource_type: "workspace",
        resource_id:   workspaceId,
        details: {
          addonId,
          bytesAdded:   addon.bytes,
          billingCycle,
          paymentRef:   effectivePaymentRef,
          addonRecordId,
        },
      });

      return NextResponse.json({
        success: true,
        workspace: updatedWs,
        addonRecordId,
        addon: addon.id,
      });
    }

    return NextResponse.json({ error: "No action specified." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process upgrade";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// -----------------------------------------------------------------------
// DELETE — Cancel a storage add-on
// -----------------------------------------------------------------------
export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, addonRecordId } = body;

    if (!workspaceId || !addonRecordId) {
      return NextResponse.json(
        { error: "workspaceId and addonRecordId are required." },
        { status: 400 }
      );
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role || !canManageWorkspace(role)) {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Verify addon belongs to workspace before cancellation
    const { data: addon } = await adminClient
      .from("workspace_storage_addons")
      .select("workspace_id")
      .eq("id", addonRecordId)
      .single();

    if (!addon || addon.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Add-on not found." }, { status: 404 });
    }

    // Atomic cancellation — may set is_over_quota=true, never deletes files
    const { error: rpcError } = await adminClient.rpc("agency_cancel_storage_addon", {
      p_addon_record_id: addonRecordId,
      p_actor_id:        user.id,
    });

    if (rpcError) {
      throw new Error(rpcError.message || "Failed to cancel add-on.");
    }

    const { data: updatedWs } = await adminClient
      .from("workspaces")
      .select("storage_quota_bytes, storage_used_bytes, is_over_quota")
      .eq("id", workspaceId)
      .single();

    return NextResponse.json({
      success: true,
      workspace: updatedWs,
      message: updatedWs?.is_over_quota
        ? "Add-on cancelled. Workspace is over quota — existing files preserved. New uploads are blocked until storage is freed or upgraded."
        : "Add-on cancelled successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel add-on";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
