export function getEmailHeader() {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:36px 40px 0 40px;">
          <span style="color:#ffffff; font-size:20px; font-weight:700;">CompX Orbit</span><br>
          <span style="color:#6b7280; font-size:9px; letter-spacing:1px;">CREATIVE CONTROL CENTER</span>
        </td>
      </tr>
    </table>
  `;
}

export function getEmailFooter() {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:24px 40px 32px 40px; text-align:center;">
          <hr style="border:none; border-top:1px solid #1f1f1f; margin:0 0 20px 0;">
          <p style="margin:0 0 8px 0; font-size:11px; line-height:18px; color:#4b5563;">
            CompX Orbit &middot; Dhaka, Bangladesh
          </p>
          <p style="margin:0; font-size:11px; line-height:18px; color:#4b5563;">
            <a href="mailto:support@compxorbit.com" style="color:#6b7280; text-decoration:underline;">Need help?</a>
          </p>
        </td>
      </tr>
    </table>
  `;
}

// 1. Template: New License Key Issued (Local / Manual / Direct Purchase)
export function getNewLicenseEmailHtml({
  customerName,
  extensionName,
  licenseKey,
  maxDevices = 1,
  orderId,
}: {
  customerName: string;
  extensionName: string;
  licenseKey: string;
  maxDevices?: number;
  orderId?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://compxorbit.com";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your License Key - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#111111; border:1px solid #1f1f1f; border-radius:10px; overflow:hidden;">
          ${getEmailHeader()}
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:#22c55e; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; LICENSE ISSUED
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:24px; line-height:30px; color:#ffffff; font-weight:700;">
                Your license is ready, ${customerName}! 🎉
              </h1>
              <p style="margin:0 0 20px 0; font-size:14px; line-height:22px; color:#a0a0a0;">
                Thank you for choosing <strong>${extensionName}</strong>. Here is your official license key to activate your extension inside After Effects & Premiere Pro:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px 40px;">
              <div style="background-color:#0d0d0d; border:1px dashed #22c55e; border-radius:8px; padding:20px; text-align:center;">
                <p style="margin:0 0 6px 0; font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Official License Key</p>
                <p style="margin:0; font-size:22px; font-family:monospace; font-weight:700; color:#22c55e; letter-spacing:2px;">${licenseKey}</p>
                <p style="margin:8px 0 0 0; font-size:11px; color:#4b5563;">Allowed Devices: ${maxDevices} Seat(s)</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#22c55e; text-align:center;">
                    <a href="${siteUrl}/dashboard"
                       style="display:block; padding:14px 0; color:#0a0a0a; text-decoration:none; font-size:14px; font-weight:700;">
                      Go to My Dashboard &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            orderId
              ? `
          <tr>
            <td style="padding:0 40px 24px 40px; text-align:center;">
              <a href="${siteUrl}/invoice/${orderId}"
                 style="color:#a0a0a0; text-decoration:underline; font-size:12px;">
                📄 View & Download Official Payment Invoice / Memo
              </a>
            </td>
          </tr>
          `
              : ""
          }
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 2. Template: Device Reset Approved
export function getDeviceResetEmailHtml({
  customerName,
  extensionName,
  licenseKey,
}: {
  customerName: string;
  extensionName: string;
  licenseKey: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Device Reset Approved - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#111111; border:1px solid #1f1f1f; border-radius:10px; overflow:hidden;">
          ${getEmailHeader()}
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); color:#60a5fa; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; DEVICE RESET APPROVED
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:24px; line-height:30px; color:#ffffff; font-weight:700;">
                Device Slot Cleared, ${customerName} 🔄
              </h1>
              <p style="margin:0 0 20px 0; font-size:14px; line-height:22px; color:#a0a0a0;">
                Your device reset request for <strong>${extensionName}</strong> has been approved by our admin team. Previous computer bindings have been safely unlinked.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px 40px;">
              <div style="background-color:#0d0d0d; border:1px solid #1f1f1f; border-radius:8px; padding:18px; text-align:center;">
                <p style="margin:0 0 4px 0; font-size:11px; color:#6b7280;">Your License Key</p>
                <p style="margin:0; font-size:18px; font-family:monospace; font-weight:700; color:#60a5fa;">${licenseKey}</p>
                <p style="margin:8px 0 0 0; font-size:12px; color:#22c55e;">Status: Ready for new device activation</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#3b82f6; text-align:center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://compxorbit.com"}/dashboard"
                       style="display:block; padding:14px 0; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700;">
                      Open Dashboard &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 3. Template: Old User Migration / License Redeem Instructions
export function getOldUserRedeemEmailHtml({
  customerName,
  licenseKey,
  extensionName = "CompX Precomp Manager",
}: {
  customerName: string;
  licenseKey: string;
  extensionName?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Redeem Your License Key - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#111111; border:1px solid #1f1f1f; border-radius:10px; overflow:hidden;">
          ${getEmailHeader()}
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.3); color:#eab308; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; MIGRATION & REDEEM CODE
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:24px; line-height:30px; color:#ffffff; font-weight:700;">
                Welcome to CompX Orbit, ${customerName}! 🚀
              </h1>
              <p style="margin:0 0 16px 0; font-size:14px; line-height:22px; color:#a0a0a0;">
                As an existing <strong>${extensionName}</strong> user, we have generated your official migration key to unlock your workspace on the new CompX Orbit Platform.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 20px 40px;">
              <div style="background-color:#0d0d0d; border:1px dashed #eab308; border-radius:8px; padding:20px; text-align:center;">
                <p style="margin:0 0 6px 0; font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase;">Your Redeem Code</p>
                <p style="margin:0; font-size:22px; font-family:monospace; font-weight:700; color:#eab308; letter-spacing:2px;">${licenseKey}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <div style="background-color:#141822; border:1px solid #1f293d; border-radius:8px; padding:18px;">
                <p style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#ffffff;">📌 How to Redeem Your License:</p>
                <ol style="margin:0; padding-left:20px; font-size:13px; line-height:22px; color:#9ca3af;">
                  <li>Create or sign in to your account at <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://compxorbit.com"}/login" style="color:#22c55e; text-decoration:none;">CompX Orbit Portal</a>.</li>
                  <li>Look at the left sidebar for <strong>🔑 Redeem License Key</strong>.</li>
                  <li>Paste your redeem code <code>${licenseKey}</code> and click <strong>Redeem Key</strong>.</li>
                  <li>Your license will instantly activate in your account!</li>
                </ol>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#22c55e; text-align:center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://compxorbit.com"}/dashboard"
                       style="display:block; padding:14px 0; color:#0a0a0a; text-decoration:none; font-size:14px; font-weight:700;">
                      Redeem License Now &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
