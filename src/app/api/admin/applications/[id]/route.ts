import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin, auditLog } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validation";
import { getResumeDownloadUrl } from "@/lib/storage";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      job: { select: { title: true, company: true } },
      emailLogs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!application) return fail("Application not found.", 404);

  // Generate a fresh, time-limited resume link for the admin.
  let resumeUrl: string | null = null;
  try {
    resumeUrl = await getResumeDownloadUrl(application.resumeKey);
  } catch {
    resumeUrl = null;
  }

  await auditLog({
    actorId: admin.sub,
    action: "application.view",
    entityType: "Application",
    entityId: application.id,
  });

  return ok({ application, resumeUrl });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  try {
    const { status } = applicationStatusSchema.parse(body);
    const existing = await prisma.application.findUnique({ where: { id: params.id } });
    if (!existing) return fail("Application not found.", 404);

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    });

    await auditLog({
      actorId: admin.sub,
      action: "application.status_change",
      entityType: "Application",
      entityId: updated.id,
      metadata: { from: existing.status, to: status },
    });

    return ok({ application: updated });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return fail("Could not update status.", 500);
  }
}
