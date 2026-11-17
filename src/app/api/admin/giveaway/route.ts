import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllGiveawayEntries,
  updateGiveawayEntry,
  selectRandomWinners,
  resetAllWinners,
  GIVEAWAY_CONFIG,
} from "@/lib/giveaway";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await getAllGiveawayEntries();

    const totalClaims = entries.length;
    const winnersCount = entries.filter((e) => e.is_winner || e.status === "winner").length;
    const pendingCount = entries.filter((e) => e.status === "pending" && !e.is_winner).length;
    const disqualifiedCount = entries.filter((e) => e.status === "disqualified").length;

    const platformBreakdown: Record<string, number> = {};
    for (const entry of entries) {
      const p = entry.platform || "other";
      platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      entries,
      stats: {
        totalClaims,
        winnersCount,
        maxWinners: GIVEAWAY_CONFIG.TOTAL_WINNERS,
        pendingCount,
        disqualifiedCount,
        platformBreakdown,
        targetTimestamp: GIVEAWAY_CONFIG.TARGET_TIMESTAMP,
        endDate: GIVEAWAY_CONFIG.END_DATE,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load giveaway entries" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, email, status, is_winner, notes } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const res = await updateGiveawayEntry(id || "", email, {
      status,
      is_winner,
      notes,
    });

    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, count } = body;

    if (action === "draw_winners") {
      const result = await selectRandomWinners(count || GIVEAWAY_CONFIG.TOTAL_WINNERS);
      return NextResponse.json(result);
    }

    if (action === "reset_winners") {
      const result = await resetAllWinners();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Execution error" }, { status: 500 });
  }
}
