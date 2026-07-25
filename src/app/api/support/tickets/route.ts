import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET  — user sees own tickets; admin sees all
// POST — create new ticket (authenticated users only)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("support_tickets")
    .select("*, support_messages(count)")
    .order("last_reply_at", { ascending: false });

  // Admin sees all; regular user only sees own tickets (RLS also enforces this)
  if (!profile?.is_admin) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      user_email: user.email,
      user_name: profile?.full_name || user.email?.split("@")[0] || "User",
      subject,
      status: "open",
      last_reply_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });

  // Insert first message
  const { error: msgError } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender: "user",
    message,
  });

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  return NextResponse.json({ ticket });
}
