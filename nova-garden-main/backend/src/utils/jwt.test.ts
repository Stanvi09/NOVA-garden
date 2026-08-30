import { describe, it, expect, beforeAll } from "vitest";

// AUTH_SECRET must be set before jwt.ts is imported — it reads process.env
// at module load time and throws otherwise.
beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-do-not-use-in-prod";
});

describe("signToken / verifyToken", () => {
  it("round-trips a payload through sign and verify", async () => {
    const { signToken, verifyToken } = await import("./jwt");
    const payload = { userId: "user_123", email: "dev@nova.dev" };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("rejects a tampered or malformed token", async () => {
    const { verifyToken } = await import("./jwt");
    expect(() => verifyToken("not.a.valid.token")).toThrow();
  });

  it("rejects a token signed with a different secret", async () => {
    const jwt = await import("jsonwebtoken");
    const { verifyToken } = await import("./jwt");
    const foreignToken = jwt.default.sign({ userId: "x", email: "x@x.com" }, "wrong-secret");
    expect(() => verifyToken(foreignToken)).toThrow();
  });
});
