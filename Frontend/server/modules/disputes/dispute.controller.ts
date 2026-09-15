// server/modules/disputes/dispute.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { DisputeService } from './dispute.service';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess } from '../../utils/responseEnvelope';

export const disputeRouter = Router();

// GET /api/disputes - List disputes
disputeRouter.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const disputes = await DisputeService.listDisputes();
      return sendSuccess(res, disputes);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/disputes - Lodge new dispute
disputeRouter.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dispute = await DisputeService.createDispute(req.body, req.user!);
      return sendSuccess(res, dispute, 201);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/disputes/:id/resolve - Resolve dispute
disputeRouter.post(
  '/:id/resolve',
  requireAuth,
  requireRole(['REVIEWER', 'ADMIN', 'COOPERATIVE']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resolved = await DisputeService.resolveDispute(req.params.id, req.body, req.user!);
      return sendSuccess(res, resolved);
    } catch (err) {
      next(err);
    }
  }
);
