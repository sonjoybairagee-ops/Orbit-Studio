import { createClient } from "@/lib/supabase/server";
import { ReviewButtons } from "@/components/ReviewButtons";

export default async function PaymentsPage() {
  const s = await createClient();
  const { data: orders } = await s
    .from("orders")
    .select("*,profiles!orders_user_id_fkey(email),plans(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return (
    <div>
      <p className="eyebrow">Manual verification</p>
      <h1 className="mt-2 text-3xl font-black">Pending payments</h1>
      <p className="muted mt-2">
        Inspect receipts and approve verified bKash payments to issue licenses
        instantly.
      </p>
      <div className="mt-8 space-y-3">
        {(orders ?? []).map((o: any) => (
          <article
            key={o.id}
            className="card flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <b>{o.plans?.name}</b>
                <span className="badge badge-amber">Pending</span>
              </div>
              <p className="muted mt-2 text-sm">
                {o.profiles?.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge">
                  {o.currency} {o.amount}
                </span>
                <span className="badge">Txn: {o.txn_ref ?? "—"}</span>
                <span className="badge">{o.method}</span>
                {o.receipt_path && (
                  <a
                    className="badge badge-amber hover:text-white"
                    href={`/api/admin/receipt?path=${encodeURIComponent(o.receipt_path)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View receipt ↗
                  </a>
                )}
              </div>
            </div>
            <ReviewButtons
              endpoint="/api/admin/approve-order"
              payloadKey="orderId"
              id={o.id}
            />
          </article>
        ))}
        {!orders?.length && (
          <div className="card grid min-h-52 place-items-center text-center">
            <div>
              <div className="text-3xl">✓</div>
              <b className="mt-3 block">Queue is clear</b>
              <p className="muted mt-1 text-sm">
                No payments waiting for review.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
