"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, CheckCircle2, MailWarning } from "lucide-react";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUSES } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface EmailInfo {
  id: string;
  status: string;
  attempts: number;
  lastError: string | null;
}

export function ApplicationControls({
  applicationId,
  currentStatus,
  submittedAt,
  latestEmail,
}: {
  applicationId: string;
  currentStatus: string;
  submittedAt: string;
  latestEmail: EmailInfo | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);

  async function updateStatus(next: string) {
    setStatus(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast("Status updated.", "success");
        router.refresh();
      } else {
        toast(data.error ?? "Could not update status.", "error");
        setStatus(currentStatus);
      }
    } catch {
      toast("Network error.", "error");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  async function retry() {
    if (!latestEmail) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/admin/emails/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailLogId: latestEmail.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast("Email resent successfully.", "success");
        router.refresh();
      } else {
        toast(data.error ?? "Retry failed.", "error");
      }
    } catch {
      toast("Network error.", "error");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Workflow
      </h2>

      <label className="label-base mt-4">Status</label>
      <div className="relative">
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={saving}
          className="input-base"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>
          ))}
        </select>
        {saving && (
          <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violetx-soft" />
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">Notification email</p>
        {latestEmail ? (
          <div className="mt-2">
            {latestEmail.status === "SENT" ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Delivered ({latestEmail.attempts} attempt{latestEmail.attempts === 1 ? "" : "s"})
              </span>
            ) : (
              <div>
                <span className="inline-flex items-center gap-1.5 text-sm text-rose-400">
                  <MailWarning className="h-4 w-4" />
                  {latestEmail.status === "FAILED" ? "Delivery failed" : "Pending"}
                </span>
                {latestEmail.lastError && (
                  <p className="mt-1 text-xs text-slate-500">{latestEmail.lastError}</p>
                )}
                <button
                  onClick={retry}
                  disabled={retrying}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
                >
                  {retrying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Retry notification
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No email logged.</p>
        )}
      </div>

      <p className="mt-6 text-[11px] text-slate-600">Submitted {submittedAt}</p>
    </div>
  );
}
