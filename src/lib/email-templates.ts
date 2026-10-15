/**
 * Professionally designed HTML email templates.
 * Inline styles only — email clients ignore external/embedded CSS.
 * All dynamic values are HTML-escaped to prevent injection into the markup.
 */

export function escapeHtml(input: string | number | null | undefined): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRAND = "#7c3aed";
const BG = "#05060f";
const CARD = "#0d1024";
const TEXT = "#e5e7eb";
const MUTED = "#9ca3af";

function shell(title: string, bodyRows: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr><td style="padding:0 24px 20px;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Hire<span style="color:${BRAND};">Vanta</span>
            </span>
          </td></tr>
          <tr><td style="background:${CARD};border:1px solid rgba(148,163,184,0.14);border-radius:16px;padding:28px 28px 8px;">
            <h1 style="margin:0 0 6px;font-size:20px;color:#ffffff;">${escapeHtml(title)}</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              ${bodyRows}
            </table>
          </td></tr>
          <tr><td style="padding:18px 24px;color:${MUTED};font-size:12px;line-height:18px;">
            This is an automated notification from the HireVanta website.
            Please handle candidate and employer data in line with your privacy policy.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string, opts: { pre?: boolean } = {}): string {
  if (!value) return "";
  const val = opts.pre
    ? `<div style="white-space:pre-wrap;color:${TEXT};">${escapeHtml(value)}</div>`
    : `<span style="color:${TEXT};">${escapeHtml(value)}</span>`;
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid rgba(148,163,184,0.1);vertical-align:top;width:170px;color:${MUTED};font-size:13px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;border-bottom:1px solid rgba(148,163,184,0.1);font-size:14px;">${val}</td>
  </tr>`;
}

export interface ApplicationEmailData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string | null;
  position: string;
  experience: string;
  skills: string;
  employmentStatus?: string | null;
  expectedSalary?: string | null;
  noticePeriod?: string | null;
  coverLetter?: string | null;
  jobTitle?: string | null;
  submittedAt: Date;
  resumeUrl: string;
  resumeFilename: string;
}

export function applicationEmailSubject(name: string, position: string): string {
  return `New HireVanta Application — ${name} — ${position}`;
}

export function renderApplicationEmail(d: ApplicationEmailData): string {
  const rows = [
    row("Candidate", d.fullName),
    row("Email", d.email),
    row("Phone", d.phone),
    row("Location", d.location),
    row("LinkedIn", d.linkedin ?? ""),
    row("Position", d.position),
    row("Linked job", d.jobTitle ?? ""),
    row("Experience", d.experience),
    row("Key skills", d.skills, { pre: true }),
    row("Employment status", d.employmentStatus ?? ""),
    row("Expected salary", d.expectedSalary ?? ""),
    row("Notice / availability", d.noticePeriod ?? ""),
    row("Cover letter", d.coverLetter ?? "", { pre: true }),
    row("Submitted", d.submittedAt.toUTCString()),
  ].join("");

  const resumeBtn = `<tr><td colspan="2" style="padding:18px 0 6px;">
    <a href="${escapeHtml(d.resumeUrl)}"
       style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">
       Download résumé (${escapeHtml(d.resumeFilename)})
    </a>
    <div style="color:${MUTED};font-size:12px;margin-top:8px;">
      This link is access-controlled and may expire for security.
    </div>
  </td></tr>`;

  return shell("New candidate application", rows + resumeBtn);
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  submittedAt: Date;
}

export function contactEmailSubject(name: string, subject?: string | null): string {
  const topic = subject && subject.trim().length > 0 ? subject.trim() : "General enquiry";
  return `New HireVanta Contact Message — ${name} — ${topic}`;
}

export function renderContactEmail(d: ContactEmailData): string {
  const rows = [
    row("Name", d.name),
    row("Email", d.email),
    row("Subject", d.subject ?? ""),
    row("Message", d.message, { pre: true }),
    row("Submitted", d.submittedAt.toUTCString()),
  ].join("");
  return shell("New contact message", rows);
}
