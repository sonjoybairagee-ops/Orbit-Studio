import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function InvoicePage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if caller is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  // Query order with profile, plan, and issued license
  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, amount, currency, method, status, txn_ref, created_at, reviewed_at, user_id,
      profiles ( email, full_name ),
      plans ( name, billing_type, price ),
      licenses ( key, max_devices )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (!order) notFound();

  // Access check: must be owner or admin
  if (order.user_id !== user.id && !isAdmin) {
    return (
      <div className="card p-10 text-center text-red-400">
        Unauthorized to view this invoice.
      </div>
    );
  }

  const customerName = (order.profiles as any)?.full_name || (order.profiles as any)?.email?.split("@")[0] || "Valued Customer";
  const customerEmail = (order.profiles as any)?.email || "N/A";
  const planName = (order.plans as any)?.name || "Orbit Studio License";
  const licenseKey = (order.licenses as any)?.[0]?.key || (order.licenses as any)?.key || "Issued upon approval";
  const maxDevices = (order.licenses as any)?.[0]?.max_devices || (order.licenses as any)?.max_devices || 1;

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const issueDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const methodNames: Record<string, string> = {
    bkash: "bKash Mobile Banking",
    nagad: "Nagad Mobile Banking",
    paddle: "Credit Card / PayPal (Paddle)",
    manual: "Bank Wire Transfer",
  };

  const formattedAmount =
    order.currency === "BDT"
      ? `৳${Number(order.amount).toLocaleString("bn-BD")}`
      : `$${Number(order.amount).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8">
      {/* ── Web Top Bar (Hidden when printing) ── */}
      <div className="print:hidden max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          href="/dashboard"
          className="text-xs font-bold text-[#aab0bd] hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/invoice/${params.id}`}
            target="_blank"
            className="btn-primary flex items-center gap-2 text-xs font-black px-5 py-2.5 shadow-lg"
          >
            <span>🖨️</span> Print / Save PDF Invoice
          </Link>
        </div>
      </div>

      {/* ── Printable Invoice Document ── */}
      <div className="max-w-3xl mx-auto bg-white text-gray-900 rounded-2xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Invoice Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
                C
              </span>
              <span className="text-xl font-black tracking-tight text-gray-900">
                CompX Orbit
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Creative Control Center</p>
            <p className="text-xs text-gray-500 mt-2">
              CompX Technologies Ltd.<br />
              Dhaka, Bangladesh<br />
              hello@compxorbit.com · www.compxorbit.com
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wider uppercase rounded-full border border-emerald-300">
              ✓ PAID & VERIFIED
            </span>
            <h1 className="text-2xl font-black text-gray-900 mt-2">INVOICE</h1>
            <p className="text-xs font-mono text-gray-600 font-bold mt-1">{invoiceNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Date: {issueDate}</p>
          </div>
        </div>

        {/* Billed To & Payment Details */}
        <div className="grid grid-cols-2 gap-6 my-8 text-xs">
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Billed To</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{customerName}</p>
            <p className="text-gray-600 mt-0.5">{customerEmail}</p>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Payment Information</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{methodNames[order.method] || order.method}</p>
            {order.txn_ref && (
              <p className="text-gray-600 font-mono mt-0.5">Txn ID: {order.txn_ref}</p>
            )}
            <p className="text-emerald-700 font-semibold mt-0.5">Status: Approved & Issued</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto my-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3">Item Description</th>
                <th className="py-3 text-center">Devices</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              <tr>
                <td className="py-4">
                  <p className="font-bold text-gray-900 text-sm">{planName}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Official Extension License Key for After Effects & Premiere Pro
                  </p>
                </td>
                <td className="py-4 text-center text-gray-700 font-bold">{maxDevices} Seat(s)</td>
                <td className="py-4 text-center text-gray-700 font-bold">1</td>
                <td className="py-4 text-right font-black text-gray-900 text-sm">{formattedAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">{formattedAmount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax / VAT:</span>
              <span>৳0.00</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 border-t-2 border-gray-900 pt-2">
              <span>Total Paid:</span>
              <span className="text-emerald-600">{formattedAmount}</span>
            </div>
          </div>
        </div>

        {/* Issued License Box */}
        {licenseKey && (
          <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
              🔑 Issued License Key
            </p>
            <p className="mt-1 font-mono text-lg font-black tracking-wider text-emerald-700">
              {licenseKey}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Enter this key inside After Effects or Premiere Pro panel to activate.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 border-t border-gray-200 pt-6 text-center text-[11px] text-gray-500">
          <p className="font-bold text-gray-700">Thank you for your business!</p>
          <p className="mt-1">
            This is a computer-generated official payment memo. For any billing or support queries, contact{" "}
            <span className="text-gray-900 font-semibold">support@compxorbit.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
