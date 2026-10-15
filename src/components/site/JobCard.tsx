"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { JobDTO } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/utils";

export function JobCard({
  job,
  onView,
  onApply,
}: {
  job: JobDTO;
  onView: (job: JobDTO) => void;
  onApply: (job: JobDTO) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="glass group relative flex h-full flex-col rounded-2xl p-6 transition-shadow duration-300 hover:shadow-glow"
    >
      {job.isSample && (
        <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
          Sample
        </span>
      )}

      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
          {job.company.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-white">{job.title}</h3>
          <p className="truncate text-sm text-slate-400">{job.company}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-violetx-soft" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 text-violetx-soft" />
          {EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType}
        </span>
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-violetx-soft" />
          {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] ?? job.experienceLevel}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">
        {job.description}
      </p>

      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      )}

      {job.salaryRange && (
        <p className="mt-4 text-sm font-semibold text-white">{job.salaryRange}</p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => onView(job)}
          className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-violetx/60 hover:bg-white/5"
        >
          View Details
        </button>
        <button
          onClick={() => onApply(job)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
        >
          Apply Now
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
