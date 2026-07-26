import { createClient } from "@/lib/supabase/server";
import { BulkPaymentList } from "@/components/BulkPaymentList";
import Link from "next/link";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const s = await createClient();
  const status = searchParams.status || "pending";
  const q = searchParams.q?.trim() ?? "";

  let query = s
    .from("orders")
    .select("*,profiles!orders_user_id_fkey(email),plans(name)")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`txn_ref.ilike.%${q}%,profiles.email.ilike.%${q}%`);
  }

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Manual verification</p>
          <h1 className="mt-2 text-3xl font-black">Payments</h1>
          <p className="muted mt-2">
            Inspect receipts and approve verified bKash payments to issue licenses
            instantly.
          </p>
        </div>
        <form action="/admin/payments" className="flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={q}
            className="input !mt-0 w-[240px]"
            placeholder="Search email or Txn ID…"
          />
        </form>
      </div>

      <div className="mt-6 flex gap-2 border-b border-white/10 pb-4">
        {["pending", "approved", "rejected"].map((tab) => (
          <Link
            key={tab}
            href={`/admin/payments?status=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              status === tab
                ? "bg-[#45c66d] text-black"
                : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <BulkPaymentList orders={orders ?? []} />
      </div>
    </div>
  );
}
