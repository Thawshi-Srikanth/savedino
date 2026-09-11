import { Resend } from "resend";
import { renderSignInEmail } from "./email-templates/sign-in";
import {
  renderTeamJoinRequestEmail,
  renderTeamRequestAcceptedEmail,
  renderTeamRequestRejectedEmail,
  renderTeamInvitationEmail,
  TeamJoinRequestEmailParams,
  TeamRequestAcceptedEmailParams,
  TeamRequestRejectedEmailParams,
  TeamInvitationEmailParams,
} from "./email-templates/team-request";

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured =
  Boolean(resendApiKey) &&
  !resendApiKey?.startsWith("re_your_") &&
  !resendApiKey?.includes("placeholder");

const brevoApiKey = process.env.BREVO_API_KEY;
const isBrevoConfigured =
  Boolean(brevoApiKey) &&
  !brevoApiKey?.startsWith("xkeysib_your_") &&
  !brevoApiKey?.includes("placeholder");

const defaultReplyToEmail = process.env.EMAIL_REPLY_TO || "SEDS Sri Lanka <info@sedssl.org>";

// Semantic Template-Aware Senders on savedino.sedssl.org
export const EMAIL_SENDERS = {
  auth:
    process.env.EMAIL_FROM_AUTH ||
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "SaveDino Auth <login@savedino.sedssl.org>",
  squads:
    process.env.EMAIL_FROM_SQUADS ||
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "SaveDino Squads <squads@savedino.sedssl.org>",
  campaigns:
    process.env.EMAIL_FROM_CAMPAIGNS ||
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "SaveDino Campaigns <campaigns@savedino.sedssl.org>",
  default:
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    "SaveDino <login@savedino.sedssl.org>",
};

const resend = isResendConfigured ? new Resend(resendApiKey) : null;

/**
 * Parses display name and email address from standard "Name <email@domain.com>" format
 */
function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "SaveDino", email: raw.trim() };
}

export interface GenericEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  provider?: "auto" | "resend" | "brevo";
}

/**
 * Core universal email dispatcher with automatic Resend -> Brevo failover
 * and specific provider override for testing.
 */
