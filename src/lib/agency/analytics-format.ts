/**
 * Analytics formatting helpers (shared by dashboard + export builders).
 * Pure functions — safe for both server and client components.
 */

export function formatBytes(bytes: number, fallback = "0 B"): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return fallback;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = units[0];
  for (let i = 1; i < units.length; i++) {
    if (value < 1024) break;
    value /= 1024;
    unit = units[i];
  }
  const digits = value >= 100 || unit === "B" ? 0 : 1;
  return `${value.toFixed(digits)} ${unit}`;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(digits)}%`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
