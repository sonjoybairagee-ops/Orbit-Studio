import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { StorageUpgradeClientView } from "./StorageUpgradeClientView";
import { WorkspaceStorageAddon, WorkspaceStorageTransaction } from "@/types/agency";

export const dynamic = "force-dynamic";

export default async function AgencyStoragePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);

  const adminClient = createAdminClient();

  // 1. Fetch active storage add-ons
  const { data: addonsData } = await adminClient
    .from("workspace_storage_addons")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // 2. Fetch recent ledger transactions (last 20)
  const { data: txnsData } = await adminClient
    .from("workspace_storage_transactions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <StorageUpgradeClientView
      initialWorkspace={workspace}
      initialAddons={(addonsData || []) as WorkspaceStorageAddon[]}
      initialTransactions={(txnsData || []) as WorkspaceStorageTransaction[]}
    />
  );
}
