import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createProjectVersion } from "@/lib/agency/review-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { projectId, versionLabel, videoUrl, videoFileId, durationSeconds, changelog } = body;

    if (!projectId || !videoUrl) {
      return NextResponse.json({ error: "projectId and videoUrl are required." }, { status: 400 });
    }

    const version = await createProjectVersion({
      projectId,
      versionLabel: versionLabel || "v1",
      videoUrl,
      videoFileId,
      durationSeconds: Number(durationSeconds) || 0,
      changelog: changelog || "",
      createdBy: user.id,
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create version" }, { status: 500 });
  }
}
