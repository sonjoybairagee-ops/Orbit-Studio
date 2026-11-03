import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { FrameSlimSidebar } from "@/components/agency/FrameSlimSidebar";
import { FrameTopBar } from "@/components/agency/FrameTopBar";

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
      <div className="fixed inset-0 z-50 bg-[#0d0f15] flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-3xl border border-[#222838] bg-[#121520] p-6 sm:p-8 shadow-2xl text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#1b2234] border border-[#2b354d] text-[#4d6fff] flex items-center justify-center mx-auto mb-4 text-xl">
            ⚡
          </div>
          <span className="inline-block rounded-full bg-[#1b2234] border border-[#2b354d] px-3 py-1 text-xs font-semibold text-[#4d6fff] mb-3">
            Database Migration Required
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Agency OS Schema Not Installed Yet
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#8d9ab2] leading-relaxed">
            The Agency OS database tables have not been created in your Supabase project yet.
            Please open your Supabase Dashboard, go to <b>SQL Editor</b>, and run the migration script:
          </p>
          <div className="mt-4 rounded-xl bg-[#090b10] border border-[#1b2030] p-3 text-left font-mono text-xs text-[#3cff5f] break-all select-all">
            supabase/migrations/20261104000000_agency_os_core.sql
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl border border-[#222838] bg-[#171b28] px-4 py-2.5 text-xs font-bold text-[#8d9ab2] hover:text-white transition-all"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/agency"
              className="rounded-xl bg-[#4d6fff] px-5 py-2.5 text-xs font-black text-white hover:bg-[#5f7eff] transition-all cursor-pointer inline-flex items-center justify-center shadow-lg shadow-[#4d6fff]/25"
            >
              Retry Connection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[#0d0f15] text-[#e7eee9] overflow-hidden select-none">
      {/* 1. Left Slim Navigation Rail (Frame.io 1:1) */}
      <FrameSlimSidebar
        workspace={workspace}
        role={role}
        userEmail={user.email}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top App Bar with centered Search */}
        <FrameTopBar workspace={workspace} />

        {/* Dynamic Route Content (Projects, Review Room, CRM, Storage, Team) */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
