import { fail } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin, auditLog } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export applications as CSV (authorized admins only). Excludes resume bytes. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const apps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: { select: { title: true } } },
  });

  const headers = [
    "id",
    "createdAt",
    "fullName",
    "email",
    "phone",
    "location",
    "position",
    "linkedJob",
    "experience",
    "skills",
    "status",
    "resumeUrl",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = apps.map((a) =>
    [
      a.id,
      a.createdAt.toISOString(),
      a.fullName,
      a.email,
      a.phone,
      a.location,
      a.position,
      a.job?.title ?? "",
      a.experience,
      a.skills,
      a.status,
      a.resumeUrl,
    ]
      .map(escape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  await auditLog({
    actorId: admin.sub,
    action: "applications.export",
    entityType: "Application",
    metadata: { count: apps.length },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hirevanta-applications-${Date.now()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
