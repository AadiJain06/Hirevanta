"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Handshake, Compass } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const pillars = [
  { icon: Compass, title: "Candidate-first experience", body: "We design every step around the people we serve." },
  { icon: Heart, title: "Thoughtful recruitment", body: "Quality matching over volume, every time." },
  { icon: MessageCircle, title: "Transparent communication", body: "Clear, honest updates throughout the process." },
  { icon: Handshake, title: "Long-term relationships", body: "We invest in careers and companies for the long run." },
];

export function AboutSection() {
  return (
    <section id="about" className="section-pad">
      <div className="container-max grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violetx-soft">
            About HireVanta
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.6rem]">
            People first. Potential always.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
            HireVanta is a recruitment agency focused on helping organizations
            discover talent and helping candidates explore career opportunities.
            We believe hiring works best when it&apos;s built on trust, clarity, and
            genuine care for the people involved.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="glass flex gap-3 rounded-xl p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violetx/15 text-violetx-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        {/* Abstract animated illustration */}
        <Reveal delay={0.1}>
          <div className="relative aspect-square w-full max-w-md justify-self-center">
            <div className="absolute inset-0 rounded-3xl bg-grid-pattern [background-size:40px_40px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 m-auto rounded-full border border-violetx/20"
                style={{ width: `${60 + ring * 20}%`, height: `${60 + ring * 20}%` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30 + ring * 10, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyanx shadow-glow-cyan" />
              </motion.div>
            ))}
            <div className="glass-strong absolute inset-0 m-auto flex h-32 w-32 flex-col items-center justify-center rounded-3xl shadow-glow">
              <span className="gradient-text text-4xl font-extrabold">HV</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
