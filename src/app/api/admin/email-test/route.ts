import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Admin-only email diagnostic. Sends a single test message using the current
 * provider config and returns the exact result (including SMTP error detail).
 * Visit /api/admin/email-test while logged in as admin.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const result = await sendEmail({
    to: env.notifyEmail,
    subject: "HireVanta — SMTP test email",
    html: `<p>This is a HireVanta configuration test. If you can read this, email delivery is working.</p>
           <p>Provider: <strong>${env.emailProvider}</strong><br/>From: ${env.emailFrom}<br/>To: ${env.notifyEmail}</p>`,
  });

  return ok({
    provider: env.emailProvider,
    from: env.emailFrom,
    to: env.notifyEmail,
    smtpHost: env.emailProvider === "smtp" ? env.smtp.host : undefined,
    smtpPort: env.emailProvider === "smtp" ? env.smtp.port : undefined,
    smtpSecure: env.emailProvider === "smtp" ? env.smtp.secure : undefined,
    smtpUser: env.emailProvider === "smtp" ? env.smtp.user : undefined,
    result,
  });
}
