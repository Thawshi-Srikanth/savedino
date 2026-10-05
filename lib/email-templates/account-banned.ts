import { renderBaseEmailLayout } from "./base-layout";

export interface AccountBannedEmailParams {
  name?: string | null;
  email: string;
  reason: string;
  details?: string | null;
  supportEmail?: string;
}

export function renderAccountBannedEmail({
  name,
  email,
  reason,
  details,
  supportEmail = "info@sedssl.org",
}: AccountBannedEmailParams): {
  html: string;
  text: string;
} {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello Citizen Scientist,";
  const appealSubject = encodeURIComponent(
    `Account Suspension Inquiry: ${name ? `${name} (${email})` : email}`
  );
  const supportMailto = `mailto:${supportEmail}?subject=${appealSubject}`;

  const content = `
    <!-- Header Notice Badge (Solid) -->
    <div style="margin:0 0 16px 0;">
      <span style="display:inline-block;padding:5px 12px;border-radius:6px;background-color:#ef4444;color:#ffffff;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
        Account Suspended
      </span>
    </div>

    <h1 class="email-text-title" style="margin:0 0 12px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Notice of Account Suspension
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      ${greeting} your SaveDino account has been suspended by an administrator due to a violation of our community standards or campaign guidelines.
    </p>

    <!-- Reason Box -->
    <div style="margin:0 0 24px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-left:3px solid #ef4444;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px;font-weight:700;">
        Primary Reason
      </div>
      <div style="font-family:'Inter', sans-serif;font-size:14px;font-weight:600;color:#f87171;line-height:1.5;">
        ${escapeHtml(reason)}
      </div>

      ${
        details && details.trim()
          ? `
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #26282e;">
        <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:700;">
          Moderator Notes
        </div>
        <div style="font-family:'Inter', sans-serif;font-size:13px;color:#cbd5e1;line-height:1.5;white-space:pre-wrap;">
          ${escapeHtml(details.trim())}
        </div>
      </div>
      `
          : ""
      }
    </div>

    <!-- Uncontainerized Warning / Suspension Restrictions (Red Title, Normal Text) -->
    <div style="margin:0 0 28px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;line-height:1.6;">
      <p style="margin:0 0 6px 0;font-weight:700;color:#ef4444;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">
        Warning &bull; Account Restrictions:
      </p>
      <ul style="margin:0 0 12px 20px;padding:0;color:#94a3b8;">
        <li style="margin-bottom:4px;">You cannot log in or start new sessions.</li>
        <li style="margin-bottom:4px;">Access to squad workspaces and image analysis tools is disabled.</li>
        <li style="margin-bottom:0;">Any active asteroid search submissions have been put on hold.</li>
      </ul>
      <p style="margin:0;font-size:12px;color:#64748b;">
        If you believe this suspension was made in error or wish to submit an appeal, please contact the SaveDino moderation team.
      </p>
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${supportMailto}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Contact Support / Appeal &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Direct Support Link -->
    <p class="email-text-faint" style="margin:0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:12px;line-height:1.6;color:#64748b;">
      Direct support email: <a href="${supportMailto}" style="color:#a78bfa;text-decoration:underline;">${escapeHtml(supportEmail)}</a>
    </p>
  `;

  const reasonText =
    "You have received this notification regarding an administrative moderation action on your SaveDino account.";

  const html = renderBaseEmailLayout({
    title: "SaveDino Account Suspension Notice",
    previewText: `Your SaveDino account has been suspended: ${reason}`,
    content,
    recipientEmail: email,
    reasonText,
  });

  const text = [
    "SaveDino - Notice of Account Suspension",
    "",
    greeting,
    "",
    "Your SaveDino account has been suspended by an administrator.",
    "",
    `Reason: ${reason}`,
    details && details.trim() ? `Moderator Notes:\n${details.trim()}\n` : "",
    "WARNING - ACCOUNT RESTRICTIONS:",
    "- You cannot log in or start new sessions.",
    "- Access to squad workspaces and image analysis tools is disabled.",
    "- Any active asteroid search submissions have been put on hold.",
    "",
    `If you believe this was made in error, please contact support at ${supportEmail}`,
    "",
    email
      ? `This email was sent to ${email}`
      : "This email was sent to your registered email address",
    reasonText,
    "",
    "SaveDino - NASA & IASC Asteroid Search Collaboration",
    "SEDS Sri Lanka",
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
