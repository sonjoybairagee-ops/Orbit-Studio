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

  // Remove ban duration via Auth Admin API
  const { error: unbanError } = await svc.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (unbanError) {
    return NextResponse.json({ error: unbanError.message }, { status: 500 });
  }

  // Update profile
  const { error: dbError } = await svc
    .from("profiles")
    .update({
      is_banned: false,
      banned_at: null,
      banned_by: null,
      ban_reason: null
    })
    .eq("id", userId);

  if (dbError) {
    // Attempt rollback (re-ban)
    const { error: rollbackError } = await svc.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
    if (rollbackError) {
      console.error(`[CRITICAL] Failed to rollback auth unban for user ${userId} after DB update failed. Auth and DB are in inconsistent state.`, rollbackError);
    }
    return NextResponse.json({ error: "Failed to update profile. User unban was rolled back." }, { status: 500 });
  }

  await logAdminAction(admin.id, "UNBANNED_USER", userId, { reason: "Manual unban from users directory" });

  return NextResponse.json({ ok: true });
}