export async function sendEmailInternal({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  provider = "auto",
}: GenericEmailOptions) {
  const activeFrom = from || EMAIL_SENDERS.default;
  const activeReplyTo = replyTo || defaultReplyToEmail;

  // 1. PRIMARY: Resend (if provider is 'auto' or 'resend')
  if ((provider === "auto" || provider === "resend") && resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: activeFrom,
        replyTo: activeReplyTo,
        to: [to],
        subject,
        html,
        text,
      });

      if (!error && data) {
        return { success: true, provider: "resend", data };
      }

      if (provider === "resend") {
        throw new Error(error?.message || "Resend delivery failed");
      }

      console.warn(
        `[Resend Delivery Issue: ${error?.message || "Unknown error"}]. Attempting Brevo failover...`
      );
    } catch (err: any) {
      if (provider === "resend") {
        throw err;
      }
      console.warn(
        `[Resend Exception: ${err?.message || "Unknown error"}]. Attempting Brevo failover...`
      );
    }
  }

  // 2. BACKUP FAILOVER: Brevo REST API (if provider is 'auto' or 'brevo')
  if ((provider === "auto" || provider === "brevo") && isBrevoConfigured && brevoApiKey) {
    try {
      const parsedSender = parseEmailAddress(activeFrom);
      const parsedReplyTo = parseEmailAddress(activeReplyTo);

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: parsedSender.name, email: parsedSender.email },
          replyTo: { name: parsedReplyTo.name, email: parsedReplyTo.email },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, provider: "brevo", data };
      }

      const errorBody = await response.text();
      console.error(`[Brevo Error (${response.status})]:`, errorBody);
      if (provider === "brevo") {
        throw new Error(`Brevo error (${response.status}): ${errorBody}`);
      }
    } catch (brevoErr: any) {
      console.error("[Brevo Exception]:", brevoErr?.message || brevoErr);
      if (provider === "brevo") {
        throw brevoErr;
      }
    }
  }

  // 3. DEVELOPMENT / SIMULATION FALLBACK
  console.log("=================================================");
  console.log(`[EMAIL DISPATCH (SIMULATED FOR ${to})]`);
  console.log(`PROVIDER: ${provider}`);
  console.log(`FROM: ${activeFrom}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`TEXT PREVIEW: ${text.slice(0, 150)}...`);
  console.log("=================================================");
  return { success: true, simulated: true, provider: "simulated" };
}

// ---------------------------------------------------------------------------
// Public Exported Email Dispatchers (Template-Aware Senders)
// ---------------------------------------------------------------------------

export interface SendMagicLinkParams {
  email: string;
  url: string;
  token?: string;
  from?: string;
}

export async function sendMagicLinkEmail({ email, url, from }: SendMagicLinkParams) {
  const { html, text } = renderSignInEmail({ url, email });
  const subject = "Sign in to your SaveDino account - SEDS Sri Lanka";
  return sendEmailInternal({
    to: email,
    subject,
    html,
    text,
    from: from || EMAIL_SENDERS.auth,
  });
}

export async function sendTeamJoinRequestEmail(
  toEmail: string,
  params: TeamJoinRequestEmailParams,
  from?: string
) {
  const { html, text } = renderTeamJoinRequestEmail(params);
  const subject = `New Join Request for squad ${params.teamName} - SaveDino`;
  return sendEmailInternal({
    to: toEmail,
    subject,
    html,
    text,
    from: from || EMAIL_SENDERS.squads,
  });
}

export async function sendTeamRequestAcceptedEmail(
  toEmail: string,
  params: TeamRequestAcceptedEmailParams,
  from?: string
) {
  const { html, text } = renderTeamRequestAcceptedEmail(params);
  const subject = `Squad Request Approved: Welcome to ${params.teamName}! - SaveDino`;
  return sendEmailInternal({
    to: toEmail,
    subject,
    html,
    text,
    from: from || EMAIL_SENDERS.squads,
  });
}

export async function sendTeamRequestRejectedEmail(
  toEmail: string,
  params: TeamRequestRejectedEmailParams,
  from?: string
) {
  const { html, text } = renderTeamRequestRejectedEmail(params);
  const subject = `Squad Application Update: ${params.teamName} - SaveDino`;
  return sendEmailInternal({
    to: toEmail,
    subject,
    html,
    text,
    from: from || EMAIL_SENDERS.squads,
  });
}

export async function sendTeamInvitationEmail(
  toEmail: string,
  params: TeamInvitationEmailParams,
  from?: string
) {
  const { html, text } = renderTeamInvitationEmail(params);
  const subject = `You are invited to join squad ${params.teamName} - SaveDino`;
  return sendEmailInternal({
    to: toEmail,
    subject,
    html,
    text,
    from: from || EMAIL_SENDERS.squads,
  });
}

/**
 * Subscribes a user to the SaveDino newsletter segment / list
 */
export async function subscribeToNewsletter(email: string) {
  // 1. Primary: Resend Contacts
  if (resend) {
    try {
      const { data, error } = await (resend.contacts as any).create({
        email,
        unsubscribed: false,
      });

      if (!error && data) {
        return { success: true, provider: "resend", data };
      }

      if (error) {
        console.warn("[Resend Contact Info]:", error.message);
      }

      return { success: true, provider: "resend", data };
    } catch (err: any) {
      console.warn("[Resend Subscribe Warning]:", err.message);
    }
  }

  // 2. Backup: Brevo Contacts API
  if (isBrevoConfigured && brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          updateEnabled: true,
        }),
      });

      if (response.ok || response.status === 204) {
        return { success: true, provider: "brevo" };
      }
    } catch (brevoErr: any) {
      console.warn("[Brevo Subscribe Warning]:", brevoErr?.message || brevoErr);
    }
  }

  // 3. Development / Simulation Fallback
  console.log("=================================================");
  console.log(`[NEWSLETTER SUBSCRIBE (SIMULATED FOR ${email})]`);
  console.log("=================================================");
  return { success: true, simulated: true };
}
