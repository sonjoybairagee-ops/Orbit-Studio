import { createAdminClient } from "@/lib/supabase/admin";

export interface GiveawayEntry {
  id: string;
  full_name: string;
  email: string;
  social_share_url: string;
  platform: "facebook" | "twitter" | "linkedin" | "instagram" | "youtube" | "reddit" | "whatsapp" | "threads" | "other";
  preferred_app: "AEFT" | "PPRO" | "BOTH";
  status: "pending" | "winner" | "disqualified";
  is_winner: boolean;
  winner_selected_at?: string | null;
  notes?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at?: string;
}

export const GIVEAWAY_CONFIG = {
  TITLE: "CompX Orbit Studio 50 Free Licenses Giveaway",
  TOTAL_WINNERS: 50,
  DURATION_DAYS: 30,
  // 30 days from launch window (Deadline: 18 December 2026 23:59:59 GMT+6)
  END_DATE: "2026-12-18T23:59:59+06:00",
  TARGET_TIMESTAMP: new Date("2026-12-18T23:59:59+06:00").getTime(),
  DEFAULT_SHARE_MESSAGE:
    "🚀 CompX Orbit Studio is giving away 50 FREE Lifetime Extension Licenses for Adobe After Effects & Premiere Pro! Dock 7 creative workspaces inside your editor. Claim your spot here:",
  SITE_URL: "https://compxorbit.com",
};

/**
 * Detect social media platform from submitted URL
 */
export function detectPlatform(url: string): GiveawayEntry["platform"] {
  const lower = (url || "").toLowerCase();
  if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.includes("fb.com")) {
    return "facebook";
  }
  if (lower.includes("twitter.com") || lower.includes("x.com") || lower.includes("t.co")) {
    return "twitter";
  }
  if (lower.includes("linkedin.com")) {
    return "linkedin";
  }
  if (lower.includes("instagram.com")) {
    return "instagram";
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }
  if (lower.includes("reddit.com")) {
    return "reddit";
  }
  if (lower.includes("whatsapp.com") || lower.includes("wa.me")) {
    return "whatsapp";
  }
  if (lower.includes("threads.net")) {
    return "threads";
  }
  return "other";
}

/**
 * Save or update a giveaway claim (with dual-layer fallback to admin_logs)
 */
