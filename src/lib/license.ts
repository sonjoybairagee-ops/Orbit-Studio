import { randomBytes } from "crypto";

export function generateLicenseKey(prefix = "CX"): string {
  const raw = randomBytes(16).toString("hex").toUpperCase();
  const groups = (raw.match(/.{1,4}/g) ?? []).slice(0, 4);
  return `${prefix}-${groups.join("-")}`;
}

export const RESET_COOLDOWN_HOURS = 24;

export function resetCooldownRemainingMs(lastResetAt: string | null): number {
  if (!lastResetAt) return 0;
  const elapsed = Date.now() - new Date(lastResetAt).getTime();
  const cooldown = RESET_COOLDOWN_HOURS * 60 * 60 * 1000;
  return Math.max(0, cooldown - elapsed);
}
