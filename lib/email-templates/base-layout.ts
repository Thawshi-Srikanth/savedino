/**
 * Base Email Layout for SaveDino (SEDS Sri Lanka)
 * Strictly styled with the SaveDino Developer Tech & Arcade Hybrid Dark Theme (#121315 canvas, #1c1d21 card)
 */

export interface BaseEmailLayoutProps {
  title: string;
  previewText?: string;
  content: string;
  recipientEmail?: string;
  reasonText?: string;
}

export function renderBaseEmailLayout({
  title,
  previewText,
  content,
  recipientEmail,
  reasonText,
}: BaseEmailLayoutProps): string {
  const preview = previewText || title;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://savedino.sedssl.org";

  const darkLogoUrl = `${baseUrl}/email/email-logo-savedino-dark.png`;
  const defaultReason = "You've received this email because you have an account or active research session on SaveDino.";
  const activeReason = reasonText || defaultReason;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta content="IE=edge" http-equiv="X-UA-Compatible"/>
  <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/>
  <meta name="color-scheme" content="dark"/>
  <meta name="supported-color-schemes" content="dark"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: dark;
      supported-color-schemes: dark;
    }

    /* Base Reset */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    /* Dark Mode styling defaults */
    body, .email-canvas {
      background-color: #121315 !important;
    }
    .email-text-title {
      color: #f3f4f6 !important;
    }
    .email-text-muted {
      color: #94a3b8 !important;
    }
    .email-text-faint {
      color: #64748b !important;
    }
    .email-divider {
      border-color: #26282e !important;
    }
    .email-footer-text {
      color: #64748b !important;
    }
    .email-footer-brand {
      color: #94a3b8 !important;
    }
  </style>
</head>
<body dir="ltr" lang="en" class="email-canvas" style="background-color:#121315;margin:0;padding:0;color:#f3f4f6;">
  <!-- Hidden preview text for email client inboxes -->
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;" data-skip-in-text="true">
    ${escapeHtml(preview)}
    <div>&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  </div>

  <!-- Main Canvas Table -->
  <table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center" class="email-canvas" style="background-color:#121315;margin:0;padding:0;width:100%;">
    <tbody>
      <tr>
        <td align="center" class="email-canvas" style="padding:36px 16px;background-color:#121315;">
          <!-- Centered Open Flow Email Container -->
          <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:480px;margin:0 auto;text-align:left;">
            <tbody>
              <!-- Logo Header -->
              <tr>
                <td style="padding:0 0 28px 0;">
                  <img
                    alt="SaveDino - SEDS Sri Lanka"
                    height="38"
                    src="${darkLogoUrl}"
                    style="display:block;outline:none;border:none;text-decoration:none;max-width:220px;height:auto;"
                    width="220"
                  />
                </td>
              </tr>

              <!-- Dynamic Content Body -->
              <tr>
                <td style="padding:0;">
                  ${content}
                </td>
              </tr>

              <!-- Footer Area with Dynamic Disclaimer & Links -->
              <tr>
                <td align="left" class="email-footer-text" style="padding:32px 0 0 0;font-size:11px;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#64748b;line-height:1.6;">
                  <div style="border-top:1px solid #26282e;padding-top:20px;">
                    ${
                      recipientEmail
                        ? `<p style="margin:0 0 6px 0;color:#94a3b8;font-size:12px;">
                             This email was sent to <span style="font-family:'Space Mono', monospace;color:#f3f4f6;">${escapeHtml(recipientEmail)}</span>
                           </p>`
                        : `<p style="margin:0 0 6px 0;color:#94a3b8;font-size:12px;">
                             This email was sent to your registered email address
                           </p>`
                    }
                    <p style="margin:0 0 12px 0;color:#64748b;font-size:11px;">
                      ${escapeHtml(activeReason)}
                    </p>
                    <p style="margin:0 0 16px 0;font-size:11px;color:#64748b;">
                      <a href="mailto:info@sedssl.org" style="color:#8b5cf6;text-decoration:underline;" target="_blank">Contact us</a>
                      <span style="color:#38393e;margin:0 8px;">|</span>
                      <a href="${baseUrl}/privacy" style="color:#8b5cf6;text-decoration:underline;" target="_blank">Privacy Policy</a>
                    </p>
                    <div style="font-family:'Space Mono', ui-monospace, monospace;font-size:10px;color:#475569;border-top:1px dashed #1e2025;padding-top:12px;">
                      <p class="email-footer-brand" style="margin:0 0 3px 0;font-weight:700;color:#94a3b8;font-size:12px;">SaveDino</p>
                      <p style="margin:0 0 3px 0;color:#64748b;">NASA &amp; IASC Asteroid Search Collaboration</p>
                      <p style="margin:0;color:#64748b;">SEDS Sri Lanka</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
