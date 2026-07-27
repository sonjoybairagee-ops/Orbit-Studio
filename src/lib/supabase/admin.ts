import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the service role key and bypasses RLS.
// Never import this into a Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string | null,
  details?: Record<string, any>
) {
  const svc = createAdminClient();
  await svc.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    details,
  });
}
