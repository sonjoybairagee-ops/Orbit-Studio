import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Fetch all custom ledger entries
  const { data: ledgerEntries, error: ledgerError } = await supabase
    .from("ledger_transactions")
    .select("*")
    .order("date", { ascending: false });

  if (ledgerError) {
    // Table might not exist yet in local DB, fallback gracefully to empty list
    console.error("Ledger query error:", ledgerError.message);
  }

  // Fetch approved system orders to synthesize automatically into revenue if desired
  const { data: approvedOrders } = await supabase
    .from("orders")
    .select("id, amount_bdt, payment_method, status, created_at, txn_ref")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Merge or map orders to transaction items
  const orderTransactions = (approvedOrders ?? []).map((o: any) => ({
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

  const allTransactions = [...(ledgerEntries ?? []), ...orderTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({ transactions: allTransactions });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, category, account, source, amount, currency, description, date } = body;

    if (!type || !category || !account || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ledger_transactions")
      .insert([
        {
          date: date || new Date().toISOString(),
          type,
          category,
          account,
          source: source || "Website",
          amount: Number(amount) || 0,
          currency: currency || "USD",
          description: description || "",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transaction: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  if (id.startsWith("order-")) {
    return NextResponse.json({ error: "System orders cannot be deleted from ledger" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ledger_transactions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
