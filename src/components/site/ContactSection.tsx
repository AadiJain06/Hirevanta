"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";

const CONTACT_EMAIL = "hirevanta0@gmail.com";

interface ContactState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initial: ContactState = { name: "", email: "", subject: "", message: "" };

export function ContactSection() {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const set = (k: keyof ContactState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.message.trim().length < 5) e.message = "Please enter a message.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDone(true);
        toast("Message sent. We'll be in touch.", "success");
      } else if (data.fieldErrors) {
        setErrors(data.fieldErrors);
        toast("Please correct the highlighted fields.", "error");
      } else {
        toast(data.error ?? "Submission failed.", "error");
      }
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact-form" className="section-pad">
      <div className="container-max grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violetx-soft">
            Get In Touch
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Let&apos;s connect.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Have a question, an opportunity, or just want to say hello? Send us a
            message and our team will get back to you.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-7 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-violetx/50 hover:bg-white/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violetx/15 text-violetx-soft">
              <Mail className="h-4 w-4" />
            </span>
            {CONTACT_EMAIL}
          </a>

          <div className="mt-8 space-y-4">
            {[
              "Candidate-first, people-focused support",
              "Clear, transparent communication",
              "We read every message",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-strong rounded-2xl p-6 shadow-card sm:p-8">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">Message received</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Thank you for reaching out. Your message has been sent to our team.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" aria-hidden />
                <CField label="Your name" required error={errors.name}>
                  <input className="input-base" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </CField>
                <CField label="Email address" required error={errors.email}>
                  <input type="email" className="input-base" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </CField>
                <CField label="Subject" error={errors.subject}>
                  <input className="input-base" placeholder="What's this about? (optional)" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
                </CField>
                <CField label="Message" required error={errors.message}>
                  <textarea className="input-base min-h-[120px]" value={form.message} onChange={(e) => set("message", e.target.value)} />
                </CField>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-base">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400" role="alert">{error}</p>}
    </div>
  );
}
