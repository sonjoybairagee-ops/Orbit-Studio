import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, logAdminAction } from "@/lib/supabase/admin";

const schema = z.object({
  userId: z.string().uuid(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { userId } = parsed.data;

  const svc = createAdminClient();
  
  // Ban user using Supabase Admin Auth API
  const { error: banError } = await svc.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "BANNED_USER", userId, { reason: "Manual ban from users directory" });

  return NextResponse.json({ ok: true });
}
