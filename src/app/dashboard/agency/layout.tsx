import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { AgencySidebar } from "@/components/agency/AgencySidebar";
import { Sparkles, Plus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  let workspace: any = null;
  let role: any = "owner";
  let migrationNeeded = false;

  try {
    const res = await getOrCreateDefaultWorkspace(
      user.id,
      user.email,
      user.user_metadata?.full_name
    );
    workspace = res.workspace;
    role = res.role;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AgencyLayout workspace load error:", msg);
    migrationNeeded = true;
  }

  if (migrationNeeded || !workspace) {
    return (
      <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-12 min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center mx-auto mb-4 text-xl">
            ⚡
          </div>
          <span className="inline-block rounded-full bg-[#102a16] border border-[#2a5234] px-3 py-1 text-xs font-semibold text-[#3cff5f] mb-3">
            Database Migration Required
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#e7eee9]">
            Agency OS Schema Not Installed Yet
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#8da194] leading-relaxed">
            The Agency OS database tables have not been created in your Supabase project yet.
            Please open your Supabase Dashboard, go to <b>SQL Editor</b>, and run the migration script:
          </p>
          <div className="mt-4 rounded-xl bg-[#050a08] border border-[#213026] p-3 text-left font-mono text-xs text-[#3cff5f] break-all select-all">
            supabase/migrations/20261104000000_agency_os_core.sql
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#213026] bg-[#080e0b] px-4 py-2.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] transition-all"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/agency"
              className="rounded-xl bg-[#3cff5f] px-5 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer inline-flex items-center justify-center"
            >
              Retry Connection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-12">
      {/* Top Agency OS Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#213026] bg-[#06100a]/95 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agency"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#3cff5f] to-[#168a35] flex items-center justify-center text-[#050a08] font-black shadow-md shadow-[#3cff5f]/25 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <span className="text-sm font-black text-[#e7eee9] flex items-center gap-1.5">
                <span>CompX Orbit Agency OS</span>
                <span className="rounded bg-[#102a16] border border-[#2a5234] px-1.5 py-0.2 text-[9px] font-mono text-[#3cff5f]">
                  PRO SAAS
                </span>
              </span>
              <p className="text-[10px] text-[#62776a]">
                Video Production, Client Portals &amp; Review Suite
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agency/projects"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-3.5 py-1.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </Link>
          <Link
            href="/dashboard/agency/clients"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3.5 py-1.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:border-[#3cff5f]/40 transition-all"
          >
            <span>+ Add Client</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#8da194] hover:text-[#3cff5f] transition-colors flex items-center gap-1"
          >
            <span>Licenses</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Agency Workspace Shell with Sidebar & Content */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#040806]">
        <AgencySidebar
          workspace={workspace}
          role={role}
          userEmail={user.email}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

