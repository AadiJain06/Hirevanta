/**
 * Centralized environment access with safe defaults.
 * Secrets are only ever read on the server. Never import this into client components.
 */

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function bool(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",

  // Auth
  authSecret: process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me",
  authSessionTtl: num(process.env.AUTH_SESSION_TTL, 60 * 60 * 8),

  // Email
  emailProvider: (process.env.EMAIL_PROVIDER ?? "console") as
    | "resend"
    | "smtp"
    | "console",
  notifyEmail: process.env.NOTIFY_EMAIL ?? "hirevanta0@gmail.com",
  emailFrom: process.env.EMAIL_FROM ?? "HireVanta <no-reply@hirevanta.com>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: num(process.env.SMTP_PORT, 465),
    secure: bool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
  },

  // Storage
  storageProvider: (process.env.STORAGE_PROVIDER ?? "local") as "local" | "s3",
  s3: {
    region: process.env.S3_REGION ?? "us-east-1",
    bucket: process.env.S3_BUCKET ?? "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: bool(process.env.S3_FORCE_PATH_STYLE, false),
    signedUrlTtl: num(process.env.S3_SIGNED_URL_TTL, 900),
  },

  // Uploads
  maxUploadBytes: num(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),

  // Rate limiting
  rateLimitMax: num(process.env.RATE_LIMIT_MAX, 5),
  rateLimitWindow: num(process.env.RATE_LIMIT_WINDOW, 600),
};

export const ALLOWED_RESUME_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc (some browsers report .docx as this)
] as const;

export const ALLOWED_RESUME_EXT = [".pdf", ".docx", ".doc"] as const;
