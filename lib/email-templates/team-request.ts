import { renderBaseEmailLayout } from "./base-layout";

// ---------------------------------------------------------------------------
// 1. Team Join Request (Sent to Squad Leader)
// ---------------------------------------------------------------------------
export interface TeamJoinRequestEmailParams {
  leaderName?: string;
  applicantName: string;
  applicantEmail: string;
  teamName: string;
  campaignName: string;
  message?: string | null;
  reviewUrl: string;
  recipientEmail?: string;
}

export function renderTeamJoinRequestEmail({
  leaderName,
  applicantName,
  applicantEmail,
  teamName,
  campaignName,
  message,
  reviewUrl,
  recipientEmail,
}: TeamJoinRequestEmailParams): { html: string; text: string } {
  const greeting = leaderName ? `Hello ${escapeHtml(leaderName)},` : "Hello Squad Leader,";

  const content = `
    <h1 class="email-text-title" style="margin:0 0 10px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      New Squad Join Request
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      ${greeting} <strong>${escapeHtml(applicantName)}</strong> has requested to join your research squad <strong>${escapeHtml(teamName)}</strong> for <strong>${escapeHtml(campaignName)}</strong>.
    </p>

    <!-- Applicant Summary Details -->
    <div style="margin:0 0 24px 0;padding-left:14px;border-left:2px solid #8b5cf6;">
      <div class="email-text-faint" style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:700;">
        Applicant Profile
      </div>
      <div class="email-text-title" style="font-family:'Inter', sans-serif;font-size:15px;font-weight:700;color:#f3f4f6;margin-bottom:2px;">
        ${escapeHtml(applicantName)}
      </div>
      <div class="email-text-muted" style="font-family:'Space Mono', monospace;font-size:12px;color:#94a3b8;margin-bottom:${message ? "10px" : "0"};">
        ${escapeHtml(applicantEmail)}
      </div>
      ${
        message
          ? `<div style="font-family:'Inter', sans-serif;font-size:13px;color:#cbd5e1;line-height:1.5;font-style:italic;">
               &ldquo;${escapeHtml(message)}&rdquo;
             </div>`
          : ""
      }
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${reviewUrl}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Review Join Request &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="email-divider email-text-faint" style="margin:0;padding:16px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', sans-serif;font-size:11px;line-height:1.6;color:#64748b;">
      <p style="margin:0;">You can accept or decline this request anytime inside your squad workspace.</p>
    </div>
  `;

  const reasonText = "You've received this email because you are the squad leader of a research team on SaveDino.";

  const html = renderBaseEmailLayout({
    title: `New Join Request for ${teamName} - SaveDino`,
    previewText: `${applicantName} has requested to join squad ${teamName}.`,
    content,
    recipientEmail,
    reasonText,
  });

  const text = [
    `New Squad Join Request for ${teamName}`,
    "",
    `${greeting}`,
    `${applicantName} (${applicantEmail}) has requested to join your squad ${teamName} in ${campaignName}.`,
    message ? `\nMessage: "${message}"` : "",
    "",
    `Review and manage this request at:`,
    reviewUrl,
    "",
    recipientEmail ? `This email was sent to ${recipientEmail}` : "This email was sent to your registered email address",
    reasonText,
    "",
    "SaveDino - NASA & IASC Asteroid Search Collaboration",
    "SEDS Sri Lanka",
  ].filter(Boolean).join("\n");

  return { html, text };
}

// ---------------------------------------------------------------------------
// 2. Team Request Accepted (Sent to Citizen Scientist)
// ---------------------------------------------------------------------------
export interface TeamRequestAcceptedEmailParams {
  applicantName: string;
  teamName: string;
  campaignName: string;
  leaderName?: string;
  workspaceUrl: string;
  recipientEmail?: string;
}

