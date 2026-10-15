import { NextRequest } from "next/server";
import { ok, fail, fromZodError } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { authenticate, createSession, auditLog } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Stricter limit on auth to slow brute force.
  const rl = await rateLimit(`login:${hashIp(ip)}`, { max: 8, windowSeconds: 600 });
  if (!rl.allowed) {
    return fail("Too many login attempts. Please try again later.", 429, {
      retryAfter: rl.retryAfter,
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  try {
    const { email, password } = loginSchema.parse(body);
    const session = await authenticate(email, password);
    if (!session) {
      return fail("Invalid email or password.", 401);
    }
    await createSession(session);
    await auditLog({
      actorId: session.sub,
      action: "admin.login",
      entityType: "Admin",
      entityId: session.sub,
    });
    return ok({ name: session.name, email: session.email, role: session.role });
  } catch (err) {
    if (err instanceof ZodError) return fromZodError(err);
    return fail("Login failed.", 500);
  }
}
