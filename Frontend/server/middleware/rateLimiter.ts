// server/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseEnvelope';
import { ERROR_CODES } from '../config/constants';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter for public endpoints (verification, QR lookups, physical CV checks).
 */
export function rateLimiter(maxRequests = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();

    const record = ipRequestMap.get(ip);

    if (!record || now > record.resetTime) {
      ipRequestMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      sendError(
        res,
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many requests to verification service. Please wait a moment before retrying.',
        429
      );
      return;
    }

    record.count += 1;
    next();
  };
}
