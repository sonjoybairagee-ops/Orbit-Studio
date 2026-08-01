"use client";

import { useState } from "react";

export function BroadcastForm({ plans }: { plans: any[] }) {
  const [audience, setAudience] = useState<"all" | "paid" | "plan">("all");
  const [planId, setPlanId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; sent: number; skipped: number } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !html) return alert("Subject and content are required.");
    if (audience === "plan" && !planId) return alert("Please select a plan.");

    if (!confirm("Are you sure you want to send this broadcast?")) return;

    setBusy(true);
    setProgress(null);

    try {
      // 1. Fetch audience user IDs
      const audienceRes = await fetch(`/api/admin/audience?type=${audience}${planId ? `&planId=${planId}` : ""}`);
      const audienceData = await audienceRes.json();

      if (!audienceRes.ok) throw new Error(audienceData.error || "Failed to fetch audience");

      const userIds: string[] = audienceData.userIds;

      if (userIds.length === 0) {
        alert("No eligible users found for this audience.");
        setBusy(false);
        return;
      }

      // 2. Chunk user IDs into batches of 50
      const CHUNK_SIZE = 50;
      const chunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
        chunks.push(userIds.slice(i, i + CHUNK_SIZE));
      }

      setProgress({ current: 0, total: chunks.length, sent: 0, skipped: 0 });

      // 3. Process chunks sequentially
      let totalSent = 0;
      let totalSkipped = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        const sendRes = await fetch("/api/admin/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            html,
            userIds: chunk,
          }),
        });

        const sendData = await sendRes.json();
        
        if (!sendRes.ok) {
          // Log error but continue with next chunk? Or abort? Let's abort to be safe.
          throw new Error(`Chunk ${i + 1} failed: ${sendData.error || "Unknown error"}`);
        }

        totalSent += sendData.sent || 0;
        totalSkipped += sendData.skipped || 0;

        setProgress({ current: i + 1, total: chunks.length, sent: totalSent, skipped: totalSkipped });
      }

      alert("Broadcast completed successfully.");
    } catch (err: any) {
      alert(`Broadcast error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-6">
      <form onSubmit={handleSend} className="space-y-6">
        <div>
          <label className="label">Audience Target</label>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                className="accent-[#45c66d]" 
                checked={audience === "all"} 
                onChange={() => setAudience("all")} 
                disabled={busy}
              />
              <span className="text-sm">All Registered Accounts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                className="accent-[#45c66d]" 
                checked={audience === "paid"} 
                onChange={() => setAudience("paid")} 
                disabled={busy}
              />
              <span className="text-sm font-bold text-[#45c66d]">Paid Customers Only 💳</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                className="accent-[#45c66d]" 
                checked={audience === "plan"} 
                onChange={() => setAudience("plan")} 
                disabled={busy}
              />
              <span className="text-sm">Specific Product / Plan</span>
            </label>
          </div>
          
          {audience === "plan" && (
            <select
              className="input mt-3"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              disabled={busy}
            >
              <option value="">Select a plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="label">Subject Line</label>
          <input
            type="text"
            className="input mt-1"
            placeholder="Important update about your product..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={busy}
            required
          />
        </div>

        <div>
          <label className="label">Email HTML Body</label>
          <textarea
            className="input mt-1 min-h-[300px] font-mono text-sm"
            placeholder="<h1>Hello!</h1><p>Here is some important news...</p>"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            disabled={busy}
            required
          />
          <p className="muted mt-2 text-xs">
            An unsubscribe link will automatically be appended to the bottom of the email.
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={busy}
        >
          {busy ? "Sending..." : "Send Broadcast"}
        </button>

        {progress && (
          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <p className="font-bold">Progress</p>
            <p className="muted text-sm mt-1">
              Processing batch {progress.current} of {progress.total}...
            </p>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="text-[#45c66d]">Queued: {progress.sent}</span>
              <span className="text-white/50">Skipped (Opt-out/No Email): {progress.skipped}</span>
            </div>
            
            {progress.current > 0 && (
              <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-[#45c66d] transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
