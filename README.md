# HireVanta — Recruitment & Talent Acquisition Platform

A production-ready recruitment agency website with a premium, futuristic UI and genuinely functional hiring workflows: job listings, a multi-step candidate application with secure résumé upload, employer inquiries, transactional email notifications, a protected admin dashboard, and persistent storage.

Built with **Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · Prisma (PostgreSQL) · Zod · Resend/SMTP · S3-compatible storage**.

All applications and inquiries are delivered to **hirevanta0@gmail.com** (configurable via `NOTIFY_EMAIL`).

---

## Features

- **Immersive marketing site** — animated hero with a talent-network visualization, glassmorphism, gradient orbs, scroll-reveal animations, custom cursor (desktop), toast notifications, back-to-top, and a page-load transition. Respects `prefers-reduced-motion`.
- **Job listings** — search + filters (location, employment type, experience level), responsive cards, details modal, loading/empty/error states. Ships with clearly flagged **sample** data.
- **Multi-step application form** — personal → professional → résumé → review, with inline validation, drag-and-drop upload, progress bar, and an animated success screen.
- **Secure résumé upload** — PDF/DOCX only, size limit, extension + MIME + **magic-byte signature** checks on the server. Files go to **private** storage; links are access-controlled and time-limited.
- **Email notifications** — professional HTML templates, provider-agnostic (Resend / SMTP / console), with **delivery status tracked in the DB** and an admin **retry** path. Failed sends never lose the submission.
- **Employer inquiry form** — saved first, then notified; confirmation only after persistence.
- **Admin dashboard** — JWT-cookie auth, applications list/detail, status workflow, résumé download, employer inquiries, job CRUD/publish, failed-email retry, CSV export, and audit logging. Protected by middleware **and** per-route server checks.
- **Security** — server-side validation, honeypot + rate limiting, hashed IPs, duplicate-submission protection, CSRF-resistant same-site cookies, XSS-safe email rendering, parameterized queries via Prisma, and security headers.
- **SEO** — metadata, Open Graph image, sitemap, robots, favicon, and Organization structured data.
- **Tests** — Vitest coverage for validation, file validation, email templating/escaping, request hashing, and auth primitives.

---

## Prerequisites

- **Node.js 18.18+** (or 20+)
- **PostgreSQL 13+** (local or hosted — e.g. Neon, Supabase, RDS)
- Optional for production email/storage: a Resend or SMTP account, and an S3-compatible bucket.

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Create your env file from the template
cp .env.example .env
#   (Windows PowerShell: Copy-Item .env.example .env)

# 3. Fill in DATABASE_URL (and optionally email/storage) in .env

# 4. Apply the database schema
npm run prisma:migrate      # creates tables (dev)
#   or, against an existing DB:  npm run prisma:deploy

# 5. Seed the admin account + sample jobs
npm run db:seed

# 6. Start the dev server
npm run dev
```

Visit **http://localhost:3000** for the site and **http://localhost:3000/admin** for the dashboard.

With the default `EMAIL_PROVIDER=console` and `STORAGE_PROVIDER=local`, the full flow works end-to-end locally with **no external accounts** — emails are logged to the server console and résumés are stored under `./.storage`.

---

## Environment variables

Copy `.env.example` to `.env` and fill in real values. Summary:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | Public base URL (links in emails, OG, sitemap). |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `AUTH_SECRET` | yes | Long random string signing admin session JWTs. |
| `AUTH_SESSION_TTL` | no | Session lifetime in seconds (default 8h). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | yes (seed) | Initial admin account created by `db:seed`. |
| `EMAIL_PROVIDER` | yes | `resend` \| `smtp` \| `console`. |
| `NOTIFY_EMAIL` | yes | Recipient of all applications/inquiries (`hirevanta0@gmail.com`). |
| `EMAIL_FROM` | yes (resend/smtp) | Verified sender address. |
| `RESEND_API_KEY` | if resend | Resend API key. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` | if smtp | SMTP credentials. For Gmail use an **App Password**. |
| `STORAGE_PROVIDER` | yes | `local` \| `s3`. |
| `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | if s3 | S3-compatible storage. |
| `S3_ENDPOINT` / `S3_FORCE_PATH_STYLE` | no | For R2 / MinIO / B2. |
| `S3_SIGNED_URL_TTL` | no | Résumé link lifetime in seconds (default 900). |
| `MAX_UPLOAD_BYTES` | no | Max résumé size (default 5 MB). |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` | no | Public form rate limiting. |

**Never commit `.env`.** No secret is ever referenced from client code — all secrets are read server-side only (`src/lib/env.ts`).

---

## Email configuration

Pick a provider via `EMAIL_PROVIDER`:

