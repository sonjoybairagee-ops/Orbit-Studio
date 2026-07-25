export function getSupportReplyEmailHtml({
  userName,
  subject,
  replyMessage,
  ticketUrl,
}: {
  userName: string;
  subject: string;
  replyMessage: string;
  ticketUrl: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Support Reply - CompX Orbit</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    You have a new reply from CompX Orbit support.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#111111; border:1px solid #1f1f1f; border-radius:10px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 0 40px;">
              <span style="color:#ffffff; font-size:20px; font-weight:700;">CompX Orbit</span><br>
              <span style="color:#6b7280; font-size:9px; letter-spacing:1px;">SUPPORT CENTER</span>
            </td>
          </tr>

          <!-- Status pill -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <span style="display:inline-block; background-color:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:#22c55e; font-size:11px; font-weight:600; letter-spacing:0.5px; padding:5px 12px; border-radius:20px;">
                &#9679; NEW SUPPORT REPLY
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 40px 8px 40px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; color:#ffffff; font-weight:700;">
                Hey {{user_name}}, you got a reply!
              </h1>
              <p style="margin:0 0 6px 0; font-size:12px; color:#6b7280;">
                Re: <strong style="color:#a0a0a0;">{{subject}}</strong>
              </p>
            </td>
          </tr>

          <!-- Reply message box -->
          <tr>
            <td style="padding:16px 40px 0 40px;">
              <div style="background-color:#0d0d0d; border:1px solid #1f1f1f; border-left: 3px solid #22c55e; border-radius:8px; padding:20px 24px;">
                <p style="margin:0 0 8px 0; font-size:11px; font-weight:600; color:#6b7280; letter-spacing:0.5px;">SUPPORT TEAM</p>
                <p style="margin:0; font-size:15px; line-height:26px; color:#d1d5db; white-space:pre-wrap;">{{reply_message}}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background-color:#22c55e; text-align:center;">
                    <a href="{{ticket_url}}"
                       style="display:block; padding:14px 0; color:#0a0a0a; text-decoration:none; font-size:14px; font-weight:700;">
                      View full conversation &nbsp;&#8594;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px 40px; text-align:center;">
              <hr style="border:none; border-top:1px solid #1f1f1f; margin:0 0 20px 0;">
              <p style="margin:0; font-size:11px; line-height:18px; color:#4b5563;">
                CompX Orbit Support &middot; Dhaka, Bangladesh<br>
                <a href="{{ticket_url}}" style="color:#6b7280; text-decoration:underline;">View ticket</a>
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
    .replaceAll("{{user_name}}", userName)
    .replaceAll("{{subject}}", subject)
    .replaceAll("{{reply_message}}", replyMessage)
    .replaceAll("{{ticket_url}}", ticketUrl);
}
