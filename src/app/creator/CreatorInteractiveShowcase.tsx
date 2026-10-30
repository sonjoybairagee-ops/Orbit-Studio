"use client";

import { useState } from "react";

const DEMO_TABS = [
  { id: "tags", label: "🏷️ 1-Click Tag Injection", badge: "Native Studio" },
  { id: "titles", label: "⚡ Viral Title Generator", badge: "High-CTR" },
  { id: "thumbnail", label: "🎨 HD Thumbnail Studio", badge: "1280×720" },
  { id: "audit", label: "📊 Live SEO Audit", badge: "94/100" },
];

export function CreatorInteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<"tags" | "titles" | "thumbnail" | "audit">("tags");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [addedAll, setAddedAll] = useState(false);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "50px auto 0",
        background: "#080c09",
        border: "1px solid #1c281e",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(163, 230, 53, 0.12)",
        textAlign: "left",
      }}
    >
      {/* Mockup Top Window Bar */}
      <div
        style={{
          background: "#0d140f",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1a251b",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#10b981" }} />
          <span style={{ fontSize: "12px", color: "#859388", marginLeft: "12px", fontFamily: "monospace" }}>
            studio.youtube.com/video/edit — CreatorLens In-Page Active
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              background: "rgba(163, 230, 53, 0.12)",
              color: "#a3e635",
              border: "1px solid rgba(163, 230, 53, 0.3)",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 700,
            }}
          >
            LIVE INTERACTIVE PREVIEW
          </span>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #1a251b",
          background: "#0a0f0b",
          overflowX: "auto",
        }}
      >
        {DEMO_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                flex: "1",
                minWidth: "180px",
                padding: "14px 16px",
                border: "none",
                background: isActive ? "#121a14" : "transparent",
                borderBottom: isActive ? "2px solid #a3e635" : "2px solid transparent",
                color: isActive ? "#ffffff" : "#859388",
                fontWeight: isActive ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "10px",
                  background: isActive ? "rgba(163, 230, 53, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: isActive ? "#a3e635" : "#71717a",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div style={{ padding: "28px", minHeight: "340px", background: "#0b110c" }}>
        {/* TAB 1: 1-Click Tag Injection */}
        {activeTab === "tags" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  YouTube Studio Native Tag Chip-Bar
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#859388" }}>
                  CreatorLens analyzes your title and automatically suggests ranked search tags with estimated algorithm ranks.
                </p>
              </div>
              <button
                onClick={() => {
                  setAddedAll(true);
                  setTimeout(() => setAddedAll(false), 3000);
                }}
                style={{
                  background: addedAll ? "#22c55e" : "#a3e635",
                  color: "#050806",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(163, 230, 53, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{addedAll ? "✓ Injected to Studio!" : "+ Add All (15 Tags)"}</span>
              </button>
            </div>

            {/* Tags Container */}
            <div
              style={{
                background: "#080c09",
                border: "1px solid #1a251b",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {[
                { name: "youtube seo 2026", rank: "#1", score: 96 },
                { name: "how to get views on youtube", rank: "#3", score: 94 },
                { name: "viral title formulas", rank: "#2", score: 91 },
                { name: "youtube studio tags hack", rank: "#1", score: 90 },
                { name: "grow youtube channel fast", rank: "#4", score: 88 },
                { name: "youtube algorithm secrets", rank: "#2", score: 87 },
                { name: "high ctr thumbnail tips", rank: "#5", score: 85 },
                { name: "vidiq alternative free", rank: "#1", score: 83 },
                { name: "creator studio tutorial", rank: "#6", score: 81 },
              ].map((tag) => (
                <div
                  key={tag.name}
                  style={{
                    background: "#121a14",
                    border: "1px solid #243527",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#f4f4f5",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(163, 230, 53, 0.15)",
                      color: "#a3e635",
                      fontWeight: 800,
                      fontSize: "10px",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {tag.rank}
                  </span>
                  <span>{tag.name}</span>
                  <span style={{ color: "#71717a", fontSize: "11px" }}>({tag.score})</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: "#6b7d6f", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>💡</span>
              <span>Clicking <strong>+ Add All</strong> writes directly into YouTube Studio native &lt;ytcp-chip-bar&gt; without copy-pasting.</span>
            </div>
          </div>
        )}

        {/* TAB 2: Viral Title Generator */}
        {activeTab === "titles" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                AI High-CTR Curiosity Gap Titles
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#859388" }}>
                Trained on millions of viral YouTube titles to maximize click-through rate while staying under 60 characters.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                {
                  title: "I Tested YouTube's Algorithm for 30 Days (It Lied to You)",
                  score: "96/100",
                  badge: "Curiosity Gap",
                  len: "55 chars",
                },
                {
                  title: "Stop Using Tags Like This! (New 2026 YouTube Studio Update)",
                  score: "93/100",
                  badge: "Urgency / Negative Hook",
                  len: "58 chars",
                },
                {
                  title: "The 1 Thumbnail Trick That Doubled My Views in 48 Hours",
                  score: "91/100",
                  badge: "High-Proof Pattern",
                  len: "54 chars",
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  style={{
                    background: "#080c09",
                    border: "1px solid #1a251b",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span
                        style={{
                          background: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.badge}
                      </span>
                      <span style={{ fontSize: "11px", color: "#71717a" }}>{item.len}</span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>
                      &ldquo;{item.title}&rdquo;
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        background: "rgba(163, 230, 53, 0.1)",
                        color: "#a3e635",
                        fontWeight: 900,
                        fontSize: "13px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid rgba(163, 230, 53, 0.25)",
                      }}
                    >
                      CTR {item.score}
                    </span>
                    <button
                      onClick={() => handleCopy(item.title, idx)}
                      style={{
                        background: copiedIndex === idx ? "#22c55e" : "#1a251b",
                        color: copiedIndex === idx ? "#050806" : "#ffffff",
                        border: "1px solid #29382b",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copiedIndex === idx ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 1280x720 HD Thumbnail Studio */}
        {activeTab === "thumbnail" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                In-Browser HTML5 Canvas Engine
              </h4>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#859388", lineHeight: 1.6 }}>
                Create high-contrast, attention-grabbing YouTube thumbnails in 5 seconds. Zero Photoshop or graphic design skills needed.
              </p>
              <ul style={{ margin: "0 0 20px", paddingLeft: "18px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.8 }}>
                <li>Auto-sized at crisp <strong>1280×720 HD</strong> (16:9 ratio)</li>
                <li>Viral 2-to-4 word bold headlines that stop the scroll</li>
                <li>Curiosity alert badges and high-contrast color palettes</li>
                <li>1-click lossless PNG export ready for YouTube upload</li>
              </ul>
              <span
                style={{
                  background: "rgba(163, 230, 53, 0.12)",
                  color: "#a3e635",
                  border: "1px solid rgba(163, 230, 53, 0.3)",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                ⚡ 100% Free Rendered (No Server Wait)
              </span>
            </div>

            {/* Thumbnail Canvas Preview Mockup */}
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid #38bdf8",
                boxShadow: "0 12px 30px rgba(56, 189, 248, 0.2)",
                background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)",
                aspectRatio: "16 / 9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: 900,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
                }}
              >
                DON&apos;T MISS THIS!
              </div>

              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "clamp(18px, 3.5vw, 26px)",
                  fontWeight: 900,
                  color: "#facc15",
                  textTransform: "uppercase",
                  letterSpacing: "-0.5px",
                  textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                  lineHeight: 1.15,
                }}
              >
                STOP DOING THIS!
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(12px, 2vw, 15px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  background: "rgba(0, 0, 0, 0.6)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                It Kills 80% Of Your Views
              </p>

              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "12px",
                  fontSize: "10px",
                  color: "#38bdf8",
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                1280 × 720 HD PNG
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Live 100-Point SEO Audit */}
        {activeTab === "audit" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Real-Time Video SEO Health Score
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#859388" }}>
                  Monitors your video metadata live as you type inside YouTube Studio to guarantee full algorithm readiness.
                </p>
              </div>
              <div
                style={{
                  background: "rgba(74, 222, 128, 0.12)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#86efac", fontWeight: 700 }}>Overall Score</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#4ade80" }}>94 / 100</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                { title: "Title Character Length", status: "Optimal (58 chars)", pass: true },
                { title: "Description First 2 Lines", status: "Contains primary keywords", pass: true },
                { title: "Tag Volume & Quality", status: "15 high-volume tags injected", pass: true },
                { title: "Timestamps / Chapters", status: "Detected 5 timestamps", pass: true },
                { title: "Thumbnail Resolution", status: "Verified 1280x720 HD", pass: true },
                { title: "Card & End-screen Intent", status: "Call-to-action present", pass: true },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "#080c09",
                    border: "1px solid #19241b",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ color: "#4ade80", fontSize: "13px", fontWeight: 800 }}>✓</span>
                    <strong style={{ fontSize: "12px", color: "#ffffff" }}>{item.title}</strong>
                  </div>
                  <div style={{ fontSize: "11px", color: "#859388" }}>{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
