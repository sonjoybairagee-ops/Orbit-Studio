"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero__glow" aria-hidden="true" />
        <div className="shell contact-hero__inner">
          <p className="eyebrow">We&apos;re here to help</p>
          <h1>Contact <span className="text-gradient">Support</span></h1>
          <p className="contact-hero__sub">
            Have a question about CompX Orbit? We usually reply within <b>24 hours</b>.
          </p>
        </div>
      </section>

      <div className="shell contact-layout">

        {/* ── Left: Form ── */}
        <div className="contact-form-wrap">
          <div className="contact-form-card">
            <h2>Send us a message</h2>
            <p>Fill out the form below and we&apos;ll get back to you at your email.</p>

            {status === "sent" ? (
              <div className="contact-success">
                <span className="contact-success__icon">✅</span>
                <h3>Message sent!</h3>
                <p>We&apos;ve received your message and will reply to <b>{form.email || "your email"}</b> within 24 hours.</p>
                <button className="contact-btn" onClick={() => setStatus("idle")}>Send another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Your name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Sonjoy Bairagee"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-email">Email address</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                  >
                    <option value="">Select a topic…</option>
                    <option value="License issue">License issue</option>
                    <option value="Installation problem">Installation problem</option>
                    <option value="Legacy redeem">Legacy redeem (v1.1.1)</option>
                    <option value="Billing / Payment">Billing / Payment</option>
                    <option value="Bug report">Bug report</option>
                    <option value="Feature request">Feature request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    placeholder="Describe your issue or question in detail…"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>

                {status === "error" && (
                  <div className="contact-error">
                    ⚠️ Something went wrong. Please email us directly at{" "}
                    <a href="mailto:support@compxorbit.com">support@compxorbit.com</a>
                  </div>
                )}

                <button
                  className="contact-btn"
                  type="submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <><span className="contact-spinner" /> Sending…</>
                  ) : (
                    <>Send message <span>→</span></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right: Info ── */}
        <aside className="contact-sidebar">

          {/* Direct email */}
          <div className="contact-info-card">
            <div className="contact-info-icon">✉️</div>
            <h3>Email us directly</h3>
            <p>Skip the form and write to us directly. We monitor this inbox daily.</p>
            <a href="mailto:support@compxorbit.com" className="contact-email-link">
              support@compxorbit.com
            </a>
          </div>

          {/* Response time */}
          <div className="contact-info-card">
            <div className="contact-info-icon">⏱️</div>
            <h3>Response time</h3>
            <div className="contact-response-rows">
              <div><span>General questions</span><b>Within 24h</b></div>
              <div><span>License issues</span><b>Within 12h</b></div>
              <div><span>Billing / Payment</span><b>Within 24h</b></div>
            </div>
          </div>

          {/* Quick links */}
          <div className="contact-info-card">
            <div className="contact-info-icon">🔗</div>
            <h3>Quick links</h3>
            <div className="contact-quick-links">
              <Link href="/#install">Installation guide</Link>
              <Link href="/dashboard">My dashboard</Link>
              <Link href="/pricing">Pricing & plans</Link>
              <Link href="/dashboard/support">Live support chat</Link>
            </div>
          </div>

        </aside>
      </div>
    </main>
  );
}
