type SendArgs = { to: string; subject: string; html: string };

// Sends via the Resend REST API. No-ops (logs) when RESEND_API_KEY is unset,
// so the app works fine in development without email configured.
export async function sendEmail({
  to,
  subject,
  html,
}: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "ExtLicense <onboarding@resend.dev>";
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) console.error("[email] send failed", await res.text());
  } catch (err) {
    console.error("[email] send error", err);
  }
}

export function licenseIssuedEmail(extensionName: string, key: string): string {
  return `
    <div style="font-family:sans-serif">
      <h2>Your license is ready 🎉</h2>
      <p>Thanks for buying <b>${extensionName}</b>. Your license key:</p>
      <p style="font-size:18px"><code>${key}</code></p>
      <p>Sign in to your dashboard to download the extension and activate it on your device.</p>
    </div>`;
}

export function resetApprovedEmail(extensionName: string): string {
  return `
    <div style="font-family:sans-serif">
      <h2>Device reset approved</h2>
      <p>Your device binding for <b>${extensionName}</b> has been cleared.</p>
      <p>You can now activate the extension on a new device.</p>
    </div>`;
}
