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

export async function subscribeToNewsletter(email: string) {
  if (!resend) {
    console.log("=================================================");
    console.log(`[NEWSLETTER SUBSCRIBE (SIMULATED FOR ${email})]`);
    console.log("=================================================");
    return { success: true, simulated: true };
  }

  const segmentId =
    process.env.RESEND_SEGMENT_ID || "ed40a4c8-4b89-4a0b-94b5-1246d21b597c";

  try {
    // Resend SDK: Create contact and attach to segment
    const { data, error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    } as any);

    if (!error && data) {
      return { success: true, data };
    }

    if (error) {
      console.warn("[Resend Contact Info]:", error.message);
    }

    // If contact already existed, ensure it is added to the segment
    try {
      const lookup = await resend.contacts.get({ email });
      const contactId = lookup.data?.id || data?.id;
      if (contactId && (resend.contacts as any)?.segments?.add) {
        await (resend.contacts as any).segments.add({
          contactId,
          segmentId,
        });
      }
    } catch (segErr) {
      console.warn("[Resend Segment Add Warning]:", segErr);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[Subscribe Newsletter Exception]:", err);
    return { success: true, warning: err.message };
  }
}
