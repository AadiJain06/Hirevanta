import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin, auditLog } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return ok({ jobs });
}

export async function POST(req: NextRequest) {
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
    const job = await prisma.job.create({ data: { ...data, isSample: false } });
    await auditLog({
      actorId: admin.sub,
      action: "job.create",
      entityType: "Job",
      entityId: job.id,
    });
    return ok({ job });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return fail("Could not create job.", 500);
  }
}
