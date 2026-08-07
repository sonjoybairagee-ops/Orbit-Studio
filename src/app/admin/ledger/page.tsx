import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LedgerDashboard, type TransactionItem } from "@/components/LedgerDashboard";

export const dynamic = "force-dynamic";

export default async function AdminLedgerPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const supabase = await createClient();

  // Fetch ledger transactions
  const { data: ledgerEntries } = await supabase
    .from("ledger_transactions")
    .select("*")
    .order("date", { ascending: false });

  // Fetch approved orders (auto-revenue from system)
  const { data: approvedOrders } = await supabase
    .from("orders")
    .select("id, amount, currency, method, status, created_at, txn_ref, plans(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Map method to display account name
  const methodToAccount: Record<string, string> = {
    bkash: "bKash", nagad: "Nagad", paddle: "Paddle", manual: "Bank",
  };

  const orderTransactions: TransactionItem[] = (approvedOrders ?? []).map((o: any) => ({
    id: `order-${o.id}`,
    date: o.created_at,
    type: "income" as const,
    category: "License Sale",
    account: methodToAccount[o.method] || o.method || "Other",
    source: "Website",
    amount: Number(o.amount) || 0,
    currency: o.currency || "USD",
    description: `${(o.plans as any)?.name || "Product"} — Order #${o.id.slice(0, 8)} (Txn: ${o.txn_ref || "N/A"})`,
    is_system: true,
  }));

  const initialTransactions: TransactionItem[] = [
    ...((ledgerEntries as TransactionItem[]) ?? []),
    ...orderTransactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <LedgerDashboard initialTransactions={initialTransactions} />;
}
