"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, PartyPopper, Loader2, Link2, Info } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { JobDTO } from "@/lib/types";

interface Props {
  job?: JobDTO | null;
  onDone?: () => void;
}

const STEPS = ["Personal", "Professional", "Résumé", "Review"] as const;

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  position: string;
  experience: string;
  skills: string;
  employmentStatus: string;
  expectedSalary: string;
  noticePeriod: string;
  resumeUrl: string;
  coverLetter: string;
  consent: boolean;
}

const initial = (job?: JobDTO | null): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  position: job?.title ?? "",
  experience: "",
  skills: "",
  employmentStatus: "",
  expectedSalary: "",
  noticePeriod: "",
  resumeUrl: "",
  coverLetter: "",
  consent: false,
});

export function ApplicationForm({ job, onDone }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial(job));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (form.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
      if (form.phone.trim().length < 6) e.phone = "Enter a valid phone (with country code).";
      if (form.location.trim().length < 2) e.location = "Enter your current location.";
      if (form.linkedin && !/^https?:\/\//.test(form.linkedin))
        e.linkedin = "Enter a valid URL (or leave blank).";
    }
    if (s === 1) {
      if (form.position.trim().length < 2) e.position = "Enter the position you're applying for.";
      if (form.experience.trim().length < 1) e.experience = "Enter your total experience.";
      if (form.skills.trim().length < 2) e.skills = "List your key skills.";
    }
    if (s === 2) {
      if (!form.resumeUrl.trim()) e.resumeUrl = "Please add a link to your résumé.";
      else if (!/^https?:\/\/\S+\.\S+/.test(form.resumeUrl.trim()))
        e.resumeUrl = "Enter a valid link (starting with https://).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!form.consent) {
      setErrors({ consent: "You must consent to continue." });
      return;
    }
    if (!form.resumeUrl.trim()) {
      setStep(2);
      setErrors({ resumeUrl: "Please add a link to your résumé." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jobId: job?.id ?? "",
          resumeUrl: form.resumeUrl.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess(true);
        toast("Application submitted successfully.", "success");
      } else if (data.fieldErrors) {
        setErrors(data.fieldErrors);
        toast("Please correct the highlighted fields.", "error");
        setStep(0);
      } else {
        toast(data.error ?? "Submission failed. Please try again.", "error");
      }
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400"
        >
          <PartyPopper className="h-10 w-10" />
        </motion.div>
        <h3 className="mt-6 text-2xl font-extrabold text-white">
          Application received successfully!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Thank you for your interest in HireVanta. Your application has been
          submitted for review.
        </p>
        <button
          onClick={onDone}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-7 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  i < step
                    ? "bg-emerald-400 text-midnight"
                    : i === step
                      ? "bg-brand-gradient text-white shadow-glow"
                      : "bg-white/10 text-slate-400"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="mt-1.5 hidden text-[10px] uppercase tracking-wide text-slate-400 sm:block">
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                  style={{ width: i < step ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Honeypot (hidden from users) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        aria-hidden
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName}>
                <input className="input-base" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </Field>
              <Field label="Email address" required error={errors.email}>
                <input type="email" className="input-base" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone (with country code)" required error={errors.phone}>
                <input className="input-base" placeholder="+1 555 000 1234" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="Current location" required error={errors.location}>
                <input className="input-base" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="LinkedIn profile" error={errors.linkedin} className="sm:col-span-2">
                <input className="input-base" placeholder="https://linkedin.com/in/you" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Position applying for" required error={errors.position} className="sm:col-span-2">
                <input className="input-base" value={form.position} onChange={(e) => set("position", e.target.value)} />
              </Field>
              <Field label="Total experience" required error={errors.experience}>
                <input className="input-base" placeholder="e.g. 5 years" value={form.experience} onChange={(e) => set("experience", e.target.value)} />
              </Field>
              <Field label="Current employment status" error={errors.employmentStatus}>
                <input className="input-base" placeholder="e.g. Employed, Open to work" value={form.employmentStatus} onChange={(e) => set("employmentStatus", e.target.value)} />
              </Field>
              <Field label="Key skills" required error={errors.skills} className="sm:col-span-2">
                <textarea className="input-base min-h-[90px]" placeholder="React, TypeScript, Node.js…" value={form.skills} onChange={(e) => set("skills", e.target.value)} />
              </Field>
              <Field label="Expected salary" error={errors.expectedSalary}>
                <input className="input-base" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)} />
              </Field>
              <Field label="Notice period / availability" error={errors.noticePeriod}>
                <input className="input-base" placeholder="e.g. 30 days" value={form.noticePeriod} onChange={(e) => set("noticePeriod", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <Field label="Résumé link" required error={errors.resumeUrl}>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    inputMode="url"
                    className="input-base pl-9"
                    placeholder="https://drive.google.com/..."
                    value={form.resumeUrl}
                    onChange={(e) => set("resumeUrl", e.target.value)}
                  />
                </div>
              </Field>
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-violetx-soft" />
                <p>
                  Paste a shareable link to your résumé (Google Drive, Dropbox,
                  OneDrive, or a PDF URL). Make sure sharing is set to{" "}
                  <span className="text-slate-200">“anyone with the link can view”</span>{" "}
                  so our team can open it.
                </p>
              </div>
              <div className="mt-5">
                <Field label="Cover letter / short introduction" error={errors.coverLetter}>
                  <textarea className="input-base min-h-[120px]" placeholder="Tell us a little about yourself (optional)" value={form.coverLetter} onChange={(e) => set("coverLetter", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-5 text-sm">
                <Review label="Name" value={form.fullName} />
                <Review label="Email" value={form.email} />
                <Review label="Phone" value={form.phone} />
                <Review label="Location" value={form.location} />
                <Review label="Position" value={form.position} />
                <Review label="Experience" value={form.experience} />
                <Review label="Skills" value={form.skills} />
                <Review label="Résumé" value={form.resumeUrl || "—"} />
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-violetx"
                />
                <span>
                  I consent to HireVanta processing my application data in line
                  with its{" "}
                  <a href="/privacy" className="gradient-text underline" target="_blank">privacy policy</a>.{" "}
                  <span className="text-rose-400">*</span>
                </span>
              </label>
              {errors.consent && (
                <p className="text-sm text-rose-400" role="alert">{errors.consent}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit My Application
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label-base">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400" role="alert">{error}</p>}
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-white/5 py-1.5 last:border-0">
      <span className="w-28 shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 break-words text-slate-200">{value || "—"}</span>
    </div>
  );
}
