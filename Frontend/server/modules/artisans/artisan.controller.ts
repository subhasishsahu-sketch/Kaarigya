// server/modules/artisans/artisan.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../../config/supabase';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess, sendError } from '../../utils/responseEnvelope';
import { ERROR_CODES } from '../../config/constants';
import { Artisan } from '../../types';

export const artisanRouter = Router();

/**
 * Generates a unique, authoritative Kalakriti Artisan ID.
 * Format: KAL-ART-XXXXX (e.g. KAL-ART-8F29X)
 */
function generateKalakritiArtisanId(): string {
  const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const bytes = crypto.randomBytes(5);
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += CHARSET[bytes[i] % CHARSET.length];
    }
    const id = `KAL-ART-${code}`;
    const exists = Array.from(db.artisans.values()).some(a => a.kalakritiArtisanId === id);
    if (!exists) return id;
  }
  return `KAL-ART-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

// GET /api/artisans/cooperatives - List registered Cooperatives/Guilds for registration
artisanRouter.get('/cooperatives', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = Array.from(db.cooperatives.values()).map(c => ({
      id: c.id,
      name: c.name,
      registrationNo: c.registrationNo,
      regionState: c.regionState,
      district: c.district,
      memberCount: c.memberCount
    }));
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
});

// GET /api/artisans/pending - List pending artisan registration requests (Filtered strictly per Cooperative)
artisanRouter.get('/pending', requireAuth, requireRole(['COOPERATIVE', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCoopId = req.user!.role === 'COOPERATIVE' ? req.user!.id : (req.query.cooperativeId as string || req.user!.cooperativeId);
    
    const allArtisans = Array.from(db.artisans.values());
    const pendingRequests = allArtisans.filter(artisan => {
      if (artisan.verificationStatus !== 'PENDING') return false;
      // If requested by a Cooperative user, enforce strict Guild isolation
      if (userCoopId) {
        return artisan.cooperativeId === userCoopId;
      }
      return true;
    });

    return sendSuccess(res, pendingRequests);
  } catch (err) {
    next(err);
  }
});

// GET /api/artisans - List all artisans
artisanRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = Array.from(db.artisans.values());
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
});

// GET /api/artisans/:id - Get artisan profile
artisanRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artisan = db.artisans.get(req.params.id);
    if (!artisan) {
      return sendError(res, ERROR_CODES.NOT_FOUND, `Artisan '${req.params.id}' not found.`, 404);
    }
    return sendSuccess(res, artisan);
  } catch (err) {
    next(err);
  }
});

// POST /api/artisans/:id/accept - Cooperative accepts pending artisan, status = VERIFIED, generates Kalakriti Artisan ID
artisanRouter.post('/:id/accept', requireAuth, requireRole(['COOPERATIVE', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artisan = db.artisans.get(req.params.id);
    if (!artisan) {
      return sendError(res, ERROR_CODES.NOT_FOUND, `Artisan '${req.params.id}' not found.`, 404);
    }

    // Enforce Guild routing security
    if (req.user!.role === 'COOPERATIVE' && artisan.cooperativeId !== req.user!.id && artisan.cooperativeId !== req.user!.cooperativeId) {
      return sendError(res, ERROR_CODES.FORBIDDEN, 'You can only approve artisan registration requests submitted to your Cooperative.', 403);
    }

    // Generate unique Kalakriti Artisan ID if not already present
    const kalakritiId = artisan.kalakritiArtisanId || generateKalakritiArtisanId();

    const updated: Artisan = {
      ...artisan,
      verificationStatus: 'VERIFIED',
      kalakritiArtisanId: kalakritiId
    };

    db.artisans.set(req.params.id, updated);
    return sendSuccess(res, {
      artisan: updated,
      kalakritiArtisanId: kalakritiId,
      message: `Artisan '${artisan.fullName}' verified successfully. Kalakriti Artisan ID '${kalakritiId}' generated and linked.`
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/artisans/:id/reject - Cooperative rejects pending artisan, status = REJECTED, no Kalakriti Artisan ID
artisanRouter.post('/:id/reject', requireAuth, requireRole(['COOPERATIVE', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artisan = db.artisans.get(req.params.id);
    if (!artisan) {
      return sendError(res, ERROR_CODES.NOT_FOUND, `Artisan '${req.params.id}' not found.`, 404);
    }

    // Enforce Guild routing security
    if (req.user!.role === 'COOPERATIVE' && artisan.cooperativeId !== req.user!.id && artisan.cooperativeId !== req.user!.cooperativeId) {
      return sendError(res, ERROR_CODES.FORBIDDEN, 'You can only reject artisan registration requests submitted to your Cooperative.', 403);
    }

    const updated: Artisan = {
      ...artisan,
      verificationStatus: 'REJECTED',
      kalakritiArtisanId: undefined
    };

    db.artisans.set(req.params.id, updated);
    return sendSuccess(res, {
      artisan: updated,
      message: `Artisan registration request for '${artisan.fullName}' rejected. Product registration access remains blocked.`
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/artisans/:id - Update artisan profile
artisanRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'ADMIN' && req.user!.id !== req.params.id) {
      return sendError(res, ERROR_CODES.FORBIDDEN, 'You can only update your own artisan profile.', 403);
    }

    const artisan = db.artisans.get(req.params.id);
    if (!artisan) {
      return sendError(res, ERROR_CODES.NOT_FOUND, `Artisan '${req.params.id}' not found.`, 404);
    }

    const updated: Artisan = {
      ...artisan,
      ...req.body,
      craftSpecialties: req.body.craftSpecialties || artisan.craftSpecialties,
      experienceYears: req.body.experienceYears ?? artisan.experienceYears,
      preferredLang: req.body.preferredLang || artisan.preferredLang
    };

    db.artisans.set(req.params.id, updated);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
});
