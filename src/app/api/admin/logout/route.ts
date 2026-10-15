import { ok } from "@/lib/api";
import { destroySession, getSession, auditLog } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (session) {
    await auditLog({
      actorId: session.sub,
      action: "admin.logout",
      entityType: "Admin",
      entityId: session.sub,
    });
  }
  destroySession();
  return ok({ done: true });
}
