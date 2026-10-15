import { describe, it, expect } from "vitest";
import { getClientIp, hashIp, dedupeHash } from "@/lib/request";

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("https://x.test", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(getClientIp(req)).toBe("198.51.100.2");
  });

  it("returns a default when no ip headers present", () => {
    const req = new Request("https://x.test");
    expect(getClientIp(req)).toBe("0.0.0.0");
  });
});

describe("hashIp", () => {
  it("is deterministic and never returns the raw ip", () => {
    const a = hashIp("203.0.113.5");
    const b = hashIp("203.0.113.5");
    expect(a).toBe(b);
    expect(a).not.toContain("203.0.113.5");
    expect(a).toHaveLength(32);
  });
});

describe("dedupeHash", () => {
  it("is stable regardless of case and consistent for the same inputs", () => {
    const a = dedupeHash(["ADA@example.com", "Engineer", "key"]);
    const b = dedupeHash(["ada@example.com", "engineer", "key"]);
    expect(a).toBe(b);
  });

  it("differs for different inputs", () => {
    const a = dedupeHash(["ada@example.com", "Engineer", "key1"]);
    const b = dedupeHash(["ada@example.com", "Engineer", "key2"]);
    expect(a).not.toBe(b);
  });
});
