import { renderBaseEmailLayout } from "./base-layout";

export interface TeamFormationEmailParams {
  userName?: string;
  campaignTitle?: string;
  campaignCode?: string;
  discordInviteUrl?: string;
  teamFormationUrl?: string;
  maxTeams?: number;
  recipientEmail?: string;
}

export function renderTeamFormationEmail({
  userName,
  campaignTitle = "Asteroid Search Campaign",
  campaignCode = "SEDS-2026-A",
  discordInviteUrl = "https://discord.gg/Yp4Ctt6Ece",
  teamFormationUrl,
  maxTeams = 20,
  recipientEmail,
}: TeamFormationEmailParams): {
  html: string;
  text: string;
} {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "https://savedino.sedssl.org";
  const effectiveTeamUrl = teamFormationUrl || `${baseUrl}/teams`;
  const greeting = userName ? `Hello ${escapeHtml(userName)},` : "Hello Citizen Scientist,";

  const content = `
    <!-- Header Badge with Solid Color Background -->
    <div style="margin:0 0 14px 0;">
      <span style="display:inline-block;padding:4px 12px;border-radius:6px;font-family:'Space Mono', monospace;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;background-color:#8b5cf6;color:#ffffff;">
        Team Formation Open &middot; ${escapeHtml(campaignCode)}
      </span>
    </div>

    <!-- Main Title -->
    <h1 class="email-text-title" style="margin:0 0 12px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;line-height:1.3;">
      Team Formation Has Begun!
    </h1>

    <!-- Intro Paragraph -->
    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      ${greeting} Registration and team formation is now officially open for <strong>${escapeHtml(campaignTitle)}</strong>. It's time to gather your crew, connect with fellow researchers, and form your research squad!
    </p>

    <!-- Key Campaign Highlights Box -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 24px 0;background-color:#1c1d21;border:1px solid #38393e;border-radius:10px;overflow:hidden;">
      <tbody>
        <!-- Highlight 1: Limited 20 Squad Slots -->
        <tr>
          <td style="padding:16px;border-bottom:1px solid #26282e;">
            <div style="font-family:'Inter', sans-serif;font-size:13px;font-weight:700;color:#f3f4f6;margin-bottom:4px;">
              Limited to ${maxTeams} Squads Only
            </div>
            <div style="font-family:'Inter', sans-serif;font-size:12px;color:#94a3b8;line-height:1.5;">
              There are only <strong>${maxTeams} squad slots</strong> available for this campaign. Slots are allocated as squads register, so form your squad early.
            </div>
          </td>
        </tr>

        <!-- Highlight 2: Connect on Discord -->
        <tr>
          <td style="padding:16px;border-bottom:1px solid #26282e;">
            <div style="font-family:'Inter', sans-serif;font-size:13px;font-weight:700;color:#f3f4f6;margin-bottom:4px;">
              Meet Teammates on Discord
            </div>
            <div style="font-family:'Inter', sans-serif;font-size:12px;color:#94a3b8;line-height:1.5;">
              Join our official Discord server to find teammates, coordinate with other students, and post in the squad recruitment channels.
            </div>
          </td>
        </tr>

        <!-- Highlight 3: Become a Squad Leader -->
        <tr>
          <td style="padding:16px;">
            <div style="font-family:'Inter', sans-serif;font-size:13px;font-weight:700;color:#f3f4f6;margin-bottom:4px;">
              Step Up as a Squad Leader
            </div>
            <div style="font-family:'Inter', sans-serif;font-size:12px;color:#94a3b8;line-height:1.5;">
              If you have experience with Astrometrica or past asteroid search campaigns, take the initiative to create a team and lead new citizen scientists.
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Primary Call to Action: Discord -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 12px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#5865F2;">
            <a
              href="${escapeHtml(discordInviteUrl)}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#5865F2;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #4752c4;border-bottom:3px solid #3c45a5;border-radius:6px;"
              target="_blank"
            >
              Join Our Discord Server &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Secondary Call to Action: Platform Squads -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${escapeHtml(effectiveTeamUrl)}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:12px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Form / Join a Squad on Platform &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Discord Link Fallback -->
    <p class="email-text-faint" style="margin:0 0 4px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:11px;color:#64748b;">
      Direct Discord link:
    </p>
    <p style="margin:0 0 24px 0;padding:0;font-family:'Space Mono', monospace;font-size:11px;line-height:1.6;word-break:break-all;">
      <a href="${escapeHtml(discordInviteUrl)}" style="color:#a78bfa;text-decoration:underline;" target="_blank">
        ${escapeHtml(discordInviteUrl)}
      </a>
    </p>

    <!-- Friendly Guidance Notice -->
    <div class="email-divider" style="margin:0;padding:16px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', sans-serif;font-size:12px;line-height:1.6;">
      <p style="margin:0 0 4px 0;font-weight:700;color:#10b981;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">
        Next Steps:
      </p>
      <p style="margin:0;color:#94a3b8;">
        1. Join Discord to find teammates. &middot; 2. Create or join a squad on SaveDino. &middot; 3. Prepare your Astrometrica setup before image sets drop!
      </p>
    </div>
  `;

  const reasonText =
    "You've received this email because you are a registered researcher on SaveDino.";

  const html = renderBaseEmailLayout({
    title: `Team Formation Begins: Form Your Research Squad (${campaignCode}) - SaveDino`,
    previewText: `Team formation is now open for ${campaignTitle}! Join Discord (${discordInviteUrl}) to find teammates. Only ${maxTeams} squad slots available.`,
    content,
    recipientEmail,
    reasonText,
  });

  const text = [
    `Team Formation Has Begun! - ${campaignTitle} (${campaignCode})`,
    "",
    greeting,
    `Registration and team formation is now officially open for ${campaignTitle}.`,
    "",
    "KEY HIGHLIGHTS:",
    `- Limited to ${maxTeams} squads: Only ${maxTeams} team slots available in this campaign.`,
    `- Meet teammates on Discord: Join our Discord server to connect and recruit members.`,
    `- Become a Squad Leader: If you have past experience, take the lead and form your team.`,
    "",
    "JOIN DISCORD:",
    discordInviteUrl,
    "",
    "FORM OR JOIN A SQUAD ON SAVEDINO:",
    effectiveTeamUrl,
    "",
    "Next Steps:",
    "1. Join Discord to find teammates.",
    "2. Create or join a squad on SaveDino.",
    "3. Prepare your Astrometrica setup before image sets drop.",
    "",
    recipientEmail
      ? `This email was sent to ${recipientEmail}`
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
