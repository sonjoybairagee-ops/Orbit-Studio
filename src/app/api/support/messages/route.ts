import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { getSupportReplyEmailHtml } from "@/lib/emails/supportReply";

// GET  — messages for a ticket
// POST — send a message (user or admin)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get("ticket_id");
  if (!ticketId) return NextResponse.json({ error: "ticket_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticket_id, message } = await req.json();
  if (!ticket_id || !message) {
    return NextResponse.json({ error: "ticket_id and message are required" }, { status: 400 });
  }

  // Determine sender role
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const sender = isAdmin ? "admin" : "user";

  // Verify ownership for non-admin users (defense-in-depth)
  if (!isAdmin) {
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, user_id")
      .eq("id", ticket_id)
      .single();
    if (!ticket || ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Insert message
  const { data: newMsg, error: msgError } = await supabase
    .from("support_messages")
    .insert({ ticket_id, sender, message })
    .select()
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  // Update ticket last_reply_at and reopen if closed
  await supabase
    .from("support_tickets")
    .update({ last_reply_at: new Date().toISOString(), status: "open" })
    .eq("id", ticket_id);

  // If admin replied → send email to user
  if (isAdmin) {
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("user_email, user_name, subject")
      .eq("id", ticket_id)
      .single();

    if (ticket?.user_email) {
      const html = getSupportReplyEmailHtml({
        userName: ticket.user_name,
        subject: ticket.subject,
        replyMessage: message,
        ticketUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/support/${ticket_id}`,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>",
        to: ticket.user_email,
        subject: `Re: ${ticket.subject} — CompX Orbit Support`,
        html,
      });
    }
  }

  return NextResponse.json({ message: newMsg });
}

// PATCH — close/reopen a ticket (admin only)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ticket_id, status } = await req.json();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", ticket_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
