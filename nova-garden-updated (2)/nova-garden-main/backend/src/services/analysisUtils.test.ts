import { describe, it, expect, vi, beforeAll } from "vitest";
import type { Issue } from "@prisma/client";

// analysisUtils.ts also exports DB-touching helpers (issueForProject,
// projectGraph) from the same file, so importing it at all pulls in
// prismaClient.ts, which constructs a real PrismaClient at module load.
// Stub it out — the functions under test here (active, severityWeight,
// overlap) are pure and never touch the database.
vi.mock("../utils/prismaClient", () => ({ prisma: {} }));

let active: typeof import("./analysisUtils").active;
let severityWeight: typeof import("./analysisUtils").severityWeight;
let overlap: typeof import("./analysisUtils").overlap;

beforeAll(async () => {
  ({ active, severityWeight, overlap } = await import("./analysisUtils"));
});

describe("active()", () => {
  it("treats OPEN, IN_PROGRESS, SPREAD, and CRITICAL as active", () => {
    for (const status of ["OPEN", "IN_PROGRESS", "SPREAD", "CRITICAL"]) {
      expect(active({ status } as Issue)).toBe(true);
    }
  });

  it("treats RESOLVED, PREVENTED, and CLOSED as not active", () => {
    for (const status of ["RESOLVED", "PREVENTED", "CLOSED"]) {
      expect(active({ status } as Issue)).toBe(false);
    }
  });
});

describe("severityWeight()", () => {
  it("ranks severities from LOW to CRITICAL in increasing order", () => {
    const weights = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(severityWeight);
    expect(weights).toEqual([...weights].sort((a, b) => a - b));
  });

  it("falls back to a default weight for an unknown severity string", () => {
    expect(severityWeight("NOT_A_REAL_SEVERITY")).toBe(10);
  });
});

describe("overlap()", () => {
  it("scores identical text as a perfect match", () => {
    const result = overlap("payment gateway timeout error", "payment gateway timeout error");
    expect(result.score).toBe(1);
  });

  it("scores completely unrelated text as zero", () => {
    const result = overlap("login form validation", "checkout payment refund");
    expect(result.score).toBe(0);
    expect(result.shared).toEqual([]);
  });

  it("returns the actual shared keywords for partial overlap", () => {
    const result = overlap("checkout payment timeout", "checkout payment retry");
    expect(result.shared.sort()).toEqual(["checkout", "payment"]);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1);
  });
});
