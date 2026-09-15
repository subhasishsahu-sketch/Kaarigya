// server/modules/provenance/provenance.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { ProvenanceService } from './provenance.service';
import { sendSuccess } from '../../utils/responseEnvelope';

export const provenanceRouter = Router();

// GET /api/products/:id/provenance - Full cryptographic provenance chain
provenanceRouter.get('/:id/provenance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audit = await ProvenanceService.getProductProvenance(req.params.id);
    return sendSuccess(res, audit);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/provenance/validate - Validates hash chain integrity on-demand
provenanceRouter.post('/:id/provenance/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const audit = await ProvenanceService.getProductProvenance(req.params.id);
    return sendSuccess(res, {
      productId: req.params.id,
      isChainValid: audit.isChainValid,
      totalEvents: audit.totalEvents,
      brokenIndex: audit.brokenIndex,
      status: audit.isChainValid ? 'PROVENANCE_INTEGRITY_VERIFIED' : 'PROVENANCE_TAMPER_DETECTED'
    });
  } catch (err) {
    next(err);
  }
});
