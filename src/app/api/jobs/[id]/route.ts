import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job || job.status !== "PUBLISHED") {
    return fail("Job not found.", 404);
  }
  return ok({ job });
}
