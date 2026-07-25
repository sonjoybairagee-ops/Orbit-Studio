"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Ticket = {
  id: string;
  user_email: string;
  user_name: string;
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

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/support/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!activeTicket) return;
    fetch(`/api/support/messages?ticket_id=${activeTicket.id}`)
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []));

    const supabase = createClient();
    const channel = supabase
      .channel(`admin-ticket-${activeTicket.id}`)
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    setBusy(true);
    const res = await fetch("/api/support/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: activeTicket.id, message: replyText }),
    });
    if (res.ok) setReplyText("");
    setBusy(false);
  }

  async function updateStatus(status: "open" | "closed") {
    if (!activeTicket) return;
    await fetch("/api/support/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: activeTicket.id, status }),
    });
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, status } : t))
    );
    setActiveTicket((prev) => prev ? { ...prev, status } : null);
  }

  const filtered = tickets.filter(
    (t) => filter === "all" || t.status === filter
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow">Support Center</p>
          <h1 className="mt-1 text-2xl font-black">Customer tickets</h1>
        </div>
        <div className="flex gap-2">
          {(["open", "closed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize ${
                filter === f ? "bg-[#45c66d] text-black" : "btn-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 h-[600px]">
        {/* Ticket list sidebar */}
        <div className="card p-2 overflow-y-auto flex flex-col gap-1">
          {filtered.length === 0 && (
            <p className="muted text-center text-sm p-4">No {filter} tickets.</p>
          )}
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTicket(t); setMessages([]); }}
              className={`w-full text-left rounded-lg p-3 transition-all ${
                activeTicket?.id === t.id
                  ? "bg-[#45c66d]/10 border border-[#45c66d]/30"
                  : "hover:bg-white/5"
              }`}
            >
              <p className="font-semibold text-white text-sm truncate">{t.subject}</p>
              <p className="text-[11px] text-[#6b7280] mt-0.5 truncate">{t.user_email}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-[#4b5563]">
                  {new Date(t.last_reply_at).toLocaleDateString()}
                </p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  t.status === "open" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-slate-400"
                }`}>
                  {t.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className="card p-4 flex flex-col">
          {!activeTicket ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="muted text-sm">Select a ticket to view conversation</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div>
                  <p className="font-bold text-white">{activeTicket.subject}</p>
                  <p className="text-xs text-[#6b7280]">{activeTicket.user_name} · {activeTicket.user_email}</p>
                </div>
                <button
                  onClick={() => updateStatus(activeTicket.status === "open" ? "closed" : "open")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                    activeTicket.status === "open"
                      ? "bg-white/10 text-slate-300 hover:bg-white/20"
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {activeTicket.status === "open" ? "Close ticket ✕" : "Reopen ticket ↻"}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-[#45c66d] text-black font-medium rounded-br-sm"
                        : "bg-white/5 border border-white/10 text-white rounded-bl-sm"
                    }`}>
                      {m.sender === "user" && (
                        <p className="text-[10px] font-bold text-[#45c66d] mb-1 uppercase tracking-wider">
                          {activeTicket.user_name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.sender === "admin" ? "text-black/50" : "text-white/30"}`}>
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
                  placeholder="Type reply… (Enter to send, Shift+Enter for new line)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(e); } }}
                  disabled={activeTicket.status === "closed"}
                />
                <button
                  disabled={busy || activeTicket.status === "closed"}
                  className="btn-primary px-5 self-end"
                >
                  {busy ? "…" : "Reply →"}
                </button>
              </form>
              {activeTicket.status === "closed" && (
                <p className="text-xs text-[#6b7280] mt-2 text-center">
                  Ticket is closed. Reopen to send a reply.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
