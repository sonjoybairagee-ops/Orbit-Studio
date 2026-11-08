import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";

/**
 * Return real-time storage metrics, active storage add-ons, and recent storage ledger transactions.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required." }, { status: 400 });
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch current workspace storage state
    const { data: ws, error: wsErr } = await adminClient
      .from("workspaces")
      .select("id, name, plan_tier, storage_quota_bytes, storage_used_bytes, reserved_bytes, is_over_quota")
      .eq("id", workspaceId)
      .single();

    if (wsErr || !ws) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    // 2. Fetch active add-ons
    const { data: addons } = await adminClient
      .from("workspace_storage_addons")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // 3. Fetch recent storage transactions (ledger)
    const { data: transactions } = await adminClient
      .from("workspace_storage_transactions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20);

    const quota = Number(ws.storage_quota_bytes || 0);
    const used = Number(ws.storage_used_bytes || 0);
    const reserved = Number(ws.reserved_bytes || 0);
    const available = Math.max(0, quota - used - reserved);
    const usedPercent = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
    const reservedPercent = quota > 0 ? Math.min(100, Math.round((reserved / quota) * 100)) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        quotaBytes: quota,
        usedBytes: used,
        reservedBytes: reserved,
        availableBytes: available,
        usedPercent,
        reservedPercent,
        isOverQuota: Boolean(ws.is_over_quota),
        planTier: ws.plan_tier,
      },
      addons: addons || [],
      recentTransactions: transactions || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load storage statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

