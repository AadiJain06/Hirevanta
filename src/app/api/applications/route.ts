import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { applicationSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp, dedupeHash } from "@/lib/request";
import { notifyApplication } from "@/lib/notifications";
import { ZodError } from "zod";

export const runtime = "nodejs";

/**
 * Accepts a candidate application.
 * Flow: validate → dedupe → persist (DB) → send notification email (logged).
 * Email failure does NOT lose the application; it stays retryable in EmailLog.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`application:${hashIp(ip)}`);
  if (!rl.allowed) {
    return fail("You've submitted several times recently. Please try again later.", 429, {
      retryAfter: rl.retryAfter,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  try {
    const data = applicationSchema.parse(body);

    // Honeypot: silently accept but drop obvious bots.
    if (data.website && data.website.length > 0) {
      return ok({ id: "ignored" });
    }

    const dedupe = dedupeHash([data.email, data.position, data.resumeKey]);

    const existing = await prisma.application.findUnique({
      where: { dedupeHash: dedupe },
    });
    if (existing) {
      return ok({ id: existing.id, duplicate: true });
    }

    const jobId = data.jobId && data.jobId.length > 0 ? data.jobId : null;

    const application = await prisma.application.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        linkedin: data.linkedin || null,
        position: data.position,
        experience: data.experience,
        skills: data.skills,
        employmentStatus: data.employmentStatus || null,
        expectedSalary: data.expectedSalary || null,
        noticePeriod: data.noticePeriod || null,
        coverLetter: data.coverLetter || null,
        consent: data.consent,
        resumeKey: data.resumeKey,
        resumeFilename: data.resumeFilename,
        resumeMime: data.resumeMime,
        resumeSize: data.resumeSize,
        jobId,
        ipHash: hashIp(ip),
        dedupeHash: dedupe,
      },
    });

    // Fire notification (awaited so delivery status is recorded; still
    // non-fatal because notifyApplication swallows send errors into EmailLog).
    await notifyApplication(application.id).catch((e) =>
      console.error("[applications] notify error:", e),
    );

    return ok({ id: application.id });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    console.error("[applications] error:", err instanceof Error ? err.message : err);
    return fail("Something went wrong submitting your application.", 500);
  }
}
