import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  const links = [
    ["▦", "Overview", "/admin"],
    ["◈", "Products", "/admin/extensions"],
    ["⌁", "Licenses", "/admin/licenses"],
    ["◎", "Customers", "/admin/users"],
    ["৳", "Payments", "/admin/payments"],
    ["↻", "Device resets", "/admin/resets"],
    ["📢", "Broadcast email", "/admin/broadcast"],
    ["💬", "Support", "/admin/support"],
    ["⚠", "Sharing signals", "/admin/abuse"],
    ["📋", "Activity logs", "/admin/logs"],
  ];
  return (
    <div className="mx-auto w-full px-4 py-10 sm:px-8 xl:px-12">
      <div className="dashboard-grid">
        <aside className="sidebar card p-3">
          <div className="mb-3 hidden px-3 py-3 md:block">
            <span className="badge badge-amber">Admin command center</span>
            <p className="muted mt-3 truncate text-xs">{admin.email}</p>
          </div>
          {links.map(([i, n, h]) => (
            <Link
              key={n}
              href={h}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#aab0bd] hover:bg-white/[.05] hover:text-white"
            >
              <span className="text-[#45c66d]">{i}</span>
              <span className="whitespace-nowrap">{n}</span>
            </Link>
          ))}
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
