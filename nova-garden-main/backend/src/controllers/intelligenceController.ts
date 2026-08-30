import { Request, Response, NextFunction } from "express";
import * as dna from "../services/bugDnaService";
import * as impact from "../services/impactAnalysisService";
import * as root from "../services/rootCauseService";
import * as simulation from "../services/simulationService";
import * as evolution from "../services/bugEvolutionService";
import * as autopsy from "../services/bugAutopsyService";
import * as memory from "../services/codebaseMemoryService";
import * as prevention from "../services/bugPreventionService";
import * as recommendation from "../services/developerRecommendationService";
import { assessRisk } from "../services/riskAssessmentService";
import { getSeason } from "../services/gardenSeasonService";
import { getProjectHealth } from "../services/projectHealthService";
import { getAnalytics } from "../services/analyticsService";
import * as notifications from "../services/notificationService";
import { prisma } from "../utils/prismaClient";
import { commentSchema, simulationSchema } from "../validators/schemas";

/**
 * Wraps an async handler so every route below can just return its result
 * (or throw an ApiError) without repeating try/catch boilerplate. Errors
 * are forwarded to Express's error-handling middleware via `next`.
 */
function run(fn: (req: Request) => Promise<unknown>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      next(err);
    }
  };
}

// --- Bug intelligence: read-only analysis endpoints -----------------------

/** GET /issues/:issueId/dna — similar issues by keyword/module/status overlap. */
export const bugDna = run((req) => dna.getBugDna(req.params.projectId, req.params.issueId));

/** GET /issues/:issueId/impact — dependency-graph blast radius for this bug. */
export const impactRadius = run((req) =>
  impact.getImpact(req.params.projectId, req.params.issueId)
);

/** GET /issues/:issueId/root-cause — traces likely origin through module dependencies. */
export const rootCause = run((req) =>
  root.investigateRootCause(req.params.projectId, req.params.issueId)
);

/** GET /issues/:issueId/evolution — how this bug's state has changed over time. */
export const evolutionState = run((req) => evolution.getEvolution(req.params.issueId));

/** GET /issues/:issueId/memory — similar previously-resolved issues and how they were fixed. */
export const codebaseMemory = run((req) =>
  memory.getMemory(req.params.projectId, req.params.issueId)
);

/** GET /issues/:issueId/recommendation — best-fit developer based on workload and history. */
export const developers = run((req) =>
  recommendation.recommendDeveloper(req.params.projectId, req.params.issueId)
);

/** GET /risk — project- or module-level projected risk score. */
export const risk = run((req) =>
  assessRisk(req.params.projectId, req.query.moduleId as string | undefined)
);

/** GET /season — the garden's current seasonal theme, derived from project health. */
export const season = run((req) => getSeason(req.params.projectId));

/** GET /health — aggregate project health snapshot. */
export const health = run((req) => getProjectHealth(req.params.projectId));

/** GET /analytics — issue/resolution trend data for dashboards. */
export const analytics = run((req) => getAnalytics(req.params.projectId));

/** GET /notifications — in-app notifications for the current user on this project. */
export const listNotifications = run((req) =>
  notifications.listNotifications(req.user!.userId, req.params.projectId)
);

// --- Bug intelligence: actions that write data -----------------------------

/** POST /issues/:issueId/simulations — deterministic what-if propagation over N days. */
export const simulate = run((req) => {
  const { durationDays } = simulationSchema.parse(req.body);
  return simulation.runSimulation(req.params.projectId, req.params.issueId, durationDays);
});

/** POST /issues/:issueId/autopsy — generates (or returns existing) post-mortem for a resolved bug. */
export const autopsyReport = run((req) =>
  autopsy.runAutopsy(req.params.projectId, req.params.issueId)
);

/** GET /issues/:issueId/preventions — prevention checklist for this issue, created on first access. */
export const getPreventions = run((req) => prevention.ensurePrevention(req.params.issueId));

/** POST /issues/:issueId/preventions/:preventionId/complete — marks a prevention action done. */
export const completePrevention = run((req) =>
  prevention.completePrevention(req.params.issueId, req.params.preventionId)
);

/** PATCH /notifications/:notificationId/read — marks a single notification as read. */
export const readNotification = run(async (req) => {
  await notifications.markRead(req.user!.userId, req.params.notificationId);
  return { ok: true };
});

/**
 * POST /issues/:issueId/comments — adds a comment and, if the issue is
 * assigned to someone other than the commenter, notifies the assignee.
 */
export const addComment = run(async (req) => {
  const { body } = commentSchema.parse(req.body);

  const comment = await prisma.issueComment.create({
    data: { body, issueId: req.params.issueId, authorId: req.user!.userId },
    include: { author: true },
  });

  const issue = await prisma.issue.findUnique({ where: { id: req.params.issueId } });
  const shouldNotifyAssignee = issue?.assigneeId && issue.assigneeId !== req.user!.userId;
  if (shouldNotifyAssignee) {
    await notifications.notify(
      issue!.assigneeId!,
      "New issue comment",
      `A comment was added to ${issue!.title}.`
    );
  }

  return comment;
});
