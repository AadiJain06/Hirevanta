import { describe, it, expect, vi, beforeEach } from "vitest";

// Force the console provider so the test needs no external credentials.
process.env.EMAIL_PROVIDER = "console";

describe("sendEmail (console provider)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok without external calls and logs to console", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "hirevanta0@gmail.com",
      subject: "Test subject",
      html: "<p>hello</p>",
    });
    expect(result.ok).toBe(true);
    expect(result.providerId).toMatch(/^console-/);
    expect(spy).toHaveBeenCalled();
    // The console path must not print the full HTML body (avoid PII logging).
    const logged = spy.mock.calls.flat().join(" ");
    expect(logged).not.toContain("<p>hello</p>");
  });
});
