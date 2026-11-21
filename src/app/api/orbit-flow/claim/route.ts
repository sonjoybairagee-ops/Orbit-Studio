import { NextRequest, NextResponse } from "next/server";
import { saveOrbitFlowClaim } from "@/lib/orbitFlowClaims";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, email } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const result = await saveOrbitFlowClaim({
      fullName: fullName.trim(),
      email: email.trim(),
      ipAddress,
      userAgent,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error || "Failed to submit claim. Please try again.",
          alreadyApproved: result.alreadyApproved,
        },
        { status: result.alreadyApproved ? 409 : 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      claimId: result.claimId,
      alreadyPending: result.alreadyPending,
      message: result.alreadyPending
        ? "Your Orbit Flow claim is already registered and pending admin review!"
        : "Your claim has been submitted successfully! Once approved, your Orbit Flow license will automatically appear in your dashboard.",
    });
  } catch (err: any) {
    console.error("[ORBIT-FLOW-CLAIM-API] Submission error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
