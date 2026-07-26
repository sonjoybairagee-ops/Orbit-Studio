import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { generateUnsubscribeToken } from "@/lib/unsubscribe";
import { waitUntil } from "@vercel/functions";

const schema = z.object({
  subject: z.string().min(1),
  html: z.string().min(1),
  userIds: z.array(z.string().uuid()).max(50),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload or batch size > 50" }, { status: 400 });
  }

  const { subject, html, userIds } = parsed.data;

  if (userIds.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const svc = createAdminClient();

  const { data: users, error } = await svc
    .from("profiles")
    .select("id, email, email_opt_out")
    .in("id", userIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const validUsers = (users ?? []).filter((u) => !u.email_opt_out && u.email);
  const skipped = userIds.length - validUsers.length;

  // Add the unsubscribe link to the HTML footer
  // Note: App URL should ideally be in env. Using a relative trick or env var.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orbit.compx.com"; // Placeholder or env

  const emailsToSend = validUsers.map((u) => {
    const token = generateUnsubscribeToken(u.email);
    const unsubUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(u.email)}&token=${token}`;
    
    const finalHtml = `${html}
      <br><br>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 20px; margin-bottom: 20px;" />
      <p style="font-size: 12px; color: #666; text-align: center;">
        You are receiving this email because you are a customer.<br>
        <a href="${unsubUrl}" style="color: #666; text-decoration: underline;">Unsubscribe from marketing emails</a>
      </p>
    `;

    return {
      to: u.email,
      subject,
      html: finalHtml,
    };
  });

  if (emailsToSend.length > 0) {
    // Log the chunk execution
    await svc.from("license_events").insert({
      actor_id: admin.id,
      event: "broadcast_sent_chunk",
      meta: { subject, sent_count: emailsToSend.length },
    });

    waitUntil(
      (async () => {
        for (let i = 0; i < emailsToSend.length; i++) {
          try {
            await sendEmail(emailsToSend[i]);
          } catch (e) {
            console.error(`Broadcast failed to ${emailsToSend[i].to}:`, e);
          }
          // Small stagger
          if (i < emailsToSend.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      })()
    );
  }

  return NextResponse.json({ ok: true, sent: emailsToSend.length, skipped });
}
