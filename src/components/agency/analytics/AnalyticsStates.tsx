"use client";

import React from "react";

/**
 * Analytics dashboard state primitives (loading / empty / error / denied).
 * Matches the Agency OS surface language: #121520 panels, #222838 borders,
 * #3cff5f accents, compact and information-dense.
 */

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#222838] bg-[#121520] p-4 ${className}`}
    >
      <div className="h-2.5 w-24 rounded bg-[#1b2234] animate-pulse" />
      <div className="mt-3 h-6 w-28 rounded bg-[#1b2234] animate-pulse" />
      <div className="mt-3 h-2 w-full rounded bg-[#1b2234]/60 animate-pulse" />
    </div>
  );
}

export function SkeletonPanel({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#222838] bg-[#121520] p-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 rounded bg-[#1b2234] animate-pulse" />
        <div className="h-6 w-16 rounded bg-[#181d2a] animate-pulse" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-full rounded bg-[#141a2b] animate-pulse"
            style={{ opacity: 1 - i * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2b354d] bg-[#0f1219] p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b2234] border border-[#2b354d] text-[#758195]">
        {icon ?? "∫"}
      </div>
      <p className="text-sm font-bold text-[#e7eee9]">{title}</p>
      <p className="mt-1 text-xs text-[#758195] max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export function ErrorState({
  onRetry,
  message = "Analytics data could not be loaded.",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#3a1d26] bg-[#1a1116] p-6 text-center">
      <p className="text-sm font-bold text-[#ff5470]">Something went wrong</p>
      <p className="mt-1 text-xs text-[#a08b93]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-[#3a1d26] bg-[#241820] px-4 py-2 text-xs font-bold text-[#ff8fa3] hover:bg-[#2d1c26] transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function AccessDeniedState({ role }: { role?: string }) {
  return (
    <div className="p-6 sm:p-10 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full rounded-3xl border border-[#222838] bg-[#121520] p-8 text-center">
        <div className="h-12 w-12 rounded-2xl bg-[#2a1b22] border border-[#57303d] text-[#ff5470] flex items-center justify-center mx-auto mb-4 text-lg">
          🔒
        </div>
        <h1 className="text-lg font-black text-white">Analytics is restricted</h1>
        <p className="mt-2 text-xs text-[#8d9ab2] leading-relaxed">
          Workspace performance and storage insights are available to
          <span className="text-[#3cff5f] font-semibold"> Owner</span> and
          <span className="text-[#3cff5f] font-semibold"> Admin</span> roles only.
        </p>
        {role && (
          <p className="mt-4 inline-block rounded-full bg-[#1b2234] border border-[#2b354d] px-3 py-1 text-[11px] font-semibold text-[#8d9ab2]">
            Your role: <span className="text-white capitalize">{role}</span>
          </p>
        )}
        <p className="mt-6 text-[11px] text-[#5f6b82]">
          If you believe you need access, contact your workspace owner.
        </p>
      </div>
    </div>
  );
}
