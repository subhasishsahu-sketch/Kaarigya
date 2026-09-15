import { Router, Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { VerificationService } from '../verification/verification.service';
import { extractStructuredCraftData } from '../ai/gemini.service';
import { validate } from '../../middleware/validate';
import { createProductSchema, updateProductSchema, aiExtractSchema } from './product.schema';
import { requireAuth, requireRole } from '../../middleware/rbacGuard';
import { sendSuccess, sendError } from '../../utils/responseEnvelope';
import { db } from '../../config/supabase';
import { ERROR_CODES } from '../../config/constants';

export const productRouter = Router();

// GET /api/products - List all products
productRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductService.listProducts();
    return sendSuccess(res, products);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/ai-extract - Multilingual voice/text extraction to structured draft
productRouter.post(
  '/ai-extract',
  requireAuth,
  validate({ body: aiExtractSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === 'ARTISAN') {
        const artisan = db.artisans.get(req.user.id);
        if (!artisan || artisan.verificationStatus !== 'VERIFIED' || !artisan.kalakritiArtisanId) {
          return sendError(
            res, 
            ERROR_CODES.FORBIDDEN, 
            `Product registration is blocked. Artisan status is '${artisan?.verificationStatus || 'UNVERIFIED'}'. Cooperative/Guild approval and Kalakriti Artisan ID required.`, 
            403
          );
        }
      }
      const { text, audioBase64, audioMimeType } = req.body;
      const draft = await extractStructuredCraftData(text, audioBase64, audioMimeType);
      return sendSuccess(res, {
        draft,
        notice: 'AI-assisted draft extracted. Please review and modify any details before finalizing registration.'
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/products/lookup/:productId - Public lookup by 7-char ID or product code
productRouter.get('/lookup/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.getProductBy7CharId(req.params.productId);
    return sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Get product details (supports internal UUID or 7-character Product ID)
productRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let product: any;
    try {
      product = await ProductService.getProductById(req.params.id, req.user);
    } catch {
      product = await ProductService.getProductBy7CharId(req.params.id);
    }
    return sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Register new craft product
productRouter.post(
  '/',
  requireAuth,
  requireRole(['ARTISAN', 'COOPERATIVE', 'ADMIN']),
  validate({ body: createProductSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.createProduct(req.body, req.user!);
      return sendSuccess(res, product, 201);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/products/:id - Update product
productRouter.patch(
  '/:id',
  requireAuth,
  validate({ body: updateProductSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body, req.user!);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products/:id/evidence - Add workshop/evidence photo
productRouter.post(
  '/:id/evidence',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evidence = await ProductService.addEvidence(req.params.id, req.body, req.user!);
      return sendSuccess(res, evidence, 201);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products/:id/physical-check - Targeted physical computer vision match
productRouter.post(
  '/:id/physical-check',
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
