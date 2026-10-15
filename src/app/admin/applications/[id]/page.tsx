import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Linkedin, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ApplicationControls } from "@/components/admin/ApplicationControls";

export const dynamic = "force-dynamic";

export default async function ApplicationDetail({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin(); // middleware guards too; this is defense-in-depth
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      job: { select: { title: true, company: true } },
      emailLogs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!app) notFound();

  const latestEmail = app.emailLogs[0] ?? null;

  const details: Array<[string, string | null]> = [
    ["Experience", app.experience],
    ["Employment status", app.employmentStatus],
    ["Expected salary", app.expectedSalary],
    ["Notice / availability", app.noticePeriod],
  ];

  return (
    <div>
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h1 className="text-2xl font-extrabold text-white">{app.fullName}</h1>
            <p className="mt-1 text-sm text-violetx-soft">{app.position}</p>
            {app.job && (
              <p className="mt-1 text-xs text-slate-500">
                Linked job: {app.job.title} · {app.job.company}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Info icon={Mail} label="Email" value={app.email} href={`mailto:${app.email}`} />
              <Info icon={Phone} label="Phone" value={app.phone} />
              <Info icon={MapPin} label="Location" value={app.location} />
              {app.linkedin && <Info icon={Linkedin} label="LinkedIn" value={app.linkedin} href={app.linkedin} />}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key skills</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{app.skills}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {details.map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-0.5 text-sm text-slate-200">{value}</p>
                  </div>
                ) : null,
              )}
            </div>

            {app.coverLetter && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Cover letter</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{app.coverLetter}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Résumé</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violetx/15 text-violetx-soft">
                <FileText className="h-5 w-5" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-slate-300" title={app.resumeUrl}>
                {app.resumeUrl}
              </p>
            </div>
            <a
              href={app.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
            >
              <ExternalLink className="h-4 w-4" />
              Open résumé link
            </a>
            <p className="mt-2 text-[11px] text-slate-600">
              Candidate-provided link. Verify its sharing permissions before relying on it.
            </p>
          </div>

          <ApplicationControls
            applicationId={app.id}
            currentStatus={app.status}
            submittedAt={formatDate(app.createdAt)}
            latestEmail={
              latestEmail
                ? {
                    id: latestEmail.id,
                    status: latestEmail.status,
                    attempts: latestEmail.attempts,
                    lastError: latestEmail.lastError,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-violetx-soft" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="transition hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
