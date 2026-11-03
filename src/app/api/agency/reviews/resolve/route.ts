import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { toggleCommentResolved } from "@/lib/agency/review-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { commentId, isResolved } = body;

    if (!commentId) {
      return NextResponse.json({ error: "commentId is required" }, { status: 400 });
    }

    const updated = await toggleCommentResolved(commentId, Boolean(isResolved), user.id);
    return NextResponse.json({ comment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to toggle comment" }, { status: 500 });
  }
}
