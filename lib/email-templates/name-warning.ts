import { renderBaseEmailLayout } from "./base-layout";

export interface NameWarningEmailParams {
  name?: string | null;
  email: string;
  currentName?: string | null;
  customNote?: string | null;
  profileUrl: string;
}

export function renderNameWarningEmail({
  name,
  email,
  currentName,
  customNote,
  profileUrl,
}: NameWarningEmailParams): {
  html: string;
  text: string;
} {
  const displayName = name || currentName || "Citizen Scientist";
  const rawCurrent = currentName || name || "(Incomplete Name)";

  const content = `
    <!-- Header Notice Badge (Solid) -->
    <div style="margin:0 0 16px 0;">
      <span style="display:inline-block;padding:5px 12px;border-radius:6px;background-color:#f59e0b;color:#0f172a;font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;">
        Action Required
      </span>
    </div>

    <h1 class="email-text-title" style="margin:0 0 12px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Please update your full legal name
    </h1>

    <p class="email-text-muted" style="margin:0 0 20px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      Hello <strong>${escapeHtml(displayName)}</strong>, our campaign organizers noticed that the name currently registered on your SaveDino account is incomplete, uses a nickname, or does not meet official NASA / IASC citizen science reporting standards.
    </p>

    <!-- Current Name Card -->
    <div style="margin:0 0 24px 0;padding:16px;background-color:#1c1d21;border:1px solid #38393e;border-left:3px solid #f59e0b;border-radius:8px;">
      <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px;font-weight:700;">
        Current Name on Record
      </div>
      <div style="font-family:'Space Mono', monospace;font-size:14px;font-weight:700;color:#f3f4f6;margin-bottom:8px;">
        "${escapeHtml(rawCurrent)}"
      </div>
      <div style="font-family:'Inter', sans-serif;font-size:12px;color:#94a3b8;line-height:1.5;">
        NASA and IASC require authentic, verifiable full names (First &amp; Last Name) for official astronomical discovery credit and participation certificates.
      </div>

      ${
        customNote && customNote.trim()
          ? `
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #26282e;">
        <div style="font-family:'Space Mono', monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:700;">
          Organizer Note
        </div>
        <div style="font-family:'Inter', sans-serif;font-size:13px;color:#cbd5e1;line-height:1.5;white-space:pre-wrap;">
          ${escapeHtml(customNote.trim())}
        </div>
      </div>
      `
          : ""
      }
    </div>

    <!-- Uncontainerized Warning / Requirement Notice (Red Title, Normal Text) -->
    <div style="margin:0 0 28px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;line-height:1.6;">
      <p style="margin:0 0 4px 0;font-weight:700;color:#ef4444;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">
        Warning &bull; Important Requirement:
      </p>
      <p style="margin:0;color:#94a3b8;">
        If your full legal name is not updated before campaign registration closes, you will not be able to participate in upcoming asteroid search campaigns or receive official discovery certificates.
      </p>
    </div>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${profileUrl}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Update Full Name in Settings &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Direct Fallback Link -->
    <p class="email-text-faint" style="margin:0 0 6px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:12px;color:#64748b;">
      Direct profile settings link:
    </p>
    <p style="margin:0 0 24px 0;padding:0;font-family:'Space Mono', ui-monospace, monospace;font-size:11px;line-height:1.6;word-break:break-all;">
      <a href="${profileUrl}" style="color:#a78bfa;text-decoration:underline;" target="_blank">
        ${profileUrl}
      </a>
    </p>
  `;

  const reasonText =
    "You have received this notice because your SaveDino account profile requires identity verification for upcoming campaigns.";

  const html = renderBaseEmailLayout({
    title: "Action Required: Update Your Full Name - SaveDino",
    previewText:
      "Please update your full legal name on SaveDino before campaign registration closes to participate.",
    content,
    recipientEmail: email,
    reasonText,
  });

  const text = [
    "SaveDino - Action Required: Update Your Full Legal Name",
    "",
    `Hello ${displayName},`,
    "",
    "Our campaign organizers noticed that the name registered on your SaveDino account is incomplete, uses a nickname, or does not meet official NASA / IASC reporting standards.",
    "",
    `Current Name on Record: "${rawCurrent}"`,
    "",
    customNote && customNote.trim() ? `Organizer Note:\n${customNote.trim()}\n` : "",
    "WARNING - IMPORTANT CAMPAIGN REQUIREMENT:",
    "If your full legal name is not updated before campaign registration closes, you will not be able to participate in upcoming asteroid search campaigns or receive official discovery certificates.",
    "",
    `Update your full name now at: ${profileUrl}`,
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
