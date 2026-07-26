import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { RedeemForm } from "@/components/RedeemForm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="w-full max-w-[1800px] mx-auto px-6 py-10">
      <div className="dashboard-grid">
        <aside className="sidebar card p-3 flex flex-col justify-between gap-4">
          <div>
            <div className="mb-3 hidden px-3 py-3 md:block border-b border-white/10 pb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#697181]">
                Customer workspace
              </p>
              <p className="mt-1 truncate text-sm font-bold text-white">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {[
                ["▦", "Overview", "/dashboard"],
                ["⌘", "My extensions", "/dashboard"],
                ["＋", "Browse products", "/pricing"],
                ["🛠️", "Installation guide", "/dashboard/installation"],
                ["◈", "Account security", "/dashboard"],
                ["💬", "Support", "/dashboard/support"],
              ].map(([i, n, h]) => (
                <Link
                  key={n}
                  href={h}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#aab0bd] hover:bg-white/[.05] hover:text-white"
                >
                  <span className="text-[#45c66d]">{i}</span>
                  <span className="whitespace-nowrap">{n}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Redeem Licence Key Sidebar Box ── */}
          <div className="pt-2">
            <RedeemForm />
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
