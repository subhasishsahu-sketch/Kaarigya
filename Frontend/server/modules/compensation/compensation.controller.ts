// server/modules/compensation/compensation.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { CompensationService } from './compensation.service';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess } from '../../utils/responseEnvelope';

export const compensationRouter = Router();

// GET /api/products/:id/compensation - Retrieve transparent compensation records
compensationRouter.get('/:id/compensation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await CompensationService.getCompensation(req.params.id);
    return sendSuccess(res, record);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/compensation - Record sale and fair artisan payout split
compensationRouter.post(
  '/:id/compensation',
  requireAuth,
  requireRole(['COOPERATIVE', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await CompensationService.recordSale(req.params.id, req.body, req.user!);
      return sendSuccess(res, record, 201);
    } catch (err) {
      next(err);
    }
  }
);