export function renderTeamRequestAcceptedEmail({
  applicantName,
  teamName,
  campaignName,
  leaderName,
  workspaceUrl,
  recipientEmail,
}: TeamRequestAcceptedEmailParams): { html: string; text: string } {
  const leaderInfo = leaderName ? ` by squad leader ${escapeHtml(leaderName)}` : "";

  const content = `
    <h1 class="email-text-title" style="margin:0 0 10px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Squad Request Accepted!
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      Great news, <strong>${escapeHtml(applicantName)}</strong>! Your request to join squad <strong>${escapeHtml(teamName)}</strong> for <strong>${escapeHtml(campaignName)}</strong> has been approved${leaderInfo}.
    </p>

    <!-- Squad Info Details -->
    <div style="margin:0 0 24px 0;padding-left:14px;border-left:2px solid #8b5cf6;">
      <div class="email-text-faint" style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:700;">
        Enrolled Research Squad
      </div>
      <div class="email-text-title" style="font-family:'Inter', sans-serif;font-size:16px;font-weight:700;color:#f3f4f6;margin-bottom:2px;">
        ${escapeHtml(teamName)}
      </div>
      <div class="email-text-muted" style="font-family:'Space Mono', monospace;font-size:12px;color:#94a3b8;">
        ${escapeHtml(campaignName)}
      </div>
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

    <div class="email-divider email-text-faint" style="margin:0;padding:16px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', sans-serif;font-size:11px;line-height:1.6;color:#64748b;">
      <p style="margin:0;">You can now view your squad roster, claim asteroid image sets, and submit candidate observations.</p>
    </div>
  `;

  const reasonText = "You've received this email because your request to join a research squad on SaveDino was approved.";

  const html = renderBaseEmailLayout({
    title: `You have joined ${teamName} - SaveDino`,
    previewText: `Congratulations! Your request to join squad ${teamName} was accepted.`,
    content,
    recipientEmail,
    reasonText,
  });

  const text = [
    `Squad Request Accepted!`,
    "",
    `Hello ${applicantName},`,
    `Your request to join squad "${teamName}" for "${campaignName}" has been approved!`,
    "",
    `Open your squad workspace:`,
    workspaceUrl,
    "",
    recipientEmail ? `This email was sent to ${recipientEmail}` : "This email was sent to your registered email address",
    reasonText,
    "",
    "SaveDino - NASA & IASC Asteroid Search Collaboration",
    "SEDS Sri Lanka",
  ].filter(Boolean).join("\n");

  return { html, text };
}

// ---------------------------------------------------------------------------
// 3. Team Request Rejected (Sent to Citizen Scientist)
// ---------------------------------------------------------------------------
export interface TeamRequestRejectedEmailParams {
  applicantName: string;
  teamName: string;
  campaignName: string;
  exploreTeamsUrl: string;
  recipientEmail?: string;
}

export function renderTeamRequestRejectedEmail({
  applicantName,
  teamName,
  campaignName,
  exploreTeamsUrl,
  recipientEmail,
}: TeamRequestRejectedEmailParams): { html: string; text: string } {
  const content = `
    <h1 class="email-text-title" style="margin:0 0 10px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Squad Application Update
    </h1>

    <p class="email-text-muted" style="margin:0 0 16px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      Hello <strong>${escapeHtml(applicantName)}</strong>, your join request for squad <strong>${escapeHtml(teamName)}</strong> in <strong>${escapeHtml(campaignName)}</strong> was declined (the squad may have reached capacity or completed team formation).
    </p>

    <p class="email-text-muted" style="margin:0 0 28px 0;padding:0;font-family:'Inter', sans-serif;font-size:14px;color:#cbd5e1;line-height:1.6;">
      Don&apos;t worry! There are other active research squads looking for citizen scientists, or you can create your own squad for this campaign.
    </p>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${exploreTeamsUrl}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Explore Available Squads &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="email-divider email-text-faint" style="margin:0;padding:16px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', sans-serif;font-size:11px;line-height:1.6;color:#64748b;">
      <p style="margin:0;">Need help finding a team? Use our Solo Researcher Matchmaking in the teams directory.</p>
    </div>
  `;

  const reasonText = "You've received this email regarding your squad application on SaveDino.";

  const html = renderBaseEmailLayout({
    title: `Squad Application Update - SaveDino`,
    previewText: `Update regarding your squad application for ${teamName}.`,
    content,
    recipientEmail,
    reasonText,
  });

  const text = [
    `Squad Application Update`,
    "",
    `Hello ${applicantName},`,
    `Your request to join squad "${teamName}" in "${campaignName}" was declined.`,
    "",
    `Explore other open squads or create a squad:`,
    exploreTeamsUrl,
    "",
    recipientEmail ? `This email was sent to ${recipientEmail}` : "This email was sent to your registered email address",
    reasonText,
    "",
    "SaveDino - NASA & IASC Asteroid Search Collaboration",
    "SEDS Sri Lanka",
  ].filter(Boolean).join("\n");

  return { html, text };
}

