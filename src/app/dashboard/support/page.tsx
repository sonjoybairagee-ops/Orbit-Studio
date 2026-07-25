"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  last_reply_at: string;
};

type Message = {
  id: string;
  sender: "user" | "admin";
  message: string;
  created_at: string;
};

export default function DashboardSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load tickets
  useEffect(() => {
    fetch("/api/support/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(Array.isArray(d) ? d : []));
  }, []);

  // Load messages + Realtime when ticket open
  useEffect(() => {
    if (!activeTicket) return;
    fetch(`/api/support/messages?ticket_id=${activeTicket.id}`)
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []));

    const supabase = createClient();
    const channel = supabase
      .channel(`ticket-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${activeTicket.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTicket]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: newSubject, message: newMessage }),
    });
    const json = await res.json();
    setBusy(false);
    if (res.ok && json.ticket) {
      setTickets((prev) => [json.ticket, ...prev]);
      setNewSubject("");
      setNewMessage("");
      setActiveTicket(json.ticket);
      setMessages([{ id: "init", sender: "user", message: newMessage, created_at: new Date().toISOString() }]);
      setView("chat");
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    setBusy(true);
    await fetch("/api/support/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: activeTicket.id, message: replyText }),
    });
    setReplyText("");
    setBusy(false);
  }

  function openTicket(t: Ticket) {
    setActiveTicket(t);
    setView("chat");
  }

  if (view === "new") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="text-[#45c66d] hover:underline text-sm">← Back</button>
          <h1 className="text-2xl font-black">New support request</h1>
        </div>
        <form onSubmit={createTicket} className="card p-6 space-y-4 max-w-2xl">
          <label>
            <span className="label">Subject</span>
            <input
              className="input"
              placeholder="What do you need help with?"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Describe your issue</span>
            <textarea
              className="input min-h-[140px] resize-y"
              placeholder="Describe your problem in detail..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
          </label>
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Submitting…" : "Submit request →"}
          </button>
        </form>
      </div>
    );
  }

  if (view === "chat" && activeTicket) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="text-[#45c66d] hover:underline text-sm">← All tickets</button>
            <h1 className="text-xl font-black truncate">{activeTicket.subject}</h1>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${activeTicket.status === "open" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-slate-400"}`}>
            {activeTicket.status}
          </span>
        </div>

        {/* Chat window */}
        <div className="card p-4 h-[420px] flex flex-col gap-3 overflow-y-auto mb-4">
          {messages.length === 0 && (
            <p className="muted text-center text-sm mt-auto">No messages yet.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#45c66d] text-black font-medium rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-white rounded-bl-sm"
              }`}>
                {m.sender === "admin" && (
                  <p className="text-[10px] font-bold text-[#45c66d] mb-1 uppercase tracking-wider">Support Team</p>
                )}
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`text-[10px] mt-1 ${m.sender === "user" ? "text-black/50" : "text-white/30"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        <form onSubmit={sendReply} className="flex gap-2">
          <textarea
            className="input flex-1 resize-none min-h-[52px]"
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(e); } }}
            required
          />
          <button disabled={busy} className="btn-primary px-5 self-end">
            {busy ? "…" : "Send →"}
          </button>
        </form>
      </div>
    );
  }

  // Ticket list view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow">Help Center</p>
          <h1 className="mt-1 text-2xl font-black">Support tickets</h1>
        </div>
        <button onClick={() => setView("new")} className="btn-primary">＋ New request</button>
      </div>

      {tickets.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto mb-4 text-4xl">💬</div>
          <h2 className="text-xl font-bold">No support tickets yet</h2>
          <p className="muted mt-2 text-sm">Create a new request and our team will reply within 24 hours.</p>
          <button onClick={() => setView("new")} className="btn-primary mt-5">
            Create first request →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => openTicket(t)}
              className="card w-full p-4 flex items-center justify-between hover:border-[#45c66d]/40 transition-all text-left"
            >
              <div>
                <p className="font-semibold text-white">{t.subject}</p>
                <p className="muted text-xs mt-1">
                  Last reply: {new Date(t.last_reply_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                t.status === "open" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-slate-400"
              }`}>
                {t.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
