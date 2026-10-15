import { NextRequest } from "next/server";
import { fail } from "@/lib/api";
import { requireAdmin, auditLog } from "@/lib/auth";
import { readResume } from "@/lib/storage";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Authenticated resume streaming (used for local storage provider and as a
 * fallback). Admin session required. Resumes are NEVER public.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return fail("Missing key.", 400);

  // Confirm the key belongs to a real application (prevents arbitrary reads).
  const app = await prisma.application.findFirst({
    where: { resumeKey: key },
    select: { id: true, resumeFilename: true, resumeMime: true },
  });
  if (!app) return fail("Resume not found.", 404);

  try {
    const bytes = await readResume(key);
    await auditLog({
      actorId: admin.sub,
      action: "resume.download",
      entityType: "Application",
      entityId: app.id,
    });
    const body = new Blob([bytes as unknown as BlobPart], { type: app.resumeMime });
    return new Response(body, {
      headers: {
        "Content-Type": app.resumeMime,
        "Content-Disposition": `attachment; filename="${app.resumeFilename.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return fail("Could not read the resume file.", 500);
  }
}
