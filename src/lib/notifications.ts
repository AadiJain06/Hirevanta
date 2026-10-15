import { prisma } from "./db";
import { env } from "./env";
import { sendEmail } from "./email";
import {
  applicationEmailSubject,
  renderApplicationEmail,
  contactEmailSubject,
  renderContactEmail,
} from "./email-templates";
import { getResumeDownloadUrl } from "./storage";

/**
 * Send + log an application notification. The application is already persisted;
 * if email delivery fails we keep an EmailLog row marked FAILED for retry.
 */
export async function notifyApplication(applicationId: string): Promise<boolean> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app) return false;

  const subject = applicationEmailSubject(app.fullName, app.position);
  const log = await prisma.emailLog.create({
    data: {
      kind: "APPLICATION",
      toAddress: env.notifyEmail,
      subject,
      status: "PENDING",
      applicationId: app.id,
    },
  });

  let resumeUrl = `${env.appUrl}/admin/applications/${app.id}`;
  try {
    const direct = await getResumeDownloadUrl(app.resumeKey);
    resumeUrl = direct.startsWith("http") ? direct : `${env.appUrl}${direct}`;
  } catch {
    // Fall back to the admin detail page link.
  }

  const html = renderApplicationEmail({
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    location: app.location,
    linkedin: app.linkedin,
    position: app.position,
    experience: app.experience,
    skills: app.skills,
    employmentStatus: app.employmentStatus,
    expectedSalary: app.expectedSalary,
    noticePeriod: app.noticePeriod,
    coverLetter: app.coverLetter,
    jobTitle: app.job?.title ?? null,
    submittedAt: app.createdAt,
    resumeUrl,
    resumeFilename: app.resumeFilename,
  });

  return deliver(log.id, { to: env.notifyEmail, subject, html, replyTo: app.email });
}

export async function notifyContact(contactId: string): Promise<boolean> {
  const msg = await prisma.contactMessage.findUnique({ where: { id: contactId } });
  if (!msg) return false;

  const subject = contactEmailSubject(msg.name, msg.subject);
  const log = await prisma.emailLog.create({
    data: {
      kind: "CONTACT",
      toAddress: env.notifyEmail,
      subject,
      status: "PENDING",
      contactId: msg.id,
    },
  });

  const html = renderContactEmail({
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    submittedAt: msg.createdAt,
  });

  return deliver(log.id, { to: env.notifyEmail, subject, html, replyTo: msg.email });
}

/** Retry an existing failed/pending email log. */
export async function retryEmail(emailLogId: string): Promise<boolean> {
  const log = await prisma.emailLog.findUnique({
    where: { id: emailLogId },
    include: { application: { include: { job: true } }, contact: true },
  });
  if (!log) return false;

  let html = "";
  let replyTo: string | undefined;

  if (log.kind === "APPLICATION" && log.application) {
    const app = log.application;
    let resumeUrl = `${env.appUrl}/admin/applications/${app.id}`;
    try {
      const direct = await getResumeDownloadUrl(app.resumeKey);
      resumeUrl = direct.startsWith("http") ? direct : `${env.appUrl}${direct}`;
    } catch {
      /* keep fallback */
    }
    html = renderApplicationEmail({
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      linkedin: app.linkedin,
      position: app.position,
      experience: app.experience,
      skills: app.skills,
      employmentStatus: app.employmentStatus,
      expectedSalary: app.expectedSalary,
      noticePeriod: app.noticePeriod,
      coverLetter: app.coverLetter,
      jobTitle: app.job?.title ?? null,
      submittedAt: app.createdAt,
      resumeUrl,
      resumeFilename: app.resumeFilename,
    });
    replyTo = app.email;
  } else if (log.kind === "CONTACT" && log.contact) {
    const msg = log.contact;
    html = renderContactEmail({
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      submittedAt: msg.createdAt,
    });
    replyTo = msg.email;
  } else {
    return false;
  }

  return deliver(log.id, { to: log.toAddress, subject: log.subject, html, replyTo });
}

async function deliver(
  logId: string,
  input: { to: string; subject: string; html: string; replyTo?: string },
): Promise<boolean> {
  const result = await sendEmail(input);
  await prisma.emailLog.update({
    where: { id: logId },
    data: {
      status: result.ok ? "SENT" : "FAILED",
      attempts: { increment: 1 },
      lastError: result.ok ? null : result.error ?? "Unknown error",
      providerId: result.providerId ?? null,
    },
  });
  return result.ok;
}
