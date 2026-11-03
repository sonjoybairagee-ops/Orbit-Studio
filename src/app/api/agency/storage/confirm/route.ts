import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmUploadedFile } from "@/lib/agency/r2-storage-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, projectId, r2Key, fileName, fileSizeBytes, mimeType, category } = body;

    if (!workspaceId || !projectId || !r2Key || !fileName) {
      return NextResponse.json({ error: "Missing required upload confirmation parameters." }, { status: 400 });
    }

    const file = await confirmUploadedFile({
      workspaceId,
      projectId,
      r2Key,
      fileName,
      fileSizeBytes: Number(fileSizeBytes),
      mimeType,
      category,
      uploadedBy: user.id,
      uploaderName: user.user_metadata?.full_name || user.email || "Creator",
    });

    return NextResponse.json({ success: true, file });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to confirm file upload" }, { status: 400 });
  }
}
