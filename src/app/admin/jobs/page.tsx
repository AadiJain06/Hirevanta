"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  responsibilities: string | null;
  salaryRange: string | null;
  tags: string[];
  status: string;
  isSample: boolean;
  _count?: { applications: number };
}

const empty = {
  title: "",
  company: "",
  location: "",
  employmentType: "FULL_TIME",
  experienceLevel: "MID",
  description: "",
  responsibilities: "",
  salaryRange: "",
  tags: "",
  status: "DRAFT",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-400/15 text-slate-300",
  PUBLISHED: "bg-emerald-400/15 text-emerald-300",
  CLOSED: "bg-rose-400/15 text-rose-300",
};

export default function AdminJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/jobs");
    const data = await res.json();
    if (data.ok) setJobs(data.data.jobs);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...empty });
    setModalOpen(true);
  }

  function openEdit(job: Job) {
    setEditing(job.id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      description: job.description,
      responsibilities: job.responsibilities ?? "",
      salaryRange: job.salaryRange ?? "",
      tags: job.tags.join(", "),
      status: job.status,
    });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const url = editing ? `/api/admin/jobs/${editing}` : "/api/admin/jobs";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.ok) {
      toast(editing ? "Job updated." : "Job created.", "success");
      setModalOpen(false);
      load();
    } else {
      toast(data.error ?? "Could not save job.", "error");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this job listing? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.ok) {
      toast("Job deleted.", "success");
      load();
    } else {
      toast(data.error ?? "Could not delete.", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Job Listings</h1>
          <p className="mt-1 text-sm text-slate-400">Create, publish, and manage vacancies.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
        >
          <Plus className="h-4 w-4" />
          New Job
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="glass flex items-center justify-center rounded-2xl py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="glass rounded-2xl py-16 text-center text-sm text-slate-500">No jobs yet. Create your first listing.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{job.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[job.status]}`}>
                    {job.status}
                  </span>
                  {job.isSample && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                      Sample
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">
                  {job.company} · {job.location} · {EMPLOYMENT_TYPE_LABELS[job.employmentType]} · {EXPERIENCE_LEVEL_LABELS[job.experienceLevel]} · {job._count?.applications ?? 0} applicant(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(job)} className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(job.id)} className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-rose-400" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit job" : "New job"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <JField label="Title"><input className="input-base" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></JField>
          <JField label="Company"><input className="input-base" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></JField>
          <JField label="Location"><input className="input-base" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></JField>
          <JField label="Salary range"><input className="input-base" value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} /></JField>
          <JField label="Employment type">
            <select className="input-base" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
              {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </JField>
          <JField label="Experience level">
            <select className="input-base" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
              {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </JField>
          <JField label="Description" className="sm:col-span-2"><textarea className="input-base min-h-[90px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></JField>
          <JField label="Responsibilities" className="sm:col-span-2"><textarea className="input-base min-h-[70px]" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} /></JField>
          <JField label="Tags (comma-separated)" className="sm:col-span-2"><input className="input-base" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></JField>
          <JField label="Status">
            <select className="input-base" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </JField>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {editing ? "Save changes" : "Create job"}
        </button>
      </Modal>
    </div>
  );
}

function JField({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="label-base">{label}</label>
      {children}
    </div>
  );
}
