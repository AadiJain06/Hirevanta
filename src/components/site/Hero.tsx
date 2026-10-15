"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, Briefcase, UserCheck, Mail, ChevronDown } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pt-28 pb-16 sm:px-8"
    >
      <div className="container-max grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          variants={reduce ? undefined : container}
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-violetx/30 bg-violetx/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violetx-soft">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-node" />
              Your next opportunity starts here
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Great Talent.{" "}
            <span className="gradient-text animate-gradient-x">Better Opportunities.</span>{" "}
            Limitless Possibilities.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            HireVanta connects ambitious professionals with companies that are
            building the future. Discover opportunities, find exceptional talent,
            and make your next career move with confidence.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <LinkButton href="/#jobs" size="lg">
              Find Your Next Role
              <ArrowRight className="h-5 w-5" />
            </LinkButton>
            <LinkButton href="/#contact-form" variant="secondary" size="lg">
              Get In Touch
            </LinkButton>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-node" />
              Candidate-first process
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyanx animate-pulse-node" />
              Transparent communication
            </span>
          </motion.div>
        </motion.div>

        <TalentNetwork reduce={!!reduce} />
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#value"
        aria-label="Scroll to content"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-500 md:flex"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-5 w-5" />
      </motion.a>
    </section>
  );
}

function TalentNetwork({ reduce }: { reduce: boolean }) {
  const cards = [
    { icon: Briefcase, label: "New Opportunity", sub: "Senior Engineer", pos: "left-0 top-4", delay: 0 },
    { icon: UserCheck, label: "Talent Matched", sub: "98% fit score", pos: "right-0 top-28", delay: 1.2 },
    { icon: Mail, label: "Application Received", sub: "Under review", pos: "left-8 bottom-4", delay: 2.1 },
  ];

  return (
    <div className="relative mx-auto hidden h-[460px] w-full max-w-lg lg:block">
      {/* Connecting lines + nodes */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="400" y2="400">
            <stop stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {[
          [80, 90, 200, 200],
          [320, 120, 200, 200],
          [120, 320, 200, 200],
          [80, 90, 320, 120],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#line-grad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          >
            {!reduce && (
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-20"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </line>
        ))}
        {[
          [200, 200, 10],
          [80, 90, 6],
          [320, 120, 6],
          [120, 320, 6],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#a78bfa" className={reduce ? "" : "animate-pulse-node"} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </svg>

      {/* Center glass hub */}
      <div className="glass-strong absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl shadow-glow">
        <span className="gradient-text text-2xl font-extrabold">HV</span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
          Talent Hub
        </span>
      </div>

      {/* Floating cards */}
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            className={`glass absolute ${c.pos} flex items-center gap-3 rounded-xl p-3 shadow-card`}
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: c.delay }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violetx/20 text-violetx-soft">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-xs font-semibold text-white">{c.label}</span>
              <span className="block text-[11px] text-slate-400">{c.sub}</span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
