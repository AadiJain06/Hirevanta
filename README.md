# HireVanta — Recruitment & Talent Acquisition Platform

A production-ready recruitment agency website with a premium, futuristic UI and genuinely functional hiring workflows: job listings, a multi-step candidate application with a résumé link (Google Drive / Dropbox / etc.), a contact form, transactional email notifications, a protected admin dashboard, and database persistence.

Built with **Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion · Prisma (PostgreSQL) · Zod · Resend/SMTP**.

All applications and contact messages are delivered to **hirevanta0@gmail.com** (configurable via `NOTIFY_EMAIL`).

---

## Features

- **Immersive marketing site** — animated hero with a talent-network visualization, glassmorphism, gradient orbs, scroll-reveal animations, custom cursor (desktop), toast notifications, back-to-top, and a page-load transition. Respects `prefers-reduced-motion`.
- **Job listings** — search + filters (location, employment type, experience level), responsive cards, details modal, loading/empty/error states. Ships with clearly flagged **sample** data.
- **Multi-step application form** — personal → professional → résumé → review, with inline validation, a progress bar, and an animated success screen.
- **Résumé link** — candidates submit a shareable URL (Google Drive, Dropbox, OneDrive, or a direct PDF). Validated as a proper URL; no file storage needed.
- **Email notifications** — professional HTML templates, provider-agnostic (Resend / SMTP / console), with **delivery status tracked in the DB** and an admin **retry** path. Failed sends never lose the submission.
- **Contact form** — saved first, then notified; confirmation only after persistence.
- **Admin dashboard** — JWT-cookie auth, applications list/detail, status workflow, résumé link, contact messages, job CRUD/publish, failed-email retry, CSV export, and audit logging. Protected by middleware **and** per-route server checks.
- **Security** — server-side validation, honeypot + rate limiting, hashed IPs, duplicate-submission protection, CSRF-resistant same-site cookies, XSS-safe email rendering, parameterized queries via Prisma, and security headers.
- **SEO** — metadata, Open Graph image, sitemap, robots, favicon, and Organization structured data.
- **Tests** — Vitest coverage for validation, file validation, email templating/escaping, request hashing, and auth primitives.

---

## Prerequisites

- **Node.js 18.18+** (or 20+)
- **PostgreSQL 13+** (local or hosted — e.g. Neon, Supabase, RDS)
- Optional for production email: a Resend or SMTP account. No file storage is needed (résumés are links).

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Create your env file from the template
cp .env.example .env
#   (Windows PowerShell: Copy-Item .env.example .env)

# 3. Fill in DATABASE_URL (and optionally email) in .env

# 4. Apply the database schema
npm run prisma:migrate      # creates tables (dev)
#   or, against an existing DB:  npm run prisma:deploy

# 5. Seed the admin account + sample jobs
npm run db:seed

# 6. Start the dev server
npm run dev
```

Visit **http://localhost:3000** for the site and **http://localhost:3000/admin** for the dashboard.

With the default `EMAIL_PROVIDER=console`, the full flow works end-to-end locally with **no external accounts** — emails are logged to the server console, and résumés are just links candidates paste in.

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

## Résumés

Candidates submit a **shareable résumé link** (Google Drive, Dropbox, OneDrive, or a direct PDF URL) rather than uploading a file. The link is validated as a proper URL, stored on the application record, shown in the admin dashboard, and included in the notification email. There is **no file storage to configure** — this keeps hosting (e.g. Netlify) simple since the serverless filesystem is ephemeral.

Admins should treat résumé links as candidate-provided and verify sharing permissions before relying on them.

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
- Capabilities: review applications, filter/search, change status (New → Under Review → Shortlisted → Interview → Hired → Rejected), open the candidate's résumé link, view contact messages, manage/publish job listings, retry failed emails, and export applications to CSV. Sensitive actions are written to `AuditLog`.

---

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers: Zod validation schemas (including résumé-link URL validation), email subject/HTML templating and XSS escaping, request IP hashing + dedupe determinism, and auth primitives (bcrypt verification, JWT sign/verify + tamper rejection).

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
3. Choose production `EMAIL_PROVIDER` (`resend` or `smtp`). No storage config needed.
4. Run migrations during release: `npm run prisma:deploy`.
5. Seed the first admin once: `npm run db:seed` (or create the admin manually).
6. Build and start: `npm run build && npm run start`.

**On Netlify:** the included `netlify.toml` sets the build command (`prisma generate && prisma migrate deploy && next build`) and the official `@netlify/plugin-nextjs`. Add the env vars in Site configuration → Environment variables, connect the Git repo, and deploy. Use a managed Postgres (Neon/Supabase). Because résumés are links, there's **no object storage to set up** — a good fit for Netlify's ephemeral filesystem. The same approach works on Vercel.

---

## External services that still need credentials

The app runs fully locally with no external accounts. For production, provide:

- **Email:** a Resend API key **or** SMTP credentials (e.g. a Gmail App Password).
- **Database:** a PostgreSQL instance.

No file storage is required — résumés are candidate-provided links. Until email is configured, the app falls back to the `console` provider (logs to the server console).

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
  lib/             env, db, auth, validation, email, notifications, rate-limit, utils
  middleware.ts    Admin route protection
tests/             Vitest suites
```

---

## Notes on integrity

This project avoids fabricated claims: no invented testimonials, client logos, placement figures, founding story, team members, or social profiles. Sample jobs are explicitly labeled. Add real metrics, listings, and social links only when genuine.