- **`console`** (default) — logs a one-line notice to the server console. Great for local dev; no credentials needed. Full HTML bodies are **not** logged (avoids PII leakage).
- **`resend`** — set `RESEND_API_KEY` and a verified `EMAIL_FROM`. See https://resend.com.
- **`smtp`** — set `SMTP_*`. For **Gmail**, enable 2FA and create an **App Password** (not your account password); use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`.

Every application/inquiry creates an `EmailLog` row with status `PENDING → SENT/FAILED`. Failed notifications can be retried from the admin UI (application detail or inquiry row). The submission itself is always persisted first, so email failures never lose data.

Application email subject format: `New HireVanta Application — [Candidate Name] — [Position]`.

---

## Storage configuration

- **`local`** (default) — résumés saved under `./.storage` (gitignored). Served only through the authenticated admin route `/api/admin/resumes`. Never public.
- **`s3`** — any S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, Backblaze B2). Objects are **private**; the admin dashboard and email links use short-lived presigned URLs.

Only the storage **key** is stored in the database — never a public URL.

---

## Database

Prisma schema lives in `prisma/schema.prisma`. Models: `Admin`, `Job`, `Application`, `EmployerInquiry`, `EmailLog`, `AuditLog`, `RateLimit`.

```bash
npm run prisma:migrate     # create/apply a dev migration
npm run prisma:deploy      # apply migrations in CI/production
npm run prisma:generate    # regenerate the client
npm run prisma:studio      # browse data in Prisma Studio
npm run db:seed            # seed admin + sample jobs
```

Sample jobs are flagged `isSample = true` and labeled **Sample** in the UI — they are demo data, not genuine vacancies. Admins add real vacancies via **Admin → Job Listings**.

---

## Admin dashboard

- URL: `/admin` (redirects to `/admin/login` when unauthenticated).
- Sign in with the seeded `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Access control is enforced by **`src/middleware.ts`** (edge JWT check) **and** by `requireAdmin()` inside every admin API route — the dashboard is not merely hidden by URL.
- Capabilities: review applications, filter/search, change status (New → Under Review → Shortlisted → Interview → Hired → Rejected), download résumés via time-limited links, view employer inquiries, manage/publish job listings, retry failed emails, and export applications to CSV. Sensitive actions are written to `AuditLog`.

---

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers: Zod validation schemas, résumé file validation (size/extension/MIME/magic-byte), email subject/HTML templating and XSS escaping, request IP hashing + dedupe determinism, and auth primitives (bcrypt verification, JWT sign/verify + tamper rejection).

---

## Build & run (production)

```bash
npm run build       # prisma generate + next build
npm run start       # start the production server
```

Also available: `npm run lint` and `npm run typecheck`.

---

## Deployment

1. Provision a PostgreSQL database and set `DATABASE_URL`.
2. Set all required env vars on your host (see table above). Set `NEXT_PUBLIC_APP_URL` to your real domain and a strong `AUTH_SECRET`.
3. Choose production `EMAIL_PROVIDER` (`resend` or `smtp`) and `STORAGE_PROVIDER=s3`.
4. Run migrations during release: `npm run prisma:deploy`.
5. Seed the first admin once: `npm run db:seed` (or create the admin manually).
6. Build and start: `npm run build && npm run start`.

**On Vercel:** add the env vars in Project Settings, set the build command to `prisma generate && next build` (already the default `build` script), and run `prisma migrate deploy` as a release step. Use a managed Postgres (Neon/Supabase) and S3-compatible storage; the `console` email/`local` storage providers are for local development only.

---

## External services that still need credentials

The app runs fully locally with no external accounts. For real email delivery and durable résumé storage in production, provide:

- **Email:** a Resend API key **or** SMTP credentials (e.g. a Gmail App Password).
- **Storage:** an S3-compatible bucket + access keys.
- **Database:** a PostgreSQL instance.

Until these are configured, the app transparently falls back to console email + local file storage.

---

## Project structure

```
prisma/            Prisma schema + seed
src/
  app/             App Router pages, API routes, SEO (sitemap/robots/og/icon)
    api/           Public + admin API endpoints
    admin/         Protected dashboard pages
  components/
    site/          Public marketing sections
    admin/         Dashboard UI
    ui/            Reusable primitives (Button, Modal, Toast, Reveal, …)
    brand/         Logo
  lib/             env, db, auth, validation, email, storage, rate-limit, utils
  middleware.ts    Admin route protection
tests/             Vitest suites
```

---

## Notes on integrity

This project avoids fabricated claims: no invented testimonials, client logos, placement figures, founding story, team members, or social profiles. Sample jobs are explicitly labeled. Add real metrics, listings, and social links only when genuine.
