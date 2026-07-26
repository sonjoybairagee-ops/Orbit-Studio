import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

const schema = z.object({
  email: z.string().email(),
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { email, token } = parsed.data;

    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const svc = createAdminClient();
    
    // Check if the user exists first (so we don't throw an error if they don't)
    const { data: profile } = await svc
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      // Technically they don't exist, but we shouldn't reveal that. Just return OK.
      return NextResponse.json({ ok: true });
    }

    // Update their opt_out flag. Assumes email_opt_out boolean column exists.
    const { error } = await svc
      .from("profiles")
      .update({ email_opt_out: true })
      .eq("email", email);

    if (error) {
      console.error("Failed to unsubscribe:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
