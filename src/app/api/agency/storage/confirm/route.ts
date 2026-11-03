import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmUploadedFile } from "@/lib/agency/r2-storage-service";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // Note: r2Key is no longer accepted from the client — it is looked up
    // from the reservation record inside agency_confirm_upload().
    const { workspaceId, projectId, reservationId, fileName, fileSizeBytes, mimeType } = body;

    if (!workspaceId || !projectId || !reservationId || !fileName) {
      return NextResponse.json(
        { error: "workspaceId, projectId, reservationId, and fileName are required." },
        { status: 400 }
      );
    }

    // Verify membership
    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const file = await confirmUploadedFile({
      reservationId,
      actualFileSizeBytes: Number(fileSizeBytes),
      fileName,
      userId: user.id,
      uploaderName: user.user_metadata?.full_name || user.email || "Creator",
      workspaceId,
      projectId,
    });

    return NextResponse.json({ success: true, file });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to confirm file upload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
