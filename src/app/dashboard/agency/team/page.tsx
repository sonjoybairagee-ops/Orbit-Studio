import { ShieldCheck, UserPlus, Mail, Shield, CheckCircle2 } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgencyTeamPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace, role } = await getOrCreateDefaultWorkspace(user.id, user.email);

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("workspace_members")
    .select(`
      id,
      role,
      joined_at,
      profiles ( id, email, full_name, role )
    `)
    .eq("workspace_id", workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-[#3cff5f]" />
            <span>Team Members &amp; Workspace Roles</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Manage your editing crew, project managers, and reviewer access with granular permission enforcement.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role explanation callout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { role: "Owner", desc: "Full control, billing & storage caps" },
          { role: "Admin", desc: "Manages projects, files & team" },
          { role: "Editor", desc: "Uploads cuts & manages revisions" },
          { role: "Reviewer", desc: "Inspects cuts & leaves timestamp notes" },
        ].map((r) => (
          <div key={r.role} className="rounded-2xl border border-[#213026] bg-[#0c1510] p-3.5">
            <span className="text-xs font-bold text-[#3cff5f] capitalize">{r.role}</span>
            <p className="text-[11px] text-[#8da194] mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
          <span>Active Workspace Members ({(members || []).length})</span>
        </h2>

        <div className="space-y-3">
          {(members || []).map((m: any) => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#213026] bg-[#080e0b] gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] font-black text-sm shrink-0">
                  {(m.profiles?.full_name || m.profiles?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#e7eee9]">
                    {m.profiles?.full_name || m.profiles?.email?.split("@")[0] || "Team Member"}
                    {m.profiles?.id === user.id && (
                      <span className="ml-2 text-[10px] text-[#3cff5f] font-mono">(You)</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-[#8da194]">{m.profiles?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#102a16] text-[#3cff5f] border border-[#2a5234]">
                  {m.role}
                </span>
                <span className="text-[10px] text-[#62776a] font-mono">
                  Joined {new Date(m.joined_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

