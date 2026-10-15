import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  renderApplicationEmail,
  applicationEmailSubject,
  renderContactEmail,
  contactEmailSubject,
} from "@/lib/email-templates";

describe("escapeHtml", () => {
  it("escapes HTML-significant characters (XSS protection)", () => {
    expect(escapeHtml(`<script>alert('x')</script>`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;",
    );
  });
  it("handles null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("application email", () => {
  it("builds the required subject format", () => {
    expect(applicationEmailSubject("Ada Lovelace", "Senior Engineer")).toBe(
      "New HireVanta Application — Ada Lovelace — Senior Engineer",
    );
  });

  it("renders candidate details and escapes injected markup", () => {
    const html = renderApplicationEmail({
      fullName: "<b>Ada</b>",
      email: "ada@example.com",
      phone: "+1 555",
      location: "London",
      linkedin: null,
      position: "Engineer",
      experience: "8y",
      skills: "TS, React",
      employmentStatus: null,
      expectedSalary: null,
      noticePeriod: null,
      coverLetter: null,
      jobTitle: null,
      submittedAt: new Date("2026-01-01T00:00:00Z"),
      resumeUrl: "https://example.com/resume",
      resumeFilename: "cv.pdf",
    });
    expect(html).toContain("ada@example.com");
    expect(html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(html).not.toContain("<b>Ada</b>");
    expect(html).toContain("https://example.com/resume");
  });
});

describe("contact email", () => {
  it("builds the subject with the provided topic and renders details", () => {
    expect(contactEmailSubject("Grace", "Partnership")).toBe(
      "New HireVanta Contact Message — Grace — Partnership",
    );
    const html = renderContactEmail({
      name: "Grace",
      email: "grace@compiler.co",
      subject: "Partnership",
      message: "I'd like to connect.",
      submittedAt: new Date(),
    });
    expect(html).toContain("Grace");
    expect(html).toContain("grace@compiler.co");
    expect(html).toContain("I&#39;d like to connect.");
  });

  it("falls back to a default topic when no subject is given", () => {
    expect(contactEmailSubject("Grace", null)).toBe(
      "New HireVanta Contact Message — Grace — General enquiry",
    );
  });
});
