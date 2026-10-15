import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public job listing with search + filters.
 * Only PUBLISHED jobs are returned here.
 * Query params: q, location, type (EmploymentType), level (ExperienceLevel)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const location = searchParams.get("location")?.trim();
  const type = searchParams.get("type")?.trim();
  const level = searchParams.get("level")?.trim();

  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (type && type !== "ALL") {
    where.employmentType = type as Prisma.JobWhereInput["employmentType"];
  }
  if (level && level !== "ALL") {
    where.experienceLevel = level as Prisma.JobWhereInput["experienceLevel"];
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok({ jobs });
}
