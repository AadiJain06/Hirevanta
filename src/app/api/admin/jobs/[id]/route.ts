import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin, auditLog } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function PUT(
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
    const data = jobSchema.parse(body);
    const existing = await prisma.job.findUnique({ where: { id: params.id } });
    if (!existing) return fail("Job not found.", 404);

    const job = await prisma.job.update({ where: { id: params.id }, data });
    await auditLog({
      actorId: admin.sub,
      action: "job.update",
      entityType: "Job",
      entityId: job.id,
    });
    return ok({ job });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return fail("Could not update job.", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const existing = await prisma.job.findUnique({ where: { id: params.id } });
  if (!existing) return fail("Job not found.", 404);

  await prisma.job.delete({ where: { id: params.id } });
  await auditLog({
    actorId: admin.sub,
    action: "job.delete",
    entityType: "Job",
    entityId: params.id,
  });
  return ok({ deleted: true });
}
