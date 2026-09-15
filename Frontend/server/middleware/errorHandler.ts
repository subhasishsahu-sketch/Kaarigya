// server/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseEnvelope';
import { ERROR_CODES } from '../config/constants';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  console.error('💥 Unhandled Application Error:', {
    path: req.path,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  sendError(
    res,
    ERROR_CODES.INTERNAL_ERROR,
    'An unexpected internal server error occurred.',
    500,
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
}
