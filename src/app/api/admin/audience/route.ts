import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // "all" or "plan"
  const planId = url.searchParams.get("planId");

  const svc = createAdminClient();

  let query = svc
    .from("profiles")
    .select("id, email_opt_out")
    .eq("email_opt_out", false);

  if (type === "paid") {
    const { data: licenses } = await svc
      .from("licenses")
      .select("user_id")
      .eq("status", "active")
      .not("user_id", "is", null);

    if (!licenses || licenses.length === 0) {
      return NextResponse.json({ userIds: [] });
    }

    const userIds = Array.from(new Set(licenses.map((l) => l.user_id).filter(Boolean)));
    query = query.in("id", userIds);
  } else if (type === "plan") {
    if (!planId) return NextResponse.json({ error: "planId is required" }, { status: 400 });

    const { data: licenses } = await svc
      .from("licenses")
      .select("user_id")
      .eq("plan_id", planId)
      .eq("status", "active");

    if (!licenses || licenses.length === 0) {
      return NextResponse.json({ userIds: [] });
    }

    const userIds = Array.from(new Set(licenses.map((l) => l.user_id).filter(Boolean)));
    query = query.in("id", userIds);
  }

  const { data: users, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ userIds: users?.map(u => u.id) ?? [] });
}
