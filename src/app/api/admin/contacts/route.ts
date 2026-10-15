import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();

  const where: Prisma.ContactMessageWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status && status !== "ALL") {
    where.status = status as Prisma.ContactMessageWhereInput["status"];
  }

  const contacts = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      emailLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, attempts: true, lastError: true },
      },
    },
  });

  return ok({ contacts });
}
