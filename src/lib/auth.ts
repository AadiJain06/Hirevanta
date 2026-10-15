import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { env } from "./env";

const COOKIE_NAME = "hv_session";
const secret = new TextEncoder().encode(env.authSecret);

export interface SessionPayload {
  sub: string; // admin id
  email: string;
  role: string;
  name: string;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.authSessionTtl}s`)
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.authSessionTtl,
  });
}

export function destroySession(): void {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Returns the active session payload or null. Verifies the JWT signature. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: String(payload.role),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

/**
 * Server-side guard. Confirms the session AND that the admin still exists.
 * Throize-style: returns the admin or null (callers decide the response).
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  const admin = await prisma.admin.findUnique({ where: { id: session.sub } });
  if (!admin) return null;
  return session;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<SessionPayload | null> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    // Constant-time-ish: still run a hash compare against a dummy to reduce timing leaks.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return null;
  }
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return null;
  return { sub: admin.id, email: admin.email, role: admin.role, name: admin.name };
}

export async function auditLog(opts: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId ?? null,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId ?? null,
        metadata: opts.metadata as object | undefined,
      },
    });
  } catch {
    // Audit logging must never break the primary flow.
  }
}
