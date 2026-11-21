import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllOrbitFlowClaims,
  approveOrbitFlowClaim,
  rejectOrbitFlowClaim,
} from "@/lib/orbitFlowClaims";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const claims = await getAllOrbitFlowClaims();

    const totalClaims = claims.length;
    const pendingCount = claims.filter((c) => c.status === "pending").length;
    const approvedCount = claims.filter((c) => c.status === "approved").length;
    const rejectedCount = claims.filter((c) => c.status === "rejected").length;

    return NextResponse.json({
      ok: true,
      claims,
      stats: {
        totalClaims,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load claims" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, id, email, notes } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (action === "approve") {
      const result = await approveOrbitFlowClaim(id, email, admin);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error || "Failed to approve claim" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        message: "Claim approved successfully and license issued!",
        licenseKey: result.licenseKey,
      });
    }

    if (action === "reject") {
      const result = await rejectOrbitFlowClaim(id, email, notes);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error || "Failed to reject claim" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        message: "Claim has been rejected.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[ADMIN-ORBIT-FLOW-CLAIMS] Action error:", err);
    return NextResponse.json(
      { error: err?.message || "Action failed" },
      { status: 500 }
    );
  }
}
