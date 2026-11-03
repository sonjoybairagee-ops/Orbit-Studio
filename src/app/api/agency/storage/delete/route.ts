import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deleteAgencyFile, cancelUploadReservation } from "@/lib/agency/r2-storage-service";
import { getWorkspaceMemberRole } from "@/lib/agency/workspace-service";

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const workspaceId = searchParams.get("workspaceId");

    if (!fileId || !workspaceId) {
      return NextResponse.json({ error: "fileId and workspaceId are required." }, { status: 400 });
    }

    // Verify membership
    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const res = await deleteAgencyFile(fileId, workspaceId, user.id);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Cancel a pending upload reservation (e.g. user aborted the upload)
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { reservationId, workspaceId } = body;

    if (!reservationId || !workspaceId) {
      return NextResponse.json(
        { error: "reservationId and workspaceId are required." },
        { status: 400 }
      );
    }

    const role = await getWorkspaceMemberRole(workspaceId, user.id);
    if (!role) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    await cancelUploadReservation(reservationId, "cancelled");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel reservation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
