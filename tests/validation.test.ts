import { describe, it, expect } from "vitest";
import {
  applicationSchema,
  contactSchema,
  jobSchema,
  applicationStatusSchema,
} from "@/lib/validation";

const validApplication = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1 555 123 4567",
  location: "London, UK",
  linkedin: "https://linkedin.com/in/ada",
  position: "Senior Engineer",
  experience: "8 years",
  skills: "TypeScript, React, Node.js",
  consent: true,
  resumeUrl: "https://drive.google.com/file/d/abc123/view",
};

describe("applicationSchema", () => {
  it("accepts a valid application", () => {
    const parsed = applicationSchema.safeParse(validApplication);
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, email: "not-an-email" });
    expect(parsed.success).toBe(false);
  });

  it("requires consent to be true", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, consent: false });
    expect(parsed.success).toBe(false);
  });

  it("requires a résumé link", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, resumeUrl: "" });
    expect(parsed.success).toBe(false);
  });

  it("rejects a résumé value that is not a valid URL", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, resumeUrl: "my-resume.pdf" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a valid https résumé link", () => {
    const parsed = applicationSchema.safeParse({
      ...validApplication,
      resumeUrl: "https://www.dropbox.com/s/xyz/cv.pdf",
    });
    expect(parsed.success).toBe(true);
  });

  it("allows an empty optional linkedin", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, linkedin: "" });
    expect(parsed.success).toBe(true);
  });

  it("rejects a malformed linkedin url", () => {
    const parsed = applicationSchema.safeParse({ ...validApplication, linkedin: "linkedin" });
    expect(parsed.success).toBe(false);
  });
});

describe("contactSchema", () => {
  const valid = {
    name: "Grace Hopper",
    email: "grace@compiler.co",
    subject: "Question about a role",
    message: "I'd love to learn more about opportunities with your team.",
  };

  it("accepts a valid contact message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an empty optional subject", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "" }).success).toBe(true);
  });

  it("rejects a short message", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});

describe("jobSchema", () => {
  it("defaults status to DRAFT and tags to []", () => {
    const parsed = jobSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      location: "Remote",
      employmentType: "REMOTE",
      experienceLevel: "MID",
      description: "A great role for a great person.",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("DRAFT");
      expect(parsed.data.tags).toEqual([]);
    }
  });

  it("rejects an invalid employment type", () => {
    const parsed = jobSchema.safeParse({
      title: "Engineer",
      company: "Acme",
      location: "Remote",
      employmentType: "NOT_A_TYPE",
      experienceLevel: "MID",
      description: "A great role.",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("applicationStatusSchema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["NEW", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "HIRED", "REJECTED"]) {
      expect(applicationStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });
  it("rejects an unknown status", () => {
    expect(applicationStatusSchema.safeParse({ status: "ARCHIVED" }).success).toBe(false);
  });
});
