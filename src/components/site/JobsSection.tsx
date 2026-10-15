"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, SearchX, AlertTriangle, MapPin, Briefcase, TrendingUp } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { JobCard } from "./JobCard";
import { Modal } from "@/components/ui/Modal";
import { ApplicationForm } from "./ApplicationForm";
import { Badge } from "@/components/ui/Badge";
import type { JobDTO } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/utils";

type State = "loading" | "ready" | "error";

export function JobsSection() {
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [state, setState] = useState<State>("loading");
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const [viewing, setViewing] = useState<JobDTO | null>(null);
  const [applying, setApplying] = useState<JobDTO | null | undefined>(undefined);

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchJobs = useCallback(async () => {
    setState("loading");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (location) params.set("location", location);
      if (type !== "ALL") params.set("type", type);
      if (level !== "ALL") params.set("level", level);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setJobs(data.data.jobs);
        setState("ready");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, [q, location, type, level]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchJobs, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [fetchJobs]);

  return (
    <section id="jobs" className="section-pad">
      <div className="container-max">
        <SectionHeading
          eyebrow="Open Roles"
          title="Your next chapter starts here."
          subtitle={'Browse opportunities below. Listings marked "Sample" are demo data to showcase the experience — not genuine vacancies.'}
        />

        {/* Search + filters */}
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/[0.03] px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search job title, skill, or keyword"
                className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 outline-none"
                aria-label="Search jobs"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="input-base"
                  aria-label="Filter by location"
                />
                <select value={type} onChange={(e) => setType(e.target.value)} className="input-base" aria-label="Employment type">
                  <option value="ALL">All employment types</option>
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-base" aria-label="Experience level">
                  <option value="ALL">All experience levels</option>
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* States */}
        <div className="mt-12">
          {state === "loading" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass h-64 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          {state === "error" && (
            <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-400" />
              <p className="text-slate-300">We couldn&apos;t load jobs right now.</p>
              <button onClick={fetchJobs} className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">
                Try again
              </button>
            </div>
          )}

          {state === "ready" && jobs.length === 0 && (
            <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center">
              <SearchX className="h-10 w-10 text-slate-500" />
              <p className="text-slate-300">No roles match your search yet.</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or keywords.</p>
            </div>
          )}

          {state === "ready" && jobs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onView={setViewing} onApply={setApplying} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Job details modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title}>
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="font-semibold text-white">{viewing.company}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-violetx-soft" />{viewing.location}</span>
              <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4 text-violetx-soft" />{EMPLOYMENT_TYPE_LABELS[viewing.employmentType]}</span>
              <span className="inline-flex items-center gap-1"><TrendingUp className="h-4 w-4 text-violetx-soft" />{EXPERIENCE_LEVEL_LABELS[viewing.experienceLevel]}</span>
            </div>
            {viewing.isSample && (
              <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                This is sample/demo data, not a genuine vacancy.
              </p>
            )}
            <div>
              <h4 className="mb-1 text-sm font-semibold text-white">About the role</h4>
              <p className="text-sm leading-relaxed text-slate-400">{viewing.description}</p>
            </div>
            {viewing.responsibilities && (
              <div>
                <h4 className="mb-1 text-sm font-semibold text-white">Responsibilities</h4>
                <p className="text-sm leading-relaxed text-slate-400">{viewing.responsibilities}</p>
              </div>
            )}
            {viewing.salaryRange && (
              <p className="text-sm font-semibold text-white">Compensation: {viewing.salaryRange}</p>
            )}
            {viewing.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {viewing.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            )}
            <button
              onClick={() => {
                setApplying(viewing);
                setViewing(null);
              }}
              className="w-full rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow"
            >
              Apply Now
            </button>
          </div>
        )}
      </Modal>

      {/* Application modal */}
      <Modal
        open={applying !== undefined}
        onClose={() => setApplying(undefined)}
        title={applying ? `Apply — ${applying.title}` : "Apply"}
        maxWidth="max-w-3xl"
      >
        <ApplicationForm job={applying} onDone={() => setApplying(undefined)} />
      </Modal>
    </section>
  );
}
