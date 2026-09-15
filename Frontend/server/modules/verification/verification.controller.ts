// server/modules/verification/verification.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { VerificationService } from './verification.service';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess } from '../../utils/responseEnvelope';
import { rateLimiter } from '../../middleware/rateLimiter';

export const verificationRouter = Router();

// POST /api/verify/physical-1-to-n - 1:N physical product discovery and authentication
verificationRouter.post(
  '/physical-1-to-n',
  rateLimiter(60),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { image, location } = req.body;
      const result = await VerificationService.physicalCheck1ToN(
        image,
        location,
        req.user
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products/:id/physical-check - Targeted physical computer vision match
verificationRouter.post(
  '/:id/physical-check',
  rateLimiter(60),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { image, location } = req.body;
      const result = await VerificationService.physicalCheck(
        req.params.id,
        image,
        location,
        req.user
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/verify/:productId - Submit cooperative/reviewer audit
verificationRouter.post(
  '/:productId',
  requireAuth,
  requireRole(['COOPERATIVE', 'REVIEWER', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await VerificationService.verifyProduct(
        req.params.productId,
        req.body,
        req.user!
      );
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
);
