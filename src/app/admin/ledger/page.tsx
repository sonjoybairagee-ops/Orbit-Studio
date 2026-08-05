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

  // Fetch approved orders
  const { data: approvedOrders } = await supabase
    .from("orders")
    .select("id, amount_bdt, payment_method, status, created_at, txn_ref")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const orderTransactions: TransactionItem[] = (approvedOrders ?? []).map((o: any) => ({
    id: `order-${o.id}`,
    date: o.created_at,
    type: "income",
    category: "License Sale",
    account: o.payment_method ? o.payment_method.toUpperCase() : "bKash",
    source: "Website",
    amount: Number(o.amount_bdt) || 0,
    currency: "BDT",
    description: `Approved Order #${o.id.slice(0, 8)} (Txn: ${o.txn_ref || "N/A"})`,
    is_system: true,
  }));

  const initialTransactions: TransactionItem[] = [
    ...((ledgerEntries as TransactionItem[]) ?? []),
    ...orderTransactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return <LedgerDashboard initialTransactions={initialTransactions} />;
}
