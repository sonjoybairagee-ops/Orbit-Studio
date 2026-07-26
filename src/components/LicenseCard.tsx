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

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Active", cls: "badge-green" },
  suspended: { label: "Suspended", cls: "badge-amber" },
  revoked: { label: "Revoked", cls: "badge" },
  expired: { label: "Expired", cls: "badge" },
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
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [reason, setReason] = useState("");

  const status = STATUS[license.status] ?? STATUS.expired;
  const seatsUsed = license.activations.length;
  const seatsFree = Math.max(0, license.max_devices - seatsUsed);
  const cooldown = cooldownLeft(license.last_reset_at);
  const isLegacy =
    license.license_type === "legacy_demo" ||
    (license.planName || "").toLowerCase().includes("v1.1.1") ||
    (license.planName || "").toLowerCase().includes("legacy");

  // Strip "Bundle" from plan name for clean presentation
  const cleanPlanName = (license.planName || "").replace(/\s*Bundle\s*/gi, " ").trim();

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
      const res = await fetch(
        `/api/download?slug=${encodeURIComponent(slug)}`,
      );
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
    <div className="card p-6 sm:p-7 border border-[#45c66d]/30 shadow-2xl">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{cleanPlanName}</h3>
            <span className={status.cls}>{status.label}</span>
            <span className="badge badge-green font-bold">✦ Lifetime Access</span>
            {isLegacy && <span className="badge">Legacy demo</span>}
          </div>
          <p className="muted mt-1 text.sm font-medium">
            {license.products.map((p) => p.name.replace(/\s*Bundle\s*/gi, " ")).join(" + ")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6c7a71]">
            Devices
          </p>
          <p className="text-2xl font-black text-[#45c66d]">
            {seatsUsed}
            <span className="muted text-base font-bold">/{license.max_devices}</span>
          </p>
        </div>
      </div>

      {/* license key */}
      <div className="mt-5 rounded-xl border border-[#45c66d]/40 bg-black/40 p-4 shadow-[0_0_20px_rgba(69,198,109,0.15)]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#45c66d]">
            🔑 YOUR CX LICENCE KEY
          </span>
          <span className="text-[10px] font-bold text-[#8fa896]">AE + PR Shared Seat</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <code className="flex-1 break-all font-mono text-base font-bold tracking-widest text-[#45c66d]">
            {license.key}
          </code>
          <button
            className="btn-primary shrink-0 px-5 py-2 text-xs font-black shadow-lg"
            onClick={() => {
              navigator.clipboard.writeText(license.key);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
          >
            {copied ? "✓ Copied Key" : "Copy Key"}
          </button>
        </div>
      </div>
      <p className="muted mt-2 text-xs leading-6">
        Paste this key into the panel the first time you open it. Works offline
        for up to {license.grace_days} days between check-ins.
      </p>

      {license.status === "revoked" && license.revoked_reason && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          This license was revoked: {license.revoked_reason}
        </div>
      )}

      {license.expires_at && (
        <p className="muted mt-3 text-sm">
          Expires {when(license.expires_at)}
        </p>
      )}

      {note && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            note.kind === "ok"
              ? "border-[#45c66d]/20 bg-[#45c66d]/10 text-[#9cf0b4]"
              : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          {note.text}
        </div>
      )}

      {/* devices */}
      <div className="mt-6">
        <p className="label mb-3">Activated devices</p>

        {seatsUsed === 0 ? (
          <p className="muted rounded-xl border border-dashed border-white/10 p-4 text-sm">
            No device activated yet. Open the panel in After Effects or Premiere
            Pro and enter your key.
          </p>
        ) : (
          <ul className="space-y-3">
            {license.activations.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {a.device_label ?? "Unnamed device"}
                  </p>
                  <p className="muted mt-1 text-xs">
                    {[
                      a.os,
                      a.host_apps?.length
                        ? a.host_apps
                            .map((h) => (h === "AEFT" ? "After Effects" : "Premiere Pro"))
                            .join(", ")
                        : null,
                      a.app_version ? `v${a.app_version}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="muted mt-1 text-xs">Last seen {when(a.last_seen)}</p>
                </div>
                <button
                  className="btn-secondary shrink-0 px-4 py-2 text-xs"
                  disabled={
                    busy !== null || cooldown > 0 || license.status !== "active"
                  }
                  onClick={() =>
                    post(
                      "/api/license/release-device",
                      { licenseId: license.id, activationId: a.id },
                      a.id,
                    )
                  }
                >
                  {busy === a.id ? "Releasing…" : "Release device"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {cooldown > 0 ? (
          <p className="muted mt-3 text-xs leading-6">
            Device changes are limited to once every 24 hours. Next change
            unlocks in <b className="text-white">{humanHours(cooldown)}</b>. Lost
            access to the old computer?{" "}
            <button
              className="font-bold text-[#45c66d] hover:underline"
              onClick={() => setShowReset(true)}
            >
              Request an admin reset
            </button>
            .
          </p>
        ) : (
          seatsFree === 0 && (
            <p className="muted mt-3 text-xs leading-6">
              All seats are in use. Release one above to free it up, or{" "}
              <button
                className="font-bold text-[#45c66d] hover:underline"
                onClick={() => setShowReset(true)}
              >
                request an admin reset
              </button>{" "}
              if the device is no longer reachable.
            </p>
          )
        )}

        {license.pendingReset && (
          <p className="mt-3 text-xs font-bold text-[#8ff0a9]">
            A reset request is awaiting review.
          </p>
        )}
      </div>

      {/* reset request form */}
      {showReset && !license.pendingReset && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="label">Why do you need a reset?</p>
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="e.g. My old laptop was stolen and I cannot release the seat myself."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <div className="mt-3 flex gap-3">
            <button
              className="btn-primary px-5 py-2 text-xs"
              disabled={busy !== null || reason.trim().length < 5}
              onClick={() =>
                post(
                  "/api/device-reset",
                  { licenseId: license.id, reason: reason.trim() },
                  "reset",
                )
              }
            >
              {busy === "reset" ? "Sending…" : "Submit request"}
            </button>
            <button
              className="btn-secondary px-5 py-2 text-xs"
              onClick={() => setShowReset(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* downloads */}
      {license.status === "active" && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="label mb-0">Official Downloads</p>
            <span className="text-[10px] font-bold text-[#45c66d]">
              {isLegacy ? "v1.1.2 Released" : "v2.3.1 Released (Windows & macOS)"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* If Legacy User (Redeemed Key) */}
            {isLegacy ? (
              <button
                className="btn-secondary flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all hover:border-[#45c66d] hover:text-[#45c66d]"
                disabled={busy !== null}
                onClick={() => download("compx-v111")}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#45c66d]/20 text-[#45c66d] text-[10px] font-black">
                  📦
                </span>
                <span className="truncate">
                  {busy === "dl-compx-v111" ? "Preparing…" : "Download CompX Precomp Manager (v1.1.2)"}
                </span>
              </button>
            ) : (
              <>
                {/* Orbit Studio extensions only — CompX is a separate product */}
                {license.products
                  .filter((p) => !/compx/i.test(p.slug))
                  .map((p) => {
                    const isPr = /premiere|[-_]pr$/i.test(p.slug);
                    const label = isPr ? "Orbit Studio (Premiere)" : "Orbit Studio (AE)";
                    const icon = isPr ? "Pr" : "Ae";
                    const iconBg = isPr ? "bg-[#9999ff]" : "bg-[#00005b]";
                    return (
                      <button
                        key={p.slug}
                        className="btn-secondary flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all hover:border-[#45c66d] hover:text-[#45c66d]"
                        disabled={busy !== null}
                        onClick={() => download(p.slug)}
                      >
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black text-white ${iconBg}`}>
                          {icon}
                        </span>
                        <span className="truncate">
                          {busy === `dl-${p.slug}` ? "Preparing…" : `Download ${label}`}
                        </span>
                      </button>
                    );
                  })}

                {/* Cloudflare R2 Bonus Downloads for $2 Paid Orbit Studio Users ONLY */}
                {!isLegacy && (
                  <>
                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("50 Mogrt pack.rar")}`}
                      className="btn-secondary flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all hover:border-[#eab308] hover:text-[#eab308]"
                      title="Download 50+ MOGRTs Templates Pack from Cloudflare R2"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/20 text-amber-400 text-[10px] font-black">
                        🎬
                      </span>
                      <span className="truncate">Download 50+ MOGRTs Pack</span>
                    </a>

                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("Sfx Part 1.zip")}`}
                      className="btn-secondary flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all hover:border-[#3b82f6] hover:text-[#3b82f6]"
                      title="Download 500+ Premium Audio SFX Collection (Part 1)"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/20 text-blue-400 text-[10px] font-black">
                        🎵
                      </span>
                      <span className="truncate">Download Premium SFX (Part 1)</span>
                    </a>

                    <a
                      href={`/api/download-asset?file=${encodeURIComponent("Sfx Part 2.zip")}`}
                      className="btn-secondary flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-bold transition-all hover:border-[#3b82f6] hover:text-[#3b82f6]"
                      title="Download 500+ Premium Audio SFX Collection (Part 2)"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/20 text-blue-400 text-[10px] font-black">
                        🎵
                      </span>
                      <span className="truncate">Download Premium SFX (Part 2)</span>
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Legacy v1.1.1 Upgrade Promo Card */}
          {isLegacy && (
            <div className="mt-4 rounded-xl border border-[#45c66d]/40 bg-[#45c66d]/10 p-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-white">🚀 Upgrade to CompX Orbit Studio v2.3.1</p>
                  <p className="muted mt-1 text-xs">
                    Get access to 7 Workspaces, 60+ Tools, 50+ MOGRTs & 500+ SFX Collection for just $2 USD (249 BDT).
                  </p>
                </div>
                <a href="/pricing" className="btn-primary px-5 py-2 text-xs font-bold shrink-0">
                  Upgrade Now ($2) →
                </a>
              </div>
            </div>
          )}

          <p className="muted mt-4 text-xs text-center">
            Official extension builds & Cloudflare R2 bonus asset packs (MOGRTs & SFX) are secured & tied to your active license.
          </p>
        </div>
      )}
    </div>
  );
}

export default LicenseCard;
