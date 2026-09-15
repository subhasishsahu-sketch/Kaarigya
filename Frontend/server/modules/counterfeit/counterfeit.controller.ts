// server/modules/counterfeit/counterfeit.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { CounterfeitService } from './counterfeit.service';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess } from '../../utils/responseEnvelope';

export const counterfeitRouter = Router();

// POST /api/listings/analyze - Analyze marketplace listing for counterfeit risk
counterfeitRouter.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CounterfeitService.analyzeMarketplaceListing(req.body, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/fraud-alerts/intelligence/dashboard - Fetch Layer 2 intelligence metrics
counterfeitRouter.get(
  '/intelligence/dashboard',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboard = await CounterfeitService.getIntelligenceDashboard();
      return sendSuccess(res, dashboard);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fraud-alerts/intelligence/incidents - Fetch Layer 2 incidents
counterfeitRouter.get(
  '/intelligence/incidents',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statusFilter = req.query.status as string | undefined;
      const incidents = await CounterfeitService.listIncidents(statusFilter);
      return sendSuccess(res, incidents);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fraud-alerts/intelligence/hotspots - Fetch Layer 2 geographical hotspots
counterfeitRouter.get(
  '/intelligence/hotspots',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotspots = await CounterfeitService.getHotspots();
      return sendSuccess(res, hotspots);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fraud-alerts - List fraud alerts in human review queue
counterfeitRouter.get(
  '/',
  requireAuth,
  requireRole(['COOPERATIVE', 'REVIEWER', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await CounterfeitService.listFraudAlerts();
      return sendSuccess(res, alerts);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/fraud-alerts/:id - Get fraud alert dossier
counterfeitRouter.get(
  '/:id',
  requireAuth,
  requireRole(['COOPERATIVE', 'REVIEWER', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await CounterfeitService.getFraudAlertById(req.params.id);
      return sendSuccess(res, alert);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/fraud-alerts/:id/review - Submit human reviewer decision
counterfeitRouter.post(
  '/:id/review',
  requireAuth,
  requireRole(['REVIEWER', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { decision, notes } = req.body;
      const updatedAlert = await CounterfeitService.reviewFraudAlert(
        req.params.id,
        decision,
        notes,
        req.user!
      );
      return sendSuccess(res, updatedAlert);
    } catch (err) {
      next(err);
    }
  }
);
