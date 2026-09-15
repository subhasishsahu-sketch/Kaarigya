// server/middleware/rbacGuard.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { sendError } from '../utils/responseEnvelope';
import { ERROR_CODES } from '../config/constants';

/**
 * Ensures the request is from an authenticated user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      'Authentication required. Please supply a valid authorization token.',
      401
    );
    return;
  }
  next();
}

/**
 * Enforces that the authenticated user possesses at least one of the allowed roles.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required. Please supply a valid authorization token.',
        401
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        ERROR_CODES.FORBIDDEN,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`,
        403
      );
      return;
    }

    next();
  };
}
