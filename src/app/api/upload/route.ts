import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { validateResume, humanFileSize } from "@/lib/file-validation";
import { putResume } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/request";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Secure resume upload.
 * Returns a storage KEY (never a public URL). The key is later submitted with
 * the application form. Validates size, extension, MIME, and magic bytes.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`upload:${hashIp(ip)}`, { max: env.rateLimitMax * 3 });
  if (!rl.allowed) {
    return fail("Too many uploads. Please try again later.", 429, {
      retryAfter: rl.retryAfter,
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Invalid upload payload.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("No file was provided.", 400);
  }

  if (file.size > env.maxUploadBytes) {
    return fail(
      `File is too large (${humanFileSize(file.size)}). Max ${humanFileSize(env.maxUploadBytes)}.`,
      413,
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const result = validateResume({
    filename: file.name,
    mime: file.type,
    size: file.size,
    buffer,
  });

  if (!result.ok) {
    return fail(result.error, 422);
  }

  try {
    const stored = await putResume({
      filename: file.name,
      mime: result.mime,
      body: buffer,
    });
    return ok({
      key: stored.key,
      filename: file.name,
      mime: result.mime,
      size: file.size,
    });
  } catch (err) {
    console.error("[upload] storage error:", err instanceof Error ? err.message : err);
    return fail("We couldn't store your file. Please try again.", 500);
  }
}
