// server/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing in production environment!');
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DEMO_MODE: z.string().default('true'),
  ML_SERVICE_URL: z.string().default('http://127.0.0.1:8000'),
  GEMINI_API_KEY: z.string().optional(),
  APP_URL: z.string().default('http://localhost:3001'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  JWT_SECRET: z.string().default(process.env.JWT_SECRET || (isProduction ? '' : 'kaarigya-dpp-default-dev-secret-key'))
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
      DEMO_MODE: process.env.DEMO_MODE || 'true',
      ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      APP_URL: process.env.APP_URL || 'http://localhost:3001',
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      JWT_SECRET: process.env.JWT_SECRET || (isProduction ? '' : 'kaarigya-dpp-default-dev-secret-key')
    };
