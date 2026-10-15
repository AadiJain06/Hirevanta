import { env } from "./env";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

/**
 * Provider-agnostic email sender.
 *  - resend:  transactional API
 *  - smtp:    nodemailer (Gmail App Password, SendGrid, SES SMTP, etc.)
 *  - console: logs to server console (safe local default — no secrets needed)
 *
 * Returns a result object instead of throwing so callers can persist
 * delivery status and retry failures.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    switch (env.emailProvider) {
      case "resend":
        return await sendViaResend(input);
      case "smtp":
        return await sendViaSmtp(input);
      case "console":
      default:
        return sendViaConsole(input);
    }
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  if (!env.resendApiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(env.resendApiKey);
  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, providerId: data?.id };
}

async function sendViaSmtp(input: SendEmailInput): Promise<SendEmailResult> {
  if (!env.smtp.host || !env.smtp.user) {
    return { ok: false, error: "SMTP is not fully configured." };
  }
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.password },
  });
  const info = await transport.sendMail({
    from: env.emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
  return { ok: true, providerId: info.messageId };
}

function sendViaConsole(input: SendEmailInput): SendEmailResult {
  // Never log full HTML bodies with PII in production; this path is dev-only.
  console.log(
    `\n[email:console] → ${input.to}\n  subject: ${input.subject}\n  (set EMAIL_PROVIDER=resend|smtp to actually deliver)\n`,
  );
  return { ok: true, providerId: `console-${Date.now()}` };
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown email error.";
}
