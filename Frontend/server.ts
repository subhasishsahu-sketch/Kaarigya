// server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { authContext } from './server/middleware/authContext';
import { errorHandler } from './server/middleware/errorHandler';

import { authRouter } from './server/modules/auth/auth.controller';
import { productRouter } from './server/modules/products/product.controller';
import { passportRouter } from './server/modules/passports/passport.controller';
import { verificationRouter } from './server/modules/verification/verification.controller';
import { counterfeitRouter } from './server/modules/counterfeit/counterfeit.controller';
import { compensationRouter } from './server/modules/compensation/compensation.controller';
import { disputeRouter } from './server/modules/disputes/dispute.controller';
import { provenanceRouter } from './server/modules/provenance/provenance.controller';
import { artisanRouter } from './server/modules/artisans/artisan.controller';
import { MLClientService } from './server/modules/ai/mlClient.service';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Global Auth Context Extraction (derives user identity & authoritative role)
  app.use(authContext);

  // Health check
  app.get('/api/health', async (req, res) => {
    const mlHealth = await MLClientService.checkHealth();
    res.json({
      status: 'healthy',
      mlService: {
        status: mlHealth.status === 'offline' ? 'offline' : 'healthy',
        modelLoaded: mlHealth.model_loaded,
        registeredProducts: mlHealth.registered_products_count
      },
      platform: 'Kaarigya Traditional Craft Digital Passport & Trust Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount REST Modules under /api/*
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/passports', passportRouter);
  app.use('/api/verify', verificationRouter);
  app.use('/api/products', verificationRouter); // for POST /api/products/:id/physical-check
  app.use('/api/listings', counterfeitRouter);
  app.use('/api/fraud-alerts', counterfeitRouter);
  app.use('/api/products', compensationRouter); // for /api/products/:id/compensation
  app.use('/api/disputes', disputeRouter);
  app.use('/api/products', provenanceRouter); // for /api/products/:id/provenance
  app.use('/api/artisans', artisanRouter);

  // Error Handler for API routes
  app.use(errorHandler);

  // Vite middleware for frontend integration (SPA)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ S8 Traditional Craft Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
});
