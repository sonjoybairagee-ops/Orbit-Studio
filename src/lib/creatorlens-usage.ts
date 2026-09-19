import { DAILY_UNITS } from "@/lib/studio-intelligence";

export { DAILY_UNITS };

export async function dailyUsage(admin: { from: (table: string) => unknown }, licenseId: string) {
  const client = admin as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          gte: (column: string, value: string) => Promise<{ data: Array<{ units?: number }> | null; error: unknown }>;
        };
      };
      insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
    };
  };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const used = await client.from("creatorlens_usage_events").select("units").eq("license_id", licenseId).gte("created_at", since);
  if (used.error) return { ok: false as const };
  const units = (used.data ?? []).reduce((sum, row) => sum + (row.units ?? 0), 0);
  return { ok: true as const, used: units, limit: DAILY_UNITS, remaining: Math.max(0, DAILY_UNITS - units) };
}

export async function recordUsage(admin: { from: (table: string) => unknown }, licenseId: string, operation: string, idempotencyKey: string) {
  const client = admin as {
    from: (table: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: unknown }> };
  };
  return client.from("creatorlens_usage_events").insert({
    license_id: licenseId,
    operation,
    units: 1,
    idempotency_key: idempotencyKey,
  });
}
