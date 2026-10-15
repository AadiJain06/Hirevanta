import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { requireAdmin, auditLog } from "@/lib/auth";
import { retryEmail } from "@/lib/notifications";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** Retry a failed/pending email notification by EmailLog id. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  let body: { emailLogId?: string };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  if (!body.emailLogId) return fail("emailLogId is required.", 400);

  const log = await prisma.emailLog.findUnique({ where: { id: body.emailLogId } });
  if (!log) return fail("Email log not found.", 404);

  const success = await retryEmail(body.emailLogId);
  await auditLog({
    actorId: admin.sub,
    action: "email.retry",
    entityType: "EmailLog",
    entityId: body.emailLogId,
    metadata: { success },
  });

  if (!success) return fail("Retry failed. The email provider rejected the message.", 502);
  return ok({ retried: true });
}