// ---------------------------------------------------------------------------
// 4. Team Direct Invitation (Sent to invited Researcher)
// ---------------------------------------------------------------------------
export interface TeamInvitationEmailParams {
  inviteeName?: string;
  inviterName: string;
  teamName: string;
  campaignName: string;
  inviteCode: string;
  joinUrl: string;
  recipientEmail?: string;
}

export function renderTeamInvitationEmail({
  inviteeName,
  inviterName,
  teamName,
  campaignName,
  inviteCode,
  joinUrl,
  recipientEmail,
}: TeamInvitationEmailParams): { html: string; text: string } {
  const greeting = inviteeName ? `Hello ${escapeHtml(inviteeName)},` : "Hello Citizen Scientist,";

  const content = `
    <h1 class="email-text-title" style="margin:0 0 10px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      You're Invited to Join a Squad!
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      ${greeting} <strong>${escapeHtml(inviterName)}</strong> has invited you to join research squad <strong>${escapeHtml(teamName)}</strong> for <strong>${escapeHtml(campaignName)}</strong>.
    </p>

    <!-- Invitation Code Display -->
    <div style="margin:0 0 24px 0;padding-left:14px;border-left:2px solid #8b5cf6;">
      <div class="email-text-faint" style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:4px;font-weight:700;">
        Squad Invitation Code
      </div>
      <div style="font-family:'Space Mono', monospace;font-size:22px;font-weight:700;letter-spacing:2px;color:#8b5cf6;">
        ${escapeHtml(inviteCode.toUpperCase())}
      </div>
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${joinUrl}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Join Squad Now &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="email-divider email-text-faint" style="margin:0;padding:16px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', sans-serif;font-size:11px;line-height:1.6;color:#64748b;">
      <p style="margin:0;">Click the button above or enter code <strong>${escapeHtml(inviteCode.toUpperCase())}</strong> on the teams directory.</p>
    </div>
  `;

  const reasonText = "You've received this email because a squad leader invited you to join their research squad on SaveDino.";

  const html = renderBaseEmailLayout({
    title: `Invitation to join ${teamName} - SaveDino`,
    previewText: `${inviterName} invited you to join squad ${teamName}.`,
    content,
    recipientEmail,
    reasonText,
  });

  const text = [
    `You are invited to join squad "${teamName}"`,
    "",
    `${greeting}`,
    `${inviterName} has invited you to join squad "${teamName}" for "${campaignName}".`,
    `Invitation Code: ${inviteCode.toUpperCase()}`,
    "",
    `Join directly at:`,
    joinUrl,
    "",
    recipientEmail ? `This email was sent to ${recipientEmail}` : "This email was sent to your registered email address",
    reasonText,
    "",
    "SaveDino - NASA & IASC Asteroid Search Collaboration",
    "SEDS Sri Lanka",
  ].filter(Boolean).join("\n");

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
