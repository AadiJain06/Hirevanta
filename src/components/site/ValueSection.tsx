"use client";

import { UserRound, Building2, Sparkles } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const cards = [
  {
    icon: UserRound,
    title: "For Job Seekers",
    body: "Discover relevant career opportunities, showcase your skills, and apply for positions that match your ambitions.",
  },
  {
    icon: Building2,
    title: "For Employers",
    body: "Connect with qualified candidates, streamline recruitment, and find talent aligned with your business needs.",
  },
  {
    icon: Sparkles,
    title: "Smarter Talent Matching",
    body: "Bring candidates and opportunities together through a thoughtful, people-first recruitment process.",
  },
];

export function ValueSection() {
  return (
    <section id="value" className="section-pad">
      <div className="container-max">
        <SectionHeading
          eyebrow="Why HireVanta"
          title="Hiring should move businesses forward."
          subtitle="A recruitment experience designed around people — candidates and companies alike."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 0.1}>
                <article className="group relative h-full overflow-hidden rounded-2xl p-[1px]">
                  {/* animated gradient border */}
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violetx/40 via-transparent to-cyanx/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="glass relative h-full rounded-2xl p-7 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-glow">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold text-white">{c.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {c.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
