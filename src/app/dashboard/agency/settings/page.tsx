import { Settings, Building, Palette, Shield, Globe } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getOrCreateDefaultWorkspace } from "@/lib/agency/workspace-service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgencySettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { workspace, role } = await getOrCreateDefaultWorkspace(user.id, user.email);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-[#3cff5f]" />
          <span>Agency Workspace Settings</span>
        </h1>
        <p className="text-xs text-[#8da194] mt-0.5">
          Configure agency branding, client portal themes, notification webhooks, and security settings.
        </p>
      </div>

      {/* General Settings Card */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-7 shadow-xl space-y-5">
        <h2 className="text-sm font-black text-[#e7eee9] flex items-center gap-2 border-b border-[#1b2720] pb-3">
          <Building className="h-4 w-4 text-[#3cff5f]" />
          <span>Agency Identity &amp; Branding</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#8da194] mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              defaultValue={workspace.name}
              className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8da194] mb-1">
              Workspace Slug / URL Identifier
            </label>
            <input
              type="text"
              disabled
              defaultValue={workspace.slug}
              className="w-full rounded-xl border border-[#213026] bg-[#080e0b]/50 px-3.5 py-2.5 text-xs font-mono text-[#62776a] cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8da194] mb-1">
            Client Review Portal Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              defaultValue="#3cff5f"
              className="h-9 w-14 rounded-xl border border-[#213026] bg-transparent cursor-pointer p-0"
            />
            <span className="text-xs font-mono text-[#3cff5f]">#3cff5f (Orbit Emerald)</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
          >
            Save Agency Settings
          </button>
        </div>
      </div>
    </div>
  );
}

