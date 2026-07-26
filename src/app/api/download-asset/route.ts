import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getR2DownloadUrl } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fileKey = searchParams.get("file");

  if (!fileKey) {
    return NextResponse.json({ error: "File key parameter is required" }, { status: 400 });
  }

  // Check user active license
  const { data: activeLicenses } = await supabase
    .from("licenses")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (!activeLicenses || activeLicenses.length === 0) {
    return NextResponse.json(
      { error: "Active license required to download product assets." },
      { status: 403 }
    );
  }

  try {
    const downloadUrl = await getR2DownloadUrl(fileKey, 300); // URL valid for 5 minutes
    return NextResponse.redirect(downloadUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate download link" }, { status: 500 });
  }
}
