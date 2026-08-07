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

const ORBIT_GREEN = "#45c66d";
const BG_DARK = "#050806";
const CARD_BG = "#0d1410";
const TEXT_MUTED = "#8da096";
const TEXT_WHITE = "#f1f7f3";

function createPremiumTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${BG_DARK}; color: ${TEXT_WHITE}; -webkit-font-smoothing: antialiased;">
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Card -->
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: ${CARD_BG}; border: 1px solid rgba(69, 198, 109, 0.15); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.03);">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="width: 48px; height: 48px; background: linear-gradient(145deg, #0d1b11, #050a07); border: 1px solid rgba(69, 198, 109, 0.3); border-radius: 12px; display: inline-block; text-align: center; line-height: 48px; font-weight: 900; color: ${ORBIT_GREEN}; font-size: 24px; letter-spacing: -1px;">
                      CX
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: ${TEXT_WHITE}; letter-spacing: -0.5px;">${title}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 40px; font-size: 15px; line-height: 1.6; color: ${TEXT_MUTED};">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.03);">
              <p style="margin: 0; font-size: 12px; color: #5a6b61;">
                &copy; ${new Date().getFullYear()} CompX Orbit. All rights reserved.<br>
                This is an automated message, please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export function licenseIssuedEmail(
  extensionName: string,
  key: string,
  customerName: string = "Creator",
  maxDevices: number = 1,
  orderId?: string
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://compxorbit.com";
  const content = `
    <p style="margin-top: 0;">Thanks for purchasing <b>${extensionName}</b>. Your account is ready and your license key has been generated.</p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: rgba(69, 198, 109, 0.05); border: 1px solid rgba(69, 198, 109, 0.2); border-radius: 10px; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: ${ORBIT_GREEN}; text-transform: uppercase; letter-spacing: 1px;">Your CX License Key</p>
      <code style="display: block; font-family: ui-monospace, monospace; font-size: 18px; font-weight: 700; color: ${TEXT_WHITE}; word-break: break-all; letter-spacing: 1px;">${key}</code>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #8fa896;">Allowed Devices: ${maxDevices} Seat(s)</p>
    </div>

    <p style="margin-bottom: 25px;">You can now log in to your dashboard to download the extension files and manage your active devices.</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${siteUrl}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(180deg, #65dc86, #38b75f); color: #041008; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 8px; border: 1px solid #6ee08d; box-shadow: 0 8px 20px rgba(69, 198, 109, 0.25);">
            Access your Dashboard &rarr;
          </a>
        </td>
      </tr>
    </table>

    ${
      orderId
        ? `
    <div style="margin-top: 20px; text-align: center;">
      <a href="${siteUrl}/invoice/${orderId}" style="color: #a0a0a0; font-size: 13px; text-decoration: underline;">
        📄 View & Download Official Payment Invoice / Memo
      </a>
    </div>
    `
        : ""
    }
  `;
  return createPremiumTemplate("Your license is ready 🎉", content);
}

export function resetApprovedEmail(extensionName: string): string {
  const content = `
    <p style="margin-top: 0;">Good news! Your device reset request for <b>${extensionName}</b> has been reviewed and <strong>approved</strong> by our team.</p>
    <p>The previous device binding has been completely cleared from our system. You are now free to open the extension and paste your license key on your new workstation to activate it.</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px;">
      <tr>
        <td align="center">
          <a href="https://compxorbit.com/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #101a13; color: ${TEXT_WHITE}; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(116,196,138,0.2);">
            View your Dashboard
          </a>
        </td>
      </tr>
    </table>
  `;
  return createPremiumTemplate("Device reset approved \u2705", content);
}
