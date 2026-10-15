import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed:
 *  - one admin account (from env ADMIN_EMAIL / ADMIN_PASSWORD)
 *  - sample/demo job listings (clearly flagged isSample = true)
 *
 * Sample jobs are DEMO data only. They are not genuine vacancies.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@hirevanta.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-this-strong-password";
  const name = process.env.ADMIN_NAME ?? "HireVanta Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash, role: "SUPER_ADMIN" },
  });
  console.log(`✓ Admin ready: ${email}`);

  const sampleJobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Nebula Labs (Sample)",
      location: "Remote — Global",
      employmentType: "REMOTE" as const,
      experienceLevel: "SENIOR" as const,
      description:
        "Build delightful, performant interfaces for a next-generation analytics product. Work closely with design and product to ship polished experiences.",
      responsibilities:
        "Own frontend architecture; mentor engineers; drive accessibility and performance standards.",
      salaryRange: "$120k – $160k",
      tags: ["React", "TypeScript", "Next.js", "Design Systems"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
    {
      title: "Product Designer",
      company: "Aurora Studio (Sample)",
      location: "Berlin, Germany",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID" as const,
      description:
        "Shape the end-to-end experience of a B2B SaaS platform. Translate complex workflows into intuitive, elegant interfaces.",
      responsibilities:
        "Lead design discovery; prototype; collaborate with engineering on handoff and QA.",
      salaryRange: "€65k – €85k",
      tags: ["Figma", "Prototyping", "UX Research"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
    {
      title: "Backend Engineer (Node.js)",
      company: "Quantic Systems (Sample)",
      location: "Austin, TX, USA",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID" as const,
      description:
        "Design and scale APIs and data pipelines for a high-growth fintech. Care deeply about reliability and clean abstractions.",
      responsibilities:
        "Build services; design schemas; own observability and on-call for your domain.",
      salaryRange: "$110k – $140k",
      tags: ["Node.js", "PostgreSQL", "AWS", "APIs"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
    {
      title: "Talent Acquisition Partner",
      company: "HireVanta (Sample)",
      location: "Hybrid — London, UK",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      description:
        "Partner with hiring teams to build thoughtful, candidate-first recruitment processes across technical and non-technical roles.",
      responsibilities:
        "Run full-cycle recruitment; coach hiring managers; improve candidate experience.",
      salaryRange: "£50k – £70k",
      tags: ["Recruiting", "Sourcing", "Stakeholder Management"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
    {
      title: "Data Analyst",
      company: "Lumen Health (Sample)",
      location: "Remote — EU",
      employmentType: "CONTRACT" as const,
      experienceLevel: "ENTRY" as const,
      description:
        "Turn raw product and operational data into clear insights that guide decisions across the business.",
      responsibilities:
        "Build dashboards; run analyses; communicate findings to non-technical stakeholders.",
      salaryRange: "€45k – €55k",
      tags: ["SQL", "Python", "Dashboards"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
    {
      title: "DevOps Engineer",
      company: "Stratos Cloud (Sample)",
      location: "Remote — US",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "LEAD" as const,
      description:
        "Own infrastructure, CI/CD, and reliability for a fast-moving platform team. Automate everything that can be automated.",
      responsibilities:
        "Design IaC; manage Kubernetes; champion security and cost efficiency.",
      salaryRange: "$140k – $180k",
      tags: ["Kubernetes", "Terraform", "CI/CD", "AWS"],
      status: "PUBLISHED" as const,
      isSample: true,
    },
  ];

  // Remove previous sample jobs so re-seeding stays idempotent.
  await prisma.job.deleteMany({ where: { isSample: true } });
  await prisma.job.createMany({ data: sampleJobs });
  console.log(`✓ Seeded ${sampleJobs.length} sample jobs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
