import { renderBaseEmailLayout } from "./base-layout";

export interface TeamReportEmailParams {
  reporterName: string;
  reporterEmail: string;
  reporterRole?: string;
  reporterUserId: string;
  teamName: string;
  teamId: string;
  campaignName: string;
  leaderName: string;
  leaderEmail: string;
  reason: string;
  description: string;
  teamUrl: string;
}

export function renderTeamReportEmail({
  reporterName,
  reporterEmail,
  reporterRole = "Squad Member",
  reporterUserId,
  teamName,
  teamId,
  campaignName,
  leaderName,
  leaderEmail,
  reason,
  description,
  teamUrl,
}: TeamReportEmailParams): { html: string; text: string } {
  const content = `
    <!-- Header Incident Alert Badge -->
    <div style="margin:0 0 16px 0;">
      <span style="display:inline-block;padding:5px 12px;border-radius:6px;background-color:#ef4444;color:#ffffff;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">
        Squad Incident Report
      </span>
    </div>

    <h1 class="email-text-title" style="margin:0 0 12px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Incident Report: ${escapeHtml(teamName)}
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      A squad member has submitted a formal incident report regarding their team in <strong>${escapeHtml(campaignName)}</strong>. Please review the details below.
    </p>

    <!-- Reason Box -->
    <div style="margin:0 0 20px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-left:4px solid #ef4444;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#ef4444;margin-bottom:4px;font-weight:700;">
        Report Reason / Category
      </div>
      <div style="font-family:'Inter', sans-serif;font-size:16px;font-weight:700;color:#f3f4f6;margin-bottom:12px;">
        ${escapeHtml(reason)}
      </div>
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px;font-weight:700;">
        Member Statement &amp; Description
      </div>
      <div style="font-family:'Inter', sans-serif;font-size:13px;color:#e2e8f0;line-height:1.6;white-space:pre-wrap;background-color:#121315;padding:12px;border-radius:6px;border:1px solid #26282e;">
${escapeHtml(description)}
      </div>
    </div>

    <!-- Reporter Profile Card -->
    <div style="margin:0 0 20px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;margin-bottom:8px;font-weight:700;">
        Reported By (Member Profile)
      </div>
      <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="font-family:'Inter', sans-serif;font-size:13px;">
        <tr>
          <td style="padding:4px 0;color:#94a3b8;width:120px;">Name:</td>
          <td style="padding:4px 0;color:#f3f4f6;font-weight:600;">${escapeHtml(reporterName)} (${escapeHtml(reporterRole)})</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#94a3b8;">Email:</td>
          <td style="padding:4px 0;color:#f3f4f6;font-family:'Space Mono', monospace;font-size:12px;">${escapeHtml(reporterEmail)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#94a3b8;">User ID:</td>
          <td style="padding:4px 0;color:#94a3b8;font-family:'Space Mono', monospace;font-size:11px;">${escapeHtml(reporterUserId)}</td>
        </tr>
      </table>
    </div>

    <!-- Squad Information Card -->
    <div style="margin:0 0 24px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#10b981;margin-bottom:8px;font-weight:700;">
        Squad &amp; Campaign Details
      </div>
      <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="font-family:'Inter', sans-serif;font-size:13px;">
        <tr>
          <td style="padding:4px 0;color:#94a3b8;width:120px;">Squad Name:</td>
          <td style="padding:4px 0;color:#f3f4f6;font-weight:600;">${escapeHtml(teamName)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#94a3b8;">Squad ID:</td>
          <td style="padding:4px 0;color:#94a3b8;font-family:'Space Mono', monospace;font-size:11px;">${escapeHtml(teamId)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#94a3b8;">Campaign:</td>
          <td style="padding:4px 0;color:#f3f4f6;">${escapeHtml(campaignName)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#94a3b8;">Squad Leader:</td>
          <td style="padding:4px 0;color:#f3f4f6;">${escapeHtml(leaderName)} (${escapeHtml(leaderEmail)})</td>
        </tr>
      </table>
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td align="left">
            <a href="${escapeHtml(teamUrl)}" class="email-btn-primary" style="display:inline-block;padding:12px 24px;border-radius:8px;background-color:#8b5cf6;color:#ffffff;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-align:center;text-decoration:none;box-shadow:0 2px 0 rgba(0,0,0,0.05);" target="_blank">
              Inspect Squad Workspace &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const html = renderBaseEmailLayout({
    title: `[Squad Incident Report] ${teamName} - ${reason}`,
    previewText: `Squad incident report from ${reporterName} regarding ${teamName}: ${reason}`,
    content,
    recipientEmail: "savedino@sedssl.org",
    reasonText:
      "This is an internal administrator notification triggered by a squad incident report.",
  });

  const text = `
SQUAD INCIDENT REPORT: ${teamName}
==================================================

Reason / Category: ${reason}
Campaign: ${campaignName}
Squad: ${teamName} (ID: ${teamId})

MEMBER STATEMENT:
--------------------------------------------------
${description}

REPORTED BY:
--------------------------------------------------
Name: ${reporterName} (${reporterRole})
Email: ${reporterEmail}
User ID: ${reporterUserId}

SQUAD DETAILS:
--------------------------------------------------
Leader: ${leaderName} (${leaderEmail})
Workspace Link: ${teamUrl}
==================================================
SaveDino Platform Administration
`.trim();

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
