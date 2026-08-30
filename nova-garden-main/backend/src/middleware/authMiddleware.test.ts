import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import type { Request, Response, NextFunction } from "express";

const findUnique = vi.fn();

vi.mock("../utils/prismaClient", () => ({
  prisma: {
    projectMember: { findUnique },
  },
}));

// authMiddleware.ts imports jwt.ts at module load time, which reads
// AUTH_SECRET from the environment immediately and throws if it's missing —
// so this has to be set before the dynamic import() below runs.
beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-do-not-use-in-prod";
});

function mockReqRes(userId: string | undefined, projectId: string) {
  const req = { user: userId ? { userId, email: "x@x.com" } : undefined, params: { projectId } } as unknown as Request;
  const json = vi.fn();
  const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, json, next };
}

beforeEach(() => {
  findUnique.mockReset();
});

describe("requireProjectRole", () => {
  it("returns 401 when the request has no authenticated user", async () => {
    const { requireProjectRole } = await import("./authMiddleware");
    const middleware = requireProjectRole("DEVELOPER");
    const { req, res, next } = mockReqRes(undefined, "proj_1");

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is not a member of the project", async () => {
    findUnique.mockResolvedValueOnce(null);
    const { requireProjectRole } = await import("./authMiddleware");
    const middleware = requireProjectRole("DEVELOPER");
    const { req, res, next } = mockReqRes("user_1", "proj_1");

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when a REPORTER attempts an ADMIN-only action", async () => {
    findUnique.mockResolvedValueOnce({ role: "REPORTER" });
    const { requireProjectRole } = await import("./authMiddleware");
    const middleware = requireProjectRole("ADMIN");
    const { req, res, next } = mockReqRes("user_1", "proj_1");

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when the member's role meets the minimum required role", async () => {
    findUnique.mockResolvedValueOnce({ role: "OWNER" });
    const { requireProjectRole } = await import("./authMiddleware");
    const middleware = requireProjectRole("DEVELOPER");
    const { req, res, next } = mockReqRes("user_1", "proj_1");

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