export async function saveGiveawayClaim(entry: {
  fullName: string;
  email: string;
  socialShareUrl: string;
  preferredApp?: "AEFT" | "PPRO" | "BOTH";
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ ok: boolean; entryId?: string; error?: string }> {
  const adminClient = createAdminClient();
  const normalizedEmail = entry.email.trim().toLowerCase();
  const platform = detectPlatform(entry.socialShareUrl);

  const payload = {
    full_name: entry.fullName.trim(),
    email: normalizedEmail,
    social_share_url: entry.socialShareUrl.trim(),
    platform,
    preferred_app: entry.preferredApp || "BOTH",
    status: "pending" as const,
    is_winner: false,
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
    updated_at: new Date().toISOString(),
  };

  try {
    // 1. Try upserting into public.giveaway_entries table
    const { data, error } = await adminClient
      .from("giveaway_entries")
      .upsert(payload, { onConflict: "email" })
      .select("id")
      .single();

    if (!error && data?.id) {
      return { ok: true, entryId: data.id };
    }

    // If table doesn't exist (error code 42P01) or other schema error, fallback to admin_logs
    if (error && (error.code === "42P01" || error.message?.includes("schema cache") || error.message?.includes("relation"))) {
      console.warn("[GIVEAWAY] Table giveaway_entries not found, storing in admin_logs fallback:", error.message);
      const fallbackId = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const logPayload = {
        admin_id: "00000000-0000-0000-0000-000000000000",
        action: "giveaway_entry",
        target_id: normalizedEmail,
        details: {
          id: fallbackId,
          ...payload,
          created_at: new Date().toISOString(),
        },
      };

      const { error: logErr } = await adminClient.from("admin_logs").insert(logPayload);
      if (logErr) {
        console.error("[GIVEAWAY] Fallback insert failed:", logErr);
        return { ok: false, error: logErr.message };
      }
      return { ok: true, entryId: fallbackId };
    }

    if (error) {
      console.error("[GIVEAWAY] Upsert error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[GIVEAWAY] Unexpected exception:", err);
    return { ok: false, error: err?.message || "Internal database error" };
  }
}

/**
 * Fetch all giveaway entries (supports both giveaway_entries table & admin_logs fallback)
 */
export async function getAllGiveawayEntries(): Promise<GiveawayEntry[]> {
  const adminClient = createAdminClient();

  try {
    // 1. Attempt reading from public.giveaway_entries
    const { data, error } = await adminClient
      .from("giveaway_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id,
        full_name: item.full_name,
        email: item.email,
        social_share_url: item.social_share_url,
        platform: item.platform || detectPlatform(item.social_share_url),
        preferred_app: item.preferred_app || "BOTH",
        status: item.status || "pending",
        is_winner: Boolean(item.is_winner),
        winner_selected_at: item.winner_selected_at || null,
        notes: item.notes || null,
        ip_address: item.ip_address || null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    }

    // 2. If table not found, query from admin_logs fallback
    console.warn("[GIVEAWAY] Reading entries from admin_logs fallback:", error?.message);
    const { data: logs, error: logsErr } = await adminClient
      .from("admin_logs")
      .select("id, target_id, details, created_at")
      .eq("action", "giveaway_entry")
      .order("created_at", { ascending: false });

    if (logsErr || !logs) {
      console.error("[GIVEAWAY] Failed to read admin_logs fallback:", logsErr);
      return [];
    }

    // Map unique by email
    const emailMap = new Map<string, GiveawayEntry>();
    for (const log of logs) {
      const details = log.details || {};
      const email = (details.email || log.target_id || "").toLowerCase();
      if (!email || emailMap.has(email)) continue;

      emailMap.set(email, {
        id: details.id || log.id,
        full_name: details.full_name || "Community Member",
        email,
        social_share_url: details.social_share_url || "",
        platform: details.platform || detectPlatform(details.social_share_url || ""),
        preferred_app: details.preferred_app || "BOTH",
        status: details.status || "pending",
        is_winner: Boolean(details.is_winner),
        winner_selected_at: details.winner_selected_at || null,
        notes: details.notes || null,
        ip_address: details.ip_address || null,
        created_at: details.created_at || log.created_at,
      });
    }

    return Array.from(emailMap.values());
  } catch (err) {
    console.error("[GIVEAWAY] Error fetching entries:", err);
    return [];
  }
}

/**
 * Update an individual entry's status
 */
export async function updateGiveawayEntry(
  id: string,
  email: string,
  updates: {
    status?: "pending" | "winner" | "disqualified";
    is_winner?: boolean;
    notes?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const adminClient = createAdminClient();
  const normalizedEmail = (email || "").toLowerCase();

  const payload: any = {
    updated_at: new Date().toISOString(),
  };
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.is_winner !== undefined) {
    payload.is_winner = updates.is_winner;
    if (updates.is_winner) {
      payload.winner_selected_at = new Date().toISOString();
      payload.status = "winner";
    }
  }
  if (updates.notes !== undefined) payload.notes = updates.notes;

  try {
    // 1. Try updating giveaway_entries
    const { error } = await adminClient
      .from("giveaway_entries")
      .update(payload)
      .eq("email", normalizedEmail);

    if (!error) {
      return { ok: true };
    }

    // 2. Fallback update to admin_logs
    const { data: logs } = await adminClient
      .from("admin_logs")
      .select("id, details")
      .eq("action", "giveaway_entry")
      .eq("target_id", normalizedEmail)
      .limit(1);

    if (logs && logs.length > 0) {
      const current = logs[0];
      const mergedDetails = { ...(current.details || {}), ...payload };
      await adminClient
        .from("admin_logs")
        .update({ details: mergedDetails })
        .eq("id", current.id);
      return { ok: true };
    }

    return { ok: false, error: error?.message || "Entry not found" };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to update entry" };
  }
}

/**
 * Randomly pick N winners from eligible pending entries
 */
export async function selectRandomWinners(count = 50): Promise<{
  ok: boolean;
  selectedCount: number;
  winnerEmails: string[];
  error?: string;
}> {
  try {
    const entries = await getAllGiveawayEntries();
    // Exclude disqualified
    const eligible = entries.filter((e) => e.status !== "disqualified");

    // Shuffle eligible entries with Fisher-Yates
    const shuffled = [...eligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const winners = shuffled.slice(0, count);
    const winnerEmails = winners.map((w) => w.email);

    // Update each winner
    for (const winner of winners) {
      await updateGiveawayEntry(winner.id, winner.email, {
        status: "winner",
        is_winner: true,
      });
    }

    return {
      ok: true,
      selectedCount: winners.length,
      winnerEmails,
    };
  } catch (err: any) {
    return {
      ok: false,
      selectedCount: 0,
      winnerEmails: [],
      error: err?.message || "Failed to select winners",
    };
  }
}

/**
 * Reset all winners back to pending
 */
export async function resetAllWinners(): Promise<{ ok: boolean }> {
  try {
    const entries = await getAllGiveawayEntries();
    const currentWinners = entries.filter((e) => e.is_winner || e.status === "winner");
    for (const w of currentWinners) {
      await updateGiveawayEntry(w.id, w.email, {
        status: "pending",
        is_winner: false,
      });
    }
    return { ok: true };
  } catch (err) {
    return { ok: false };
  }
}
