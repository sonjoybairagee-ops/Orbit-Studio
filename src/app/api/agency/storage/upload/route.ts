import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createPresignedUploadUrl } from "@/lib/agency/r2-storage-service";

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

    const presignedData = await createPresignedUploadUrl({
      workspaceId,
      projectId,
      fileName,
      fileSizeBytes: Number(fileSizeBytes),
      mimeType: mimeType || "application/octet-stream",
      category: category || "original",
    });

    return NextResponse.json(presignedData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate upload URL" }, { status: 400 });
  }
}

