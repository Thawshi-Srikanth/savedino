import { renderBaseEmailLayout } from "./base-layout";

export interface CustomAdminEmailParams {
  name?: string | null;
  email: string;
  subject: string;
  message: string;
  badgeText?: string | null;
  badgeColor?: "violet" | "emerald" | "amber" | "sky" | "rose" | "slate" | string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
  senderName?: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBadgeStyles(color?: string | null): { bg: string; text: string; border: string } {
  switch (color) {
    case "emerald":
      return { bg: "#064e3b", text: "#6ee7b7", border: "#059669" };
    case "amber":
      return { bg: "#78350f", text: "#fcd34d", border: "#d97706" };
    case "sky":
      return { bg: "#0c4a6e", text: "#7dd3fc", border: "#0284c7" };
    case "rose":
      return { bg: "#881337", text: "#fda4af", border: "#e11d48" };
    case "slate":
      return { bg: "#1e293b", text: "#94a3b8", border: "#334155" };
    case "violet":
    default:
      return { bg: "#2e1065", text: "#c4b5fd", border: "#7c3aed" };
  }
}

export function renderCustomAdminEmail({
  name,
  email,
  subject,
  message,
  badgeText,
  badgeColor = "violet",
  actionLabel,
  actionUrl,
  senderName,
}: CustomAdminEmailParams): {
  html: string;
  text: string;
} {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello Citizen Scientist,";
  const badge = badgeText ? badgeText.trim() : null;
  const badgeStyle = getBadgeStyles(badgeColor);

  // Parse paragraphs from editable body
  const rawParagraphs = message.split(/\n\s*\n/);
  const formattedParagraphsHtml = rawParagraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      const escaped = escapeHtml(trimmed).replace(/\n/g, "<br/>");
      return `<p class="email-text-muted" style="margin:0 0 16px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.65;color:#94a3b8;">${escaped}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  const hasAction = Boolean(actionUrl && actionLabel && actionUrl.trim() && actionLabel.trim());
  const effectiveSender = senderName?.trim() || "SaveDino Team";

  const content = `
    ${
      badge
        ? `<!-- Header Badge -->
    <div style="margin:0 0 16px 0;">
      <span style="display:inline-block;padding:4px 10px;border-radius:6px;background-color:${badgeStyle.bg};color:${badgeStyle.text};border:1px solid ${badgeStyle.border};font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">
        ${escapeHtml(badge)}
      </span>
    </div>`
        : ""
    }

    <!-- Subject Title -->
    <h1 class="email-text-title" style="margin:0 0 14px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:21px;font-weight:700;color:#f3f4f6;letter-spacing:-0.3px;line-height:1.35;">
      ${escapeHtml(subject)}
    </h1>

    <!-- Salutation -->
    <p class="email-text-muted" style="margin:0 0 16px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;font-weight:600;line-height:1.6;color:#e2e8f0;">
      ${greeting}
    </p>

    <!-- Body Paragraphs -->
    <div style="margin:0 0 20px 0;">
      ${formattedParagraphsHtml}
    </div>

    ${
      hasAction
        ? `<!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:24px 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${escapeHtml(actionUrl!.trim())}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              ${escapeHtml(actionLabel!.trim())}
            </a>
          </td>
        </tr>
      </tbody>
    </table>`
        : ""
    }

    <!-- Sign-off -->
    <div style="margin:24px 0 0 0;padding-top:16px;border-top:1px solid #26282e;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;line-height:1.5;color:#94a3b8;">
      <p style="margin:0 0 4px 0;">Best regards,</p>
      <p style="margin:0;font-weight:700;color:#f3f4f6;">${escapeHtml(effectiveSender)}</p>
      <p style="margin:0;font-size:11px;color:#64748b;font-family:'Space Mono', monospace;">SEDS Sri Lanka &bull; NASA / IASC Collaboration</p>
    </div>
  `;

  const html = renderBaseEmailLayout({
    title: subject,
    previewText: message.slice(0, 140).replace(/\n/g, " "),
    content,
    recipientEmail: email,
    reasonText: "You received this direct message from a SaveDino platform administrator.",
  });

  const plainGreeting = name ? `Hello ${name},` : "Hello Citizen Scientist,";
  const text = `${plainGreeting}\n\n${subject.toUpperCase()}\n\n${message}\n\n${
    hasAction ? `${actionLabel}: ${actionUrl}\n\n` : ""
  }Best regards,\n${effectiveSender}\nSEDS Sri Lanka`;

  return { html, text };
}
