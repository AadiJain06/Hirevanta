import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "./env";

/**
 * Secure resume storage.
 *
 * - "local": files under ./.storage (dev only, never served statically).
 * - "s3": S3-compatible bucket; downloads use short-lived presigned URLs.
 *
 * The storage KEY is the only thing persisted in the DB. Resumes are never
 * exposed via a public URL — admins fetch them through authenticated,
 * time-limited links.
 */

export interface StoredFile {
  key: string;
}

const LOCAL_ROOT = path.join(process.cwd(), ".storage");

function buildKey(filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const now = new Date();
  const prefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `resumes/${prefix}/${randomUUID()}-${safe}`;
}

export async function putResume(opts: {
  filename: string;
  mime: string;
  body: Uint8Array;
}): Promise<StoredFile> {
  const key = buildKey(opts.filename);

  if (env.storageProvider === "s3") {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = s3Client(S3Client);
    await client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
        Body: opts.body,
        ContentType: opts.mime,
        // Private by default; never ACL public.
      }),
    );
    return { key };
  }

  // local
  const full = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, opts.body);
  return { key };
}

/**
 * Produce a link that lets an authorized admin download the resume.
 * - S3: short-lived presigned GET URL.
 * - local: an app route guarded by admin auth (/admin API).
 */
export async function getResumeDownloadUrl(key: string): Promise<string> {
  if (env.storageProvider === "s3") {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = s3Client(S3Client);
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }),
      { expiresIn: env.s3.signedUrlTtl },
    );
  }
  // Local files are streamed via an authenticated admin route.
  return `/api/admin/resumes?key=${encodeURIComponent(key)}`;
}

export async function readResume(key: string): Promise<Uint8Array> {
  if (env.storageProvider === "s3") {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = s3Client(S3Client);
    const res = await client.send(
      new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }),
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) throw new Error("Resume not found in storage.");
    return bytes;
  }
  const full = path.join(LOCAL_ROOT, key);
  // Guard against path traversal.
  if (!full.startsWith(LOCAL_ROOT)) throw new Error("Invalid storage key.");
  return fs.readFile(full);
}

function s3Client<T>(S3Client: new (config: {
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  credentials: { accessKeyId: string; secretAccessKey: string };
}) => T): T {
  return new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: {
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
    },
  });
}
