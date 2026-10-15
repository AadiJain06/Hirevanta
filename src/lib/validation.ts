import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

export const applicationSchema = z.object({
  // Personal
  fullName: trimmed(120).min(2, "Please enter your full name."),
  email: trimmed(200).email("Please enter a valid email address."),
  phone: trimmed(40).min(6, "Please enter a valid phone number (with country code)."),
  location: trimmed(160).min(2, "Please enter your current location."),
  linkedin: z
    .string()
    .trim()
    .max(300)
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  // Professional
  position: trimmed(160).min(2, "Please enter the position you're applying for."),
  experience: trimmed(60).min(1, "Please enter your total experience."),
  skills: trimmed(1000).min(2, "Please list your key skills."),
  employmentStatus: trimmed(120).optional().or(z.literal("")),
  expectedSalary: trimmed(120).optional().or(z.literal("")),
  noticePeriod: trimmed(120).optional().or(z.literal("")),
  // Additional
  coverLetter: trimmed(5000).optional().or(z.literal("")),
  consent: z.coerce.boolean().refine((v) => v === true, {
    message: "You must consent to the processing of your application data.",
  }),
  // Linkage
  jobId: z.string().trim().max(60).optional().or(z.literal("")),
  // Resume reference (set after upload)
  resumeKey: trimmed(400).min(1, "A resume file is required."),
  resumeFilename: trimmed(260).min(1),
  resumeMime: trimmed(160).min(1),
  resumeSize: z.coerce.number().int().positive(),
  // Honeypot (must be empty)
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const contactSchema = z.object({
  name: trimmed(120).min(2, "Please enter your name."),
  email: trimmed(200).email("Please enter a valid email address."),
  subject: trimmed(160).optional().or(z.literal("")),
  message: trimmed(3000).min(5, "Please enter a message (at least a few words)."),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;

export const contactStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "CLOSED"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const jobSchema = z.object({
  title: trimmed(160).min(2),
  company: trimmed(160).min(1),
  location: trimmed(160).min(1),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "REMOTE",
  ]),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD"]),
  description: trimmed(5000).min(10),
  responsibilities: trimmed(5000).optional().or(z.literal("")),
  salaryRange: trimmed(120).optional().or(z.literal("")),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
});

export type JobInput = z.infer<typeof jobSchema>;

export const applicationStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "HIRED",
    "REJECTED",
  ]),
});
