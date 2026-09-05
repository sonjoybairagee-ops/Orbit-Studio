"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Activation = {
  id: string;
  device_label: string | null;
  os: string | null;
  host_apps: string[] | null;
  app_version: string | null;
  first_seen: string;
  last_seen: string;
};

export type LicenseView = {
  id: string;
  order_id?: string | null;
  key: string;
  status: "active" | "suspended" | "revoked" | "expired";
  license_type: "paid" | "legacy_demo" | "trial" | "nfr";
  max_devices: number;
  grace_days: number;
  expires_at: string | null;
  last_reset_at: string | null;
  revoked_reason: string | null;
  planName: string;
  products: { slug: string; name: string }[];
  activations: Activation[];
  pendingReset: boolean;
};

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function cooldownLeft(lastResetAt: string | null) {
  if (!lastResetAt) return 0;
  return Math.max(0, COOLDOWN_MS - (Date.now() - new Date(lastResetAt).getTime()));
}

function humanHours(ms: number) {
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.ceil((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LicenseCard({ license }: { license: LicenseView }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [reason, setReason] = useState("");

  const seatsUsed = license.activations.length;
  const cooldown = cooldownLeft(license.last_reset_at);
  const isLegacy =
    license.license_type === "legacy_demo" ||
    (license.planName || "").toLowerCase().includes("v1.1.1") ||
    (license.planName || "").toLowerCase().includes("legacy");

  const cleanPlanName = (license.planName || "")
    .replace(/\s*Bundle\s*/gi, " ")
    .replace(/compX\s*/gi, "")
    .trim() || "Orbit Suite Pro";

  // Determine primary last seen
  const lastActiveIso = license.activations[0]?.last_seen;

  async function post(url: string, body: unknown, tag: string) {
    setBusy(tag);
    setNote(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote({ kind: "err", text: data.error ?? "Something went wrong." });
      } else {
        setNote({ kind: "ok", text: data.message ?? "Done." });
        setShowReset(false);
        setReason("");
        router.refresh();
      }
    } catch {
      setNote({ kind: "err", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function download(slug: string) {
    setBusy(`dl-${slug}`);
    setNote(null);
    try {
      const res = await fetch(`/api/download?slug=${encodeURIComponent(slug)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setNote({ kind: "err", text: data.error ?? "Download failed." });
      else window.location.href = data.url;
    } catch {
      setNote({ kind: "err", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c100e]/95 p-5 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-[#45c66d]/30">
      {/* ── Top Header Row (FLEX style) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-[#45c66d]/15 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[#45c66d] border border-[#45c66d]/30">
            {isLegacy ? "COMPX LEGACY" : cleanPlanName.toUpperCase()}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="relative flex h-2 w-2">
              {license.status === "active" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45c66d] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  license.status === "active" ? "bg-[#45c66d]" : "bg-amber-400"
                }`}
              ></span>
            </span>
            <span
              className={license.status === "active" ? "text-[#45c66d]" : "text-amber-400"}
            >
              {license.status.toUpperCase()}
            </span>
          </div>

          {lastActiveIso && (
            <span className="text-xs text-[#717b8c]">
              Last used: {when(lastActiveIso)}
            </span>
          )}
        </div>

        {/* ── Prominent Download Button (Top Right) ── */}
        <div className="flex flex-wrap items-center gap-2">
          {isLegacy ? (
            <button
              className="flex items-center gap-2 rounded-xl bg-[#45c66d] px-4 py-2 text-xs font-black text-black shadow-[0_0_20px_rgba(69,198,109,0.3)] transition-all hover:bg-[#38b55e] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              disabled={busy !== null}
              onClick={() => download("compx-v111")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{busy === "dl-compx-v111" ? "Preparing…" : "DOWNLOAD (.ZXP)"}</span>
            </button>
          ) : (
            <>
              {license.products
                .filter((p) => !/compx/i.test(p.slug))
                .map((p) => {
                  const isPr = /premiere|[-_]pr$/i.test(p.slug);
                  const label = isPr ? "Orbit Premiere (.zxp)" : "Orbit Studio (.zxp)";
                  return (
                    <button
                      key={p.slug}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 ${
                        isPr
                          ? "bg-[#18231c] text-[#45c66d] border border-[#45c66d]/40 hover:bg-[#45c66d]/20"
                          : "bg-[#45c66d] text-black shadow-[0_0_20px_rgba(69,198,109,0.3)] hover:bg-[#38b55e]"
                      }`}
                      disabled={busy !== null}
                      onClick={() => download(p.slug)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>{busy === `dl-${p.slug}` ? "Preparing…" : label}</span>
                    </button>
                  );
                })}
            </>
          )}

          {license.order_id && (
            <a
              href={`/invoice/${license.order_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[#aab0bd] hover:border-white/20 hover:text-white transition-all"
              title="View Invoice"
            >
              <span>📄</span>
              <span className="hidden sm:inline">Invoice</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Key Display Row ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/40 border border-white/[0.05] p-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6c788a]">Key:</span>
          <code className="font-mono text-sm sm:text-base font-bold tracking-widest text-[#45c66d] break-all select-all">
            {license.key}
          </code>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95"
          onClick={async () => {
            setCopied(false);
            try {
              await navigator.clipboard.writeText(license.key);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setNote({ kind: "err", text: "Could not copy the key. Select the key and copy it manually." });
            }
          }}
        >
          {copied ? (
            <>
              <span className="text-[#45c66d]">✓</span>
              <span className="text-[#45c66d]">Copied</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* ── Feedback Message ── */}
      {note && (
        <div role="status" aria-live="polite"
          className={`mt-3 rounded-xl p-3 text-xs font-bold ${
            note.kind === "ok"
              ? "bg-[#45c66d]/10 border border-[#45c66d]/30 text-[#45c66d]"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {note.text}
        </div>
      )}

      {/* ── Device Bindings Section ── */}
      <div className="mt-5 rounded-xl border border-white/[0.05] bg-black/20 p-4">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.04]">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>💻</span> Devices:{" "}
            <span className="text-[#45c66d]">
              {seatsUsed}/{license.max_devices} active
            </span>
          </span>
          <span className="text-[11px] text-[#697485]">Shared by AE &amp; PR</span>
        </div>

        {seatsUsed === 0 ? (
          <p className="mt-3 text-xs text-[#717b8c] italic">
            No devices bound yet. Paste your key in After Effects or Premiere Pro to activate.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {license.activations.map((a, idx) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#45c66d] shrink-0"></span>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">
                      Device #{idx + 1}: {a.device_label || "Active Computer"}
                    </p>
                    <p className="text-[11px] text-[#6e7a8a] mt-0.5">
                      {[
                        a.os,
                        a.host_apps?.length
                          ? a.host_apps.map((h) => (h === "AEFT" ? "After Effects" : "Premiere Pro")).join(", ")
                          : null,
                        a.app_version ? `v${a.app_version}` : null,
                        `Last active ${when(a.last_seen)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                <button
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50"
                  disabled={busy !== null || cooldown > 0 || license.status !== "active"}
                  onClick={() =>
                    post("/api/license/release-device", { licenseId: license.id, activationId: a.id }, a.id)
                  }
                >
                  {busy === a.id ? "Releasing…" : "Release Device"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Cooldown / Reset Notice ── */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-[#717b8c]">
          {cooldown > 0 ? (
            <span>
              Device transfer cooldown: <b className="text-white">{humanHours(cooldown)}</b> remaining.
            </span>
          ) : (
            <span>One device change permitted every 24h.</span>
          )}

          {!license.pendingReset && (
            <button
              className="text-[#45c66d] hover:underline font-semibold"
              onClick={() => setShowReset(!showReset)}
            >
              {showReset ? "Cancel Request" : "Request Admin Reset"}
            </button>
          )}

          {license.pendingReset && (
            <span className="font-bold text-amber-400">⏳ Reset request under review</span>
          )}
        </div>
      </div>

      {/* ── Admin Reset Form Modal/Accordion ── */}
      {showReset && !license.pendingReset && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 animate-in fade-in">
          <p className="text-xs font-bold text-white mb-1.5">Why do you need a device reset?</p>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-xs text-white placeholder-[#5d6878] focus:border-[#45c66d] focus:outline-none min-h-[70px]"
            placeholder="e.g. My laptop motherboard crashed and I cannot release the seat myself."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <div className="mt-2.5 flex items-center gap-2">
            <button
              className="btn-primary px-4 py-1.5 text-xs font-bold"
              disabled={busy !== null || reason.trim().length < 5}
              onClick={() =>
                post("/api/device-reset", { licenseId: license.id, reason: reason.trim() }, "reset")
              }
            >
              {busy === "reset" ? "Submitting…" : "Submit Request"}
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#aab0bd] hover:bg-white/5"
              onClick={() => setShowReset(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LicenseCard;
