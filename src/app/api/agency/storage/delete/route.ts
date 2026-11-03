import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deleteAgencyFile } from "@/lib/agency/r2-storage-service";

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

    const res = await deleteAgencyFile(fileId, workspaceId);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete file" }, { status: 400 });
  }
}

