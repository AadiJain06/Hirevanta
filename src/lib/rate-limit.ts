import { prisma } from "./db";
import { env } from "./env";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

/**
 * Simple DB-backed fixed-window rate limiter.
 * Keyed per action + identifier (usually a hashed IP). Good enough for form
 * spam protection without extra infrastructure; swap for Redis at higher scale.
 */
export async function rateLimit(
  key: string,
  opts?: { max?: number; windowSeconds?: number },
): Promise<RateLimitResult> {
  const max = opts?.max ?? env.rateLimitMax;
  const windowSeconds = opts?.windowSeconds ?? env.rateLimitWindow;
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: 1, expiresAt },
    });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (existing.count >= max) {
    const retryAfter = Math.max(
      1,
      Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfter };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true, remaining: max - existing.count - 1, retryAfter: 0 };
}
