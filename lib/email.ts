import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const isPlaceholder = !resendApiKey || resendApiKey.startsWith("re_your_");
const resend = isPlaceholder ? null : new Resend(resendApiKey);
const fromEmail = process.env.RESEND_FROM_EMAIL || "SaveDino <onboarding@resend.dev>";
const templateId = process.env.RESEND_TEMPLATE_ID || "sign-in";

interface SendMagicLinkParams {
  email: string;
  url: string;
  token: string;
}

export async function sendMagicLinkEmail({ email, url, token }: SendMagicLinkParams) {
  if (!resend) {
    console.log("=================================================");
    console.log(`[MAGIC LINK FOR ${email}]`);
    console.log(`URL: ${url}`);
    console.log(`TOKEN: ${token}`);
    console.log("=================================================");
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      template: {
        id: templateId,
        variables: {
          url: url,
          token: token,
        },
      },
    });

    if (error) {
      console.error("[Resend Template Error]:", error);
      throw new Error(error.message || "Failed to send email via Resend template");
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Send Magic Link Exception]:", err);
    throw err;
  }
}
