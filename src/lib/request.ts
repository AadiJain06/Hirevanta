import { createHash } from "node:crypto";

/** Extract a best-effort client IP from request headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "0.0.0.0"
  );
}

/** One-way hash of an IP so we never store raw addresses (data minimization). */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/** Stable dedupe hash to protect against accidental duplicate submissions. */
export function dedupeHash(parts: Array<string | number | null | undefined>): string {
  return createHash("sha256")
    .update(parts.map((p) => String(p ?? "")).join("|").toLowerCase())
    .digest("hex");
}
