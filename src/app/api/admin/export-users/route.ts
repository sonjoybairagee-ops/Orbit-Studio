import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const svc = createAdminClient();

  const { data: users, error } = await svc
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvRows = [
    ["ID", "Email", "Full Name", "Role", "Joined Date"],
    ...(users ?? []).map((u) => [
      u.id,
      `"${u.email || ""}"`,
      `"${u.full_name || ""}"`,
      u.role,
      new Date(u.created_at).toISOString(),
    ]),
  ];

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");

  // Audit log
  await svc.from("license_events").insert({
    actor_id: admin.id,
    event: "export_users",
    meta: { export_count: users?.length ?? 0 },
  });

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customers.csv"',
    },
  });
}
