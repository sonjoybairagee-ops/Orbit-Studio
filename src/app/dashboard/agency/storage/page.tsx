import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { StorageUpgradeClientView } from "./StorageUpgradeClientView";

export const dynamic = "force-dynamic";

export default async function AgencyStoragePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace } = await getOrCreateDefaultWorkspace(user.id, user.email);

  return <StorageUpgradeClientView initialWorkspace={workspace} />;
}
