import { renderBaseEmailLayout } from "./base-layout";

export interface TeamMemberBannedEmailParams {
  leaderName?: string | null;
  leaderEmail: string;
  memberName: string;
  memberEmail?: string | null;
  teamName: string;
  campaignName?: string | null;
  workspaceUrl: string;
}

export function renderTeamMemberBannedEmail({
  leaderName,
  leaderEmail,
  memberName,
  memberEmail,
  teamName,
  campaignName,
  workspaceUrl,
}: TeamMemberBannedEmailParams): {
  html: string;
  text: string;
} {
  const greeting = leaderName ? `Hello ${escapeHtml(leaderName)},` : "Hello Squad Leader,";

  const content = `
    <!-- Header Notice Badge (Solid) -->
    <div style="margin:0 0 16px 0;">
      <span style="display:inline-block;padding:5px 12px;border-radius:6px;background-color:#8b5cf6;color:#ffffff;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
        Squad Roster Update
      </span>
    </div>

    <h1 class="email-text-title" style="margin:0 0 12px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Member removed from your squad
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      ${greeting} a member of your research squad <strong>${escapeHtml(teamName)}</strong> has been removed following an administrative moderation action on their account.
    </p>

    <!-- Removed Member Summary Card -->
    <div style="margin:0 0 24px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-left:3px solid #8b5cf6;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px;font-weight:700;">
        Removed Squad Member
      </div>
      <div style="font-family:'Inter', sans-serif;font-size:15px;font-weight:700;color:#f3f4f6;margin-bottom:2px;">
        ${escapeHtml(memberName)}
      </div>
      ${
        memberEmail
          ? `<div style="font-family:'Space Mono', monospace;font-size:12px;color:#94a3b8;margin-bottom:6px;">
               ${escapeHtml(memberEmail)}
             </div>`
          : ""
      }
      ${
        campaignName
          ? `<div style="font-family:'Inter', sans-serif;font-size:12px;color:#64748b;margin-top:6px;">
               Campaign: <strong style="color:#cbd5e1;">${escapeHtml(campaignName)}</strong>
             </div>`
          : ""
      }
    </div>

    <!-- Uncontainerized Squad Open Spot Notice (Red Title, Normal Text) -->
    <div style="margin:0 0 28px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;line-height:1.6;">
      <p style="margin:0 0 6px 0;font-weight:700;color:#ef4444;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">
        Notice &bull; Squad Roster Impact:
      </p>
      <ul style="margin:0 0 12px 20px;padding:0;color:#94a3b8;">
        <li style="margin-bottom:4px;">Your squad now has an open spot for another citizen scientist.</li>
        <li style="margin-bottom:4px;">Any image sets previously claimed by this member have been unassigned and returned to your team pool.</li>
        <li style="margin-bottom:0;">You can invite a new researcher using your squad's invite code or solo matchmaking in your workspace.</li>
      </ul>
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${workspaceUrl}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Open Squad Workspace &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const reasonText =
    "You have received this email because you are the Squad Leader for this research team on SaveDino.";

  const html = renderBaseEmailLayout({
    title: `Squad Update: Member removed from ${teamName} - SaveDino`,
    previewText: `${memberName} has been removed from your squad ${teamName}.`,
    content,
    recipientEmail: leaderEmail,
    reasonText,
  });

  const text = [
    `SaveDino - Squad Roster Update: ${teamName}`,
    "",
    greeting,
    "",
    `A member of your squad ${teamName}, ${memberName}, has been removed following an administrative moderation action on their account.`,
    "",
    "NOTICE - SQUAD ROSTER IMPACT:",
    "- Your squad now has an open spot for another citizen scientist.",
    "- Any image sets previously claimed by this member have been returned to your team pool.",
    "- You can invite a new researcher using your squad invite code or solo matchmaking.",
    "",
    `Open your squad workspace: ${workspaceUrl}`,
    "",
    `This email was sent to ${leaderEmail}`,
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
