import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllGiveawayEntries } from "@/lib/giveaway";
import { GiveawayAdminDashboard } from "@/components/admin/GiveawayAdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminGiveawayPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/dashboard");
  }

  const entries = await getAllGiveawayEntries();

  return <GiveawayAdminDashboard initialEntries={entries} />;
}
