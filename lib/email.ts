import "server-only";

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

type SendAppEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendAppEmail(input: SendAppEmailInput) {
  if (!resend || !resendFromEmail) {
    return { ok: false, skipped: true as const };
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const normalizedRecipients = recipients.map((email) => email.trim()).filter(Boolean);

  if (normalizedRecipients.length === 0) {
    return { ok: false, skipped: true as const };
  }

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to: normalizedRecipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return { ok: true as const, skipped: false as const };
  } catch (error) {
    console.error("Failed to send email", error);
    return { ok: false as const, skipped: false as const };
  }
}

export function getAppBaseUrl() {
  return process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
