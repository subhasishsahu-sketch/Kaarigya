// server/modules/passports/passport.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PassportService } from './passport.service';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess } from '../../utils/responseEnvelope';
import { rateLimiter } from '../../middleware/rateLimiter';

export const passportRouter = Router();

// POST /api/passports - Issue digital passport
passportRouter.post(
  '/',
  requireAuth,
  requireRole(['COOPERATIVE', 'REVIEWER', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, nfcTagUid } = req.body;
      const passport = await PassportService.issuePassport(productId, req.user!, nfcTagUid);
      return sendSuccess(res, passport, 201);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/passports/:id - Get public verification passport
passportRouter.get('/:id', rateLimiter(120), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const passportData = await PassportService.getPublicPassport(req.params.id);
    return sendSuccess(res, passportData);
  } catch (err) {
    next(err);
  }
});

// GET /api/passports/qr/:qrHash - Resolve QR code verification
passportRouter.get('/qr/:qrHash', rateLimiter(120), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const passportData = await PassportService.getPublicPassport(req.params.qrHash);
    return sendSuccess(res, passportData);
  } catch (err) {
    next(err);
  }
});
