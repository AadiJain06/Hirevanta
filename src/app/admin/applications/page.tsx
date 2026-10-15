"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Download, Loader2, Mail, MailWarning } from "lucide-react";
import { APPLICATION_STATUS_LABELS, formatDate } from "@/lib/utils";

interface Row {
  id: string;
  fullName: string;
  email: string;
  position: string;
  location: string;
  status: string;
  createdAt: string;
  job: { title: string } | null;
  emailLogs: { id: string; status: string; attempts: number; lastError: string | null }[];
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sky-400/15 text-sky-300",
  UNDER_REVIEW: "bg-amber-400/15 text-amber-300",
  SHORTLISTED: "bg-violet-400/15 text-violet-300",
  INTERVIEW: "bg-cyan-400/15 text-cyan-300",
  HIRED: "bg-emerald-400/15 text-emerald-300",
  REJECTED: "bg-rose-400/15 text-rose-300",
};

export default function AdminApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    const res = await fetch(`/api/admin/applications?${params.toString()}`);
    const data = await res.json();
    if (data.ok) setRows(data.data.applications);
    setLoading(false);
  }, [q, status]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(load, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Applications</h1>
          <p className="mt-1 text-sm text-slate-400">Review and manage candidate applications.</p>
        </div>
        <a
          href="/api/admin/applications/export"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, skills, position…"
            className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base sm:w-56">
          <option value="ALL">All statuses</option>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="glass mt-6 overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Position</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => {
                  const email = r.emailLogs[0];
                  return (
                    <tr key={r.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/admin/applications/${r.id}`} className="block">
                          <span className="font-medium text-white">{r.fullName}</span>
                          <span className="block text-xs text-slate-500">{r.email}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{r.position}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                          {APPLICATION_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {email?.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Mail className="h-3.5 w-3.5" />Sent</span>
                        ) : email?.status === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-400"><MailWarning className="h-3.5 w-3.5" />Failed</span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">{formatDate(r.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
