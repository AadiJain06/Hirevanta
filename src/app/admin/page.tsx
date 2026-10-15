import Link from "next/link";
import { Users, MessageSquare, Briefcase, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { APPLICATION_STATUS_LABELS, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [appCount, contactCount, jobCount, failedEmails, recent, byStatus] =
    await Promise.all([
      prisma.application.count(),
      prisma.contactMessage.count(),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.emailLog.count({ where: { status: "FAILED" } }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, position: true, status: true, createdAt: true },
      }),
      prisma.application.groupBy({ by: ["status"], _count: true }),
    ]);

  const stats = [
    { label: "Applications", value: appCount, icon: Users, href: "/admin/applications" },
    { label: "Contact Messages", value: contactCount, icon: MessageSquare, href: "/admin/contacts" },
    { label: "Published Jobs", value: jobCount, icon: Briefcase, href: "/admin/jobs" },
    { label: "Failed Emails", value: failedEmails, icon: AlertTriangle, href: "/admin/applications", warn: failedEmails > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">Snapshot of recruitment activity.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    s.warn ? "bg-rose-400/15 text-rose-400" : "bg-violetx/15 text-violetx-soft"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white">Recent applications</h2>
          <div className="mt-4 divide-y divide-white/5">
            {recent.length === 0 && (
              <p className="py-6 text-sm text-slate-500">No applications yet.</p>
            )}
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/admin/applications/${a.id}`}
                className="flex items-center justify-between py-3 transition hover:opacity-80"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{a.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{a.position}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">{APPLICATION_STATUS_LABELS[a.status]}</span>
                  <p className="text-[11px] text-slate-600">{formatDate(a.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white">By status</h2>
          <div className="mt-4 space-y-3">
            {Object.keys(APPLICATION_STATUS_LABELS).map((status) => {
              const found = byStatus.find((b) => b.status === status);
              const count = found?._count ?? 0;
              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{APPLICATION_STATUS_LABELS[status]}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
