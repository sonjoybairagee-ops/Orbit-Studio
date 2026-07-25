export function getResetPasswordEmailHtml({
  firstName,
  resetLink,
  expiryHours = 1,
}: {
  firstName: string;
  resetLink: string;
  expiryHours?: number;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reset Your Password - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Reset your password for CompX Orbit.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#111111; border:1px solid #1f1f1f; border-radius:10px; overflow:hidden;">

          <!-- Header / Logo -->
          <tr>
            <td style="padding:36px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="color:#ffffff; font-size:20px; font-weight:700;">CompX Orbit</span><br>
                    <span style="color:#6b7280; font-size:9px; letter-spacing:1px;">CREATIVE CONTROL CENTER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status pill -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; PASSWORD RESET REQUEST
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:26px; line-height:32px; color:#ffffff; font-weight:700;">
                Reset your password, {{first_name}}.
              </h1>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:24px; color:#a0a0a0;">
                We received a request to reset your password. Click the button below to choose a new password for your CompX Orbit account.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#22c55e; text-align:center;">
                    <a href="{{reset_link}}"
                       style="display:block; padding:15px 0; color:#0a0a0a; text-decoration:none; font-size:15px; font-weight:700;">
                      Reset Password &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <p style="margin:0; font-size:12px; line-height:20px; color:#6b7280;">
                Button not working? Paste this link into your browser:<br>
                <a href="{{reset_link}}" style="color:#22c55e; word-break:break-all;">{{reset_link}}</a>
              </p>
            </td>
          </tr>

          <!-- Expiry note -->
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0; font-size:12px; line-height:20px; color:#6b7280;">
                This link expires in {{expiry_hours}} hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none; border-top:1px solid #1f1f1f; margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px 40px; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:11px; line-height:18px; color:#4b5563;">
                CompX Orbit &middot; Dhaka, Bangladesh
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return html
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{reset_link}}", resetLink)
    .replaceAll("{{expiry_hours}}", String(expiryHours));
}
