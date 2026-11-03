"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Film,
  FolderTree,
  ShieldCheck,
  HardDrive,
  Settings,
  ArrowLeft,
  Sparkles,
  Plus,
} from "lucide-react";
import { Workspace, WorkspaceRole } from "@/types/agency";

interface AgencySidebarProps {
  workspace: Workspace;
  role: WorkspaceRole;
  userEmail?: string | null;
}

const NAV_ITEMS = [
  { href: "/dashboard/agency", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agency/clients", label: "Clients", icon: Users },
  { href: "/dashboard/agency/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/agency/reviews", label: "Video Reviews", icon: Film },
  { href: "/dashboard/agency/files", label: "File Manager", icon: FolderTree },
  { href: "/dashboard/agency/team", label: "Team & Roles", icon: ShieldCheck },
  { href: "/dashboard/agency/storage", label: "Storage & Plans", icon: HardDrive },
  { href: "/dashboard/agency/settings", label: "Settings", icon: Settings },
];

export function AgencySidebar({ workspace, role }: AgencySidebarProps) {
  const pathname = usePathname();

  const used = Number(workspace.storage_used_bytes || 0);
  const quota = Number(workspace.storage_quota_bytes || 2147483648);
  const reserved = Number(workspace.reserved_bytes || 0);

  const usedMB = (used / (1024 * 1024)).toFixed(0);
  const totalGB = (quota / (1024 * 1024 * 1024)).toFixed(1);
  const usedPercent = Math.min(100, Math.round((used / quota) * 100) || 0);
  const reservedPercent = Math.min(100 - usedPercent, Math.round((reserved / quota) * 100) || 0);

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-[#213026] bg-[#070d09] min-h-[calc(100vh-5rem)] p-4">
      <div className="space-y-6">
        {/* Workspace Brand Capsule */}
        <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-[#3cff5f] uppercase bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-full font-bold">
              Agency OS
            </span>
            <span className="text-[10px] font-mono uppercase text-[#8da194]">
              {workspace.plan_tier} tier
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#102a16] to-[#1c4524] border border-[#3cff5f]/30 flex items-center justify-center text-[#3cff5f] font-black text-sm shrink-0 shadow-sm shadow-[#3cff5f]/20">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-[#e7eee9] truncate leading-tight">
                {workspace.name}
              </h2>
              <p className="text-[10px] text-[#62776a] capitalize">{role} access</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard/agency"
                ? pathname === "/dashboard/agency"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#102a16] border border-[#3cff5f]/40 text-[#3cff5f] shadow-sm shadow-[#3cff5f]/15"
                    : "text-[#8da194] hover:bg-[#0c1510] hover:text-[#e7eee9] border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#3cff5f]" : "text-[#62776a]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer widgets: Storage Gauge + Return to Orbit Licenses */}
      <div className="space-y-3 pt-4 border-t border-[#1b2720]">
        {/* Storage usage widget */}
        <div className={`rounded-xl border p-3 ${workspace.is_over_quota ? "border-red-500/40 bg-red-950/20" : "border-[#213026] bg-[#0c1510]/80"}`}>
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
            <span className="text-[#8da194] flex items-center gap-1">
              <HardDrive className={`h-3 w-3 ${workspace.is_over_quota ? "text-red-400" : "text-[#3cff5f]"}`} />
              <span className={workspace.is_over_quota ? "text-red-300 font-bold" : ""}>
                {workspace.is_over_quota ? "Over Quota" : "Storage"}
              </span>
            </span>
            <span className="text-[#e7eee9] font-mono">{usedPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#1b2720] overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                workspace.is_over_quota || usedPercent > 85 ? "bg-red-500" : usedPercent > 60 ? "bg-yellow-400" : "bg-[#3cff5f]"
              }`}
              style={{ width: `${Math.max(4, usedPercent)}%` }}
            />
            {reservedPercent > 0 && (
              <div
                className="h-full bg-[#4da6ff] animate-pulse transition-all duration-500"
                style={{ width: `${reservedPercent}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[#62776a] font-mono">
            <span>{usedMB} MB used</span>
            <span>{totalGB} GB cap</span>
          </div>
        </div>

        {/* Switch back to standard license dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-[#213026] bg-[#080e0b] hover:bg-[#102a16] text-[#8da194] hover:text-[#3cff5f] text-xs font-bold transition-all text-center"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit to Orbit Licenses</span>
        </Link>
      </div>
    </aside>
  );
}

