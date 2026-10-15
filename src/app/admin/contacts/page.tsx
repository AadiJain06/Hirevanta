"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2, Mail, MailWarning, RefreshCw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface Row {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  emailLogs: { id: string; status: string; attempts: number; lastError: string | null }[];
}

const STATUSES = ["NEW", "READ", "REPLIED", "CLOSED"] as const;
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  CLOSED: "Closed",
};
const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-sky-400/15 text-sky-300",
  READ: "bg-amber-400/15 text-amber-300",
  REPLIED: "bg-emerald-400/15 text-emerald-300",
  CLOSED: "bg-slate-400/15 text-slate-300",
};

export default function AdminContacts() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    const res = await fetch(`/api/admin/contacts?${params.toString()}`);
    const data = await res.json();
    if (data.ok) setRows(data.data.contacts);
    setLoading(false);
  }, [q, status]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(load, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [load]);

  async function retry(emailLogId: string) {
    const res = await fetch("/api/admin/emails/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailLogId }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      toast("Email resent.", "success");
      load();
    } else {
      toast(data.error ?? "Retry failed.", "error");
    }
  }

  async function updateStatus(id: string, next: string) {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
      toast("Status updated.", "success");
    } else {
      toast(data.error ?? "Could not update.", "error");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.ok) {
      setRows((rs) => rs.filter((r) => r.id !== id));
      toast("Message deleted.", "success");
    } else {
      toast(data.error ?? "Could not delete.", "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-400">Messages submitted through the website contact form.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, subject, message…"
            className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base sm:w-48">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="glass flex items-center justify-center rounded-2xl py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="glass rounded-2xl py-16 text-center text-sm text-slate-500">No messages found.</p>
        ) : (
          rows.map((r) => {
            const email = r.emailLogs[0];
            const expanded = open === r.id;
            return (
              <div key={r.id} className="glass rounded-2xl p-5">
                <button
                  onClick={() => setOpen(expanded ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{r.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {r.subject || "General enquiry"} · {r.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {email?.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Mail className="h-3.5 w-3.5" />Sent</span>
                    ) : email?.status === "FAILED" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400"><MailWarning className="h-3.5 w-3.5" />Failed</span>
                    ) : null}
                    <span className="text-[11px] text-slate-600">{formatDate(r.createdAt)}</span>
                  </div>
                </button>

                {expanded && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
                    <Detail label="Email" value={<a href={`mailto:${r.email}`} className="text-violetx-soft hover:underline">{r.email}</a>} />
                    {r.subject && <Detail label="Subject" value={r.subject} />}
                    <Detail label="Message" value={<span className="whitespace-pre-wrap">{r.message}</span>} />

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="input-base w-40"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>

                      {email?.status === "FAILED" && (
                        <button
                          onClick={() => retry(email.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry notification
                        </button>
                      )}

                      <button
                        onClick={() => remove(r.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 text-slate-200">{value}</span>
    </div>
  );
}
