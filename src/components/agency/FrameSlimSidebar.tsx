"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderKanban,
  Users,
  HardDrive,
  UserCheck,
  Search,
  Bell,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Workspace, WorkspaceRole } from "@/types/agency";

interface FrameSlimSidebarProps {
  workspace: Workspace;
  role: WorkspaceRole;
  userEmail?: string | null;
}

export function FrameSlimSidebar({
  workspace,
  role,
  userEmail,
}: FrameSlimSidebarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute initials (e.g. "SA" for Sonjoy Account or user email)
  const displayName = workspace.name || userEmail || "Sonjoy Account";
  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const navItems = [
    {
      label: "Home / Projects",
      href: "/dashboard/agency",
      icon: Home,
      isActive: pathname === "/dashboard/agency",
    },
    {
      label: "All Projects",
      href: "/dashboard/agency/projects",
      icon: FolderKanban,
      isActive: pathname.startsWith("/dashboard/agency/projects"),
    },
    {
      label: "Client CRM",
      href: "/dashboard/agency/clients",
      icon: UserCheck,
      isActive: pathname.startsWith("/dashboard/agency/clients"),
    },
    {
      label: "Cloud Storage",
      href: "/dashboard/agency/storage",
      icon: HardDrive,
      isActive: pathname.startsWith("/dashboard/agency/storage"),
    },
    {
      label: "Team Members",
      href: "/dashboard/agency/team",
      icon: Users,
      isActive: pathname.startsWith("/dashboard/agency/team"),
    },
  ];

  return (
    <aside className="w-14 sm:w-16 h-screen bg-[#090b10] border-r border-[#191d28] flex flex-col items-center justify-between py-4 select-none shrink-0 z-50">
      {/* Top Nav Rail */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* App Logo / Brand Glyph */}
        <Link
          href="/dashboard/agency"
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3cff5f] to-[#128a32] flex items-center justify-center text-[#050a08] font-black text-lg shadow-md shadow-[#3cff5f]/20 hover:scale-105 transition-transform"
          title="CompX Orbit Agency OS"
        >
          ⚡
        </Link>

        <div className="w-8 h-[1px] bg-[#1a1f2c] my-1" />

        {/* Primary Navigation Icons */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  item.isActive
                    ? "bg-[#181d2a] text-white shadow-sm"
                    : "text-[#758195] hover:text-white hover:bg-[#121622]"
                }`}
                title={item.label}
              >
                {/* Active Indicator Bar */}
                {item.isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#3cff5f] rounded-r-full" />
                )}
                <Icon className="h-5 w-5" />

                {/* Floating Tooltip */}
                <div className="absolute left-14 ml-2 px-2.5 py-1 rounded-lg bg-[#141824] border border-[#23293a] text-xs font-semibold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl z-50">
                  {item.label}
                </div>
              </Link>
            );
          })}

          {/* Quick Notification Bell */}
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative group w-10 h-10 rounded-xl flex items-center justify-center text-[#758195] hover:text-white hover:bg-[#121622] transition-all cursor-pointer"
            title="Activity Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#3cff5f]" />

            <div className="absolute left-14 ml-2 px-2.5 py-1 rounded-lg bg-[#141824] border border-[#23293a] text-xs font-semibold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
              Notifications
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Nav Rail */}
      <div className="flex flex-col items-center gap-3 w-full px-2 relative">
        {/* Return to Orbit Licenses */}
        <Link
          href="/dashboard"
          className="group relative w-10 h-10 rounded-xl flex items-center justify-center text-[#758195] hover:text-[#3cff5f] hover:bg-[#121622] transition-all"
          title="Orbit Studio Licenses"
        >
          <ExternalLink className="h-4 w-4" />
          <div className="absolute left-14 ml-2 px-2.5 py-1 rounded-lg bg-[#141824] border border-[#23293a] text-xs font-semibold text-[#e7eee9] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50">
            Orbit Studio Licenses ↗
          </div>
        </Link>

        {/* User Account Avatar (Pink Frame.io style) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff5470] to-[#e63956] text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-[#ff5470]/20 hover:scale-105 transition-transform cursor-pointer border border-white/10"
            title={displayName}
          >
            {initials}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute left-14 bottom-0 w-64 rounded-2xl bg-[#121520] border border-[#23293a] p-3 shadow-2xl z-50 text-left">
              <div className="flex items-center gap-3 pb-3 border-b border-[#1f2537]">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#ff5470] to-[#e63956] text-white font-black text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-[#78859e] truncate">{userEmail}</p>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5 text-xs text-[#8c97ad]">
                  <span>Plan</span>
                  <span className="rounded bg-[#1a2336] px-2 py-0.5 text-[10px] font-bold text-[#3cff5f] uppercase">
                    {workspace.plan_tier}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-xs text-[#8c97ad]">
                  <span>Role</span>
                  <span className="text-white capitalize text-xs">{role}</span>
                </div>
                <Link
                  href="/dashboard/agency/storage"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1a2030] text-xs text-white transition-colors"
                >
                  <span>Storage &amp; Billing</span>
                  <span className="text-[#3cff5f] font-mono text-[11px]">Upgrade ↗</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#1a2030] text-xs text-[#8c97ad] hover:text-white transition-colors"
                >
                  <span>Licenses Dashboard</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="pt-2 border-t border-[#1f2537]">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#2a171c] text-xs text-[#ff5470] font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
