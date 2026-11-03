import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";
import { getR2SignedReadUrl } from "@/lib/agency/r2-storage-service";

/**
 * Secure file download endpoint for Agency OS assets.
 * Validates workspace membership and generates a short-lived signed GET URL.
 * Never exposes Cloudflare R2 credentials or raw bucket credentials to the client.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const shouldRedirect = searchParams.get("redirect") === "true";

    if (!fileId) {
      return NextResponse.json({ error: "fileId query parameter is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch file record
    const { data: file, error: fetchErr } = await adminClient
      .from("agency_project_files")
      .select("id, workspace_id, project_id, file_name, r2_key, file_size_bytes, mime_type")
      .eq("id", fileId)
      .single();

    if (fetchErr || !file) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // 2. Verify caller is a member of the workspace owning the file
    const role = await getWorkspaceMemberRole(file.workspace_id, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied to workspace files." }, { status: 403 });
    }

    // 3. Generate short-lived signed GET URL (1 hour)
    const downloadUrl = await getR2SignedReadUrl(file.r2_key, 3600);

    if (shouldRedirect) {
      return NextResponse.redirect(downloadUrl);
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: file.file_name,
      fileSizeBytes: file.file_size_bytes,
      mimeType: file.mime_type,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate download link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
