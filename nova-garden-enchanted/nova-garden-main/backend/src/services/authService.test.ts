import { describe, it, expect, vi, beforeAll } from "vitest";
import bcrypt from "bcryptjs";

// Mock the Prisma client entirely so these tests need no real database —
// fast, deterministic, and safe to run in any CI environment (including
// ones that can't reach Prisma's binary host).
const findUnique = vi.fn();
const create = vi.fn();

vi.mock("../utils/prismaClient", () => ({
  prisma: {
    user: { findUnique, create },
  },
}));

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-do-not-use-in-prod";
});

describe("authService.signup", () => {
  it("rejects signup when the email is already registered", async () => {
    findUnique.mockResolvedValueOnce({ id: "existing_user" });
    const { signup } = await import("./authService");

    await expect(signup("Ada", "ada@nova.dev", "password123")).rejects.toThrow(
      /already exists/i
    );
  });

  it("creates a new user with a bcrypt-hashed password and returns a token", async () => {
    findUnique.mockResolvedValueOnce(null);
    create.mockImplementationOnce(async ({ data }: any) => ({
      id: "new_user_1",
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    }));
    const { signup } = await import("./authService");

    const result = await signup("Ada", "ada@nova.dev", "password123");

    expect(result.token).toBeTypeOf("string");
    expect(result.user.email).toBe("ada@nova.dev");
    // the raw password must never be stored — only a bcrypt hash
    const storedHash = create.mock.calls[0][0].data.passwordHash;
    expect(storedHash).not.toBe("password123");
    expect(await bcrypt.compare("password123", storedHash)).toBe(true);
  });
});

describe("authService.login", () => {
  it("rejects login for an unknown email without revealing which part was wrong", async () => {
    findUnique.mockResolvedValueOnce(null);
    const { login } = await import("./authService");

    await expect(login("nobody@nova.dev", "whatever")).rejects.toThrow(
      /invalid email or password/i
    );
  });

  it("rejects login with an incorrect password", async () => {
    const realHash = await bcrypt.hash("correct-password", 10);
    findUnique.mockResolvedValueOnce({
      id: "user_1",
      email: "dev@nova.dev",
      passwordHash: realHash,
    });
    const { login } = await import("./authService");

    await expect(login("dev@nova.dev", "wrong-password")).rejects.toThrow(
      /invalid email or password/i
    );
  });

  it("logs in successfully and returns a signed token for a correct password", async () => {
    const realHash = await bcrypt.hash("correct-password", 10);
    findUnique.mockResolvedValueOnce({
      id: "user_1",
      name: "Priya",
      email: "dev@nova.dev",
      passwordHash: realHash,
    });
    const { login } = await import("./authService");

    const result = await login("dev@nova.dev", "correct-password");
    expect(result.token).toBeTypeOf("string");
    expect(result.user.email).toBe("dev@nova.dev");
  });
});
