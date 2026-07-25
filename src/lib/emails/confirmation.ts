export function getConfirmationEmailHtml({
  firstName,
  confirmationLink,
  expiryHours = 24,
}: {
  firstName: string;
  confirmationLink: string;
  expiryHours?: number;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Confirm Your Account - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Confirm your email to activate your CompX Orbit account.
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
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-left:10px; vertical-align:middle;">
                          <span style="color:#ffffff; font-size:20px; font-weight:700;">CompX Orbit</span><br>
                          <span style="color:#6b7280; font-size:9px; letter-spacing:1px;">CREATIVE CONTROL CENTER</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status pill -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:#22c55e; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; CONFIRM YOUR EMAIL
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-size:26px; line-height:32px; color:#ffffff; font-weight:700;">
                Welcome to your orbit, {{first_name}}.
              </h1>
              <p style="margin:0 0 24px 0; font-size:15px; line-height:24px; color:#a0a0a0;">
                One quick step before you get access to your creative control center.
                Confirm your email to activate your account and unlock all workspaces.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#22c55e; text-align:center;">
                    <a href="{{confirmation_link}}"
                       style="display:block; padding:15px 0; color:#0a0a0a; text-decoration:none; font-size:15px; font-weight:700;">
                      Confirm My Email &nbsp;&#8594;
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
                <a href="{{confirmation_link}}" style="color:#22c55e; word-break:break-all;">{{confirmation_link}}</a>
              </p>
            </td>
          </tr>

          <!-- Feature strip -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d; border:1px solid #1f1f1f; border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px; text-align:center; border-right:1px solid #1f1f1f;">
                    <div style="color:#ffffff; font-size:16px; font-weight:700;">7</div>
                    <div style="color:#6b7280; font-size:10px; letter-spacing:0.3px;">FOCUSED WORKSPACES</div>
                  </td>
                  <td style="padding:16px 20px; text-align:center; border-right:1px solid #1f1f1f;">
                    <div style="color:#ffffff; font-size:16px; font-weight:700;">60+</div>
                    <div style="color:#6b7280; font-size:10px; letter-spacing:0.3px;">WORKFLOW ACTIONS</div>
                  </td>
                  <td style="padding:16px 20px; text-align:center;">
                    <div style="color:#ffffff; font-size:16px; font-weight:700;">1</div>
                    <div style="color:#6b7280; font-size:10px; letter-spacing:0.3px;">KEY, BOTH APPS</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry note -->
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0; font-size:12px; line-height:20px; color:#6b7280;">
                This link expires in {{expiry_hours}} hours. If you didn't sign up for CompX Orbit,
                you can safely ignore this email.
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
              <p style="margin:0; font-size:11px; line-height:18px; color:#4b5563;">
                <a href="mailto:support@compxorbit.com" style="color:#6b7280; text-decoration:underline;">Need help?</a>
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
    .replaceAll("{{confirmation_link}}", confirmationLink)
    .replaceAll("{{expiry_hours}}", String(expiryHours));
}
