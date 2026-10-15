import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// These tests exercise the primitives that back admin authorization:
// password hashing and signed-session verification. They avoid Next.js
// request context so they run cleanly in the node test environment.

describe("password hashing (bcrypt)", () => {
  it("verifies a correct password and rejects an incorrect one", async () => {
    const hash = await bcrypt.hash("s3cret-password", 12);
    expect(await bcrypt.compare("s3cret-password", hash)).toBe(true);
    expect(await bcrypt.compare("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const a = await bcrypt.hash("same", 10);
    const b = await bcrypt.hash("same", 10);
    expect(a).not.toBe(b);
  });
});

describe("session token (jose JWT)", () => {
  const secret = new TextEncoder().encode("test-secret-value");

  async function sign(sub: string) {
    return new SignJWT({ email: "admin@test.com", role: "ADMIN", name: "Admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
  }

  it("verifies a token signed with the same secret", async () => {
    const token = await sign("admin-1");
    const { payload } = await jwtVerify(token, secret);
    expect(payload.sub).toBe("admin-1");
    expect(payload.role).toBe("ADMIN");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await sign("admin-1");
    const wrong = new TextEncoder().encode("attacker-secret");
    await expect(jwtVerify(token, wrong)).rejects.toBeTruthy();
  });

  it("rejects a tampered token", async () => {
    const token = await sign("admin-1");
    const tampered = token.slice(0, -3) + "aaa";
    await expect(jwtVerify(tampered, secret)).rejects.toBeTruthy();
  });
});
