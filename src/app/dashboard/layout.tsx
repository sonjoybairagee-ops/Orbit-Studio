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
                { icon: "▦", name: "Overview", href: "/dashboard" },
                { icon: "⌘", name: "My extensions", href: "/dashboard" },
                { icon: "▶", name: "Tutorials", href: "/tutorials" },
                { icon: "＋", name: "Browse products", href: "/pricing" },
                { icon: "🛠️", name: "Installation guide", href: "/dashboard/installation" },
                { icon: "◈", name: "Account security", href: "/dashboard" },
                { icon: "💬", name: "Support", href: "/dashboard/support" },
                {
                  isDiscord: true,
                  name: "Join Discord",
                  href: "https://discord.gg/Je8pxakYf",
                },
              ].map((item) =>
                item.isDiscord ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#aab0bd] hover:bg-[#5865F2]/10 hover:text-white transition-colors"
                  >
                    <span className="text-[#5865F2]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                      </svg>
                    </span>
                    <span className="whitespace-nowrap">{item.name}</span>
                    <span className="ml-auto text-[10px] text-[#5865F2] opacity-70">↗</span>
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#aab0bd] hover:bg-white/[.05] hover:text-white"
                  >
                    <span className="text-[#45c66d]">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                )
              )}
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
