import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllOrbitFlowClaims } from "@/lib/orbitFlowClaims";
import { OrbitFlowClaimsAdminDashboard } from "@/components/admin/OrbitFlowClaimsAdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrbitFlowClaimsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const claims = await getAllOrbitFlowClaims();

  return <OrbitFlowClaimsAdminDashboard initialClaims={claims} />;
}
