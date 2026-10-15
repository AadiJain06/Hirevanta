import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireAdmin, auditLog } from "@/lib/auth";
import { contactStatusSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

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
    const { status } = contactStatusSchema.parse(body);
    const existing = await prisma.contactMessage.findUnique({ where: { id: params.id } });
    if (!existing) return fail("Message not found.", 404);

    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status },
    });

    await auditLog({
      actorId: admin.sub,
      action: "contact.status_change",
      entityType: "ContactMessage",
      entityId: updated.id,
      metadata: { from: existing.status, to: status },
    });

    return ok({ contact: updated });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return fail("Could not update status.", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.", 401);

  const existing = await prisma.contactMessage.findUnique({ where: { id: params.id } });
  if (!existing) return fail("Message not found.", 404);

  await prisma.contactMessage.delete({ where: { id: params.id } });
  await auditLog({
    actorId: admin.sub,
    action: "contact.delete",
    entityType: "ContactMessage",
    entityId: params.id,
  });
  return ok({ deleted: true });
}
