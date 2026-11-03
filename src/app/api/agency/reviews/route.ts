import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  addVideoComment,
  getProjectVersionsWithComments,
} from "@/lib/agency/review-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const versions = await getProjectVersionsWithComments(projectId);
    return NextResponse.json({ versions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      versionId,
      projectId,
      timestampSeconds,
      commentText,
      authorName,
      authorEmail,
      parentId,
    } = body;

    if (!versionId || !projectId || commentText === undefined || timestampSeconds === undefined) {
      return NextResponse.json(
        { error: "versionId, projectId, timestampSeconds and commentText are required." },
        { status: 400 }
      );
    }

    // Try to get authenticated user if available, otherwise use client guest name
    const user = await getSessionUser();

    const comment = await addVideoComment({
      versionId,
      projectId,
      authorId: user?.id || null,
      authorName: authorName || user?.user_metadata?.full_name || user?.email || "Reviewer",
      authorEmail: authorEmail || user?.email || null,
      timestampSeconds: Number(timestampSeconds),
      commentText,
      parentId,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add comment" }, { status: 500 });
  }
}
