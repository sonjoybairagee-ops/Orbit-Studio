import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { acceptWorkspaceInvitation } from "@/lib/agency/team-service";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { InviteAcceptButton } from "./InviteAcceptButton";

export const dynamic = "force-dynamic";

export default async function InviteAcceptancePage({
  params,
}: {
  params: { token: string };
}) {
  const adminClient = createAdminClient();

  // Find invitation
  const { data: invite, error } = await adminClient
    .from("workspace_invitations")
    .select(`
      *,
      workspaces ( id, name, plan_tier )
    `)
    .eq("token", params.token)
    .single();

  if (error || !invite) {
    notFound();
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  const isPending = invite.status === "pending";

  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[#050a08] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#213026] bg-[#0c1510] p-7 shadow-2xl text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f]">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 rounded-full font-bold">
            WORKSPACE INVITATION
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] mt-3">
            Join {(invite as any).workspaces?.name || "Agency Workspace"}
          </h1>
          <p className="text-xs text-[#8da194] mt-1.5">
            You've been invited to collaborate as an{" "}
            <strong className="text-[#3cff5f] uppercase">{invite.role}</strong>.
          </p>
        </div>

        {!isPending || isExpired ? (
          <div className="rounded-2xl bg-red-950/40 border border-red-800/40 p-4 text-xs text-red-300 space-y-1">
            <p className="font-bold">Invitation no longer valid</p>
            <p className="text-[11px] text-red-400">
              This invitation has either expired, been revoked, or already accepted.
            </p>
            <Link href="/dashboard" className="mt-3 inline-block font-bold text-[#3cff5f] hover:underline">
              Go to Dashboard →
            </Link>
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-3">
            <p className="text-xs text-[#8da194]">
              Please sign in to your CompX Orbit account to accept this invitation:
            </p>
            <Link
              href={`/login?redirect=/invite/${params.token}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#3cff5f] py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all"
            >
              <span>Sign in to Accept</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-xs text-[#8da194]">
              Signed in as: <strong className="text-[#e7eee9]">{user.email}</strong>
            </div>

            <InviteAcceptButton token={params.token} />
          </div>
        )}
      </div>
    </div>
  );
}

