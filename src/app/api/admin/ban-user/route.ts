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

  // Update profile
  const { error: dbError } = await svc
    .from("profiles")
    .update({
      is_banned: true,
      banned_at: new Date().toISOString(),
      banned_by: admin.id,
      ban_reason: "Manual ban from users directory"
    })
    .eq("id", userId);

  if (dbError) {
    // Attempt rollback
    const { error: rollbackError } = await svc.auth.admin.updateUserById(userId, { ban_duration: "none" });
    if (rollbackError) {
      console.error(`[CRITICAL] Failed to rollback auth ban for user ${userId} after DB update failed. Auth and DB are in inconsistent state.`, rollbackError);
    }
    return NextResponse.json({ error: "Failed to update profile. User ban was rolled back." }, { status: 500 });
  }

  await logAdminAction(admin.id, "BANNED_USER", userId, { reason: "Manual ban from users directory" });

  return NextResponse.json({ ok: true });
}
