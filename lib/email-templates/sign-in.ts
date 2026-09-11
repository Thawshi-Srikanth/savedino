import { renderBaseEmailLayout } from "./base-layout";

export interface SignInEmailParams {
  url: string;
  email?: string;
}

export function renderSignInEmail({ url, email }: SignInEmailParams): {
  html: string;
  text: string;
} {
  const content = `
    <h1 class="email-text-title" style="margin:0 0 10px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:22px;font-weight:700;color:#f3f4f6;letter-spacing:-0.4px;">
      Sign in to your account
    </h1>

    <p class="email-text-muted" style="margin:0 0 28px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;line-height:1.6;color:#94a3b8;">
      Click the button below to sign in to SaveDino. No password needed.
    </p>

    <!-- Call to Action Button -->
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin:0 0 28px 0;">
      <tbody>
        <tr>
          <td align="center" style="margin:0;padding:0;border-radius:6px;background-color:#8b5cf6;">
            <a
              href="${url}"
              rel="noopener noreferrer nofollow"
              style="color:#ffffff !important;text-decoration:none;display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#8b5cf6;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:14px 24px;border:1px solid #7c3aed;border-bottom:3px solid #6d28d9;border-radius:6px;"
              target="_blank"
            >
              Sign in to SaveDino &rarr;
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Fallback Text Link -->
    <p class="email-text-faint" style="margin:0 0 6px 0;padding:0;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:12px;color:#64748b;">
      If the button does not work, copy and paste this link into your browser:
    </p>

    <p style="margin:0 0 28px 0;padding:0;font-family:'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-size:11px;line-height:1.6;word-break:break-all;">
      <a href="${url}" style="color:#a78bfa;text-decoration:underline;" target="_blank">
        ${url}
      </a>
    </p>

    <!-- Security & Expiration Disclaimer -->
    <div class="email-divider email-text-faint" style="margin:0;padding:20px 0 0 0;border-top:1px solid #26282e;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:11px;line-height:1.6;color:#64748b;">
      <p style="margin:0 0 3px 0;">This link will expire in 5 minutes and can only be used once.</p>
      <p style="margin:0;">If you did not request this email, you can safely ignore it.</p>
    </div>
  `;

  const reasonText =
    "You've received this email because a sign-in link was requested for your account.";

  const html = renderBaseEmailLayout({
    title: "Sign in to your SaveDino account - SEDS Sri Lanka",
    previewText: "Click here to sign in to your SaveDino account. No password needed.",
    content,
    recipientEmail: email,
    reasonText,
  });

  const text = [
    "Sign in to your SaveDino account",
    "",
    "Click the link below to sign in (no password needed):",
    url,
    "",
    "This link will expire in 5 minutes and can only be used once.",
    "If you did not request this email, you can safely ignore it.",
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
