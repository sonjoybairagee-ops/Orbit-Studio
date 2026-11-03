import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/agency/r2-storage-service";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, projectId, fileName, fileSizeBytes, mimeType, category } = body;

    if (!workspaceId || !projectId || !fileName || !fileSizeBytes) {
      return NextResponse.json(
        { error: "workspaceId, projectId, fileName, and fileSizeBytes are required." },
        { status: 400 }
      );
    }

    // Verify calling user is a workspace member (server-side membership check)
    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const presignedData = await createPresignedUploadUrl({
      workspaceId,
      projectId,
      userId: user.id,
      fileName,
      fileSizeBytes: Number(fileSizeBytes),
      mimeType: mimeType || "application/octet-stream",
      category: category || "original",
    });

    return NextResponse.json(presignedData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate upload URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
