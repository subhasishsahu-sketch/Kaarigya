// server/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/responseEnvelope';
import { ERROR_CODES } from '../config/constants';

interface ValidationTargets {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export function validate(schemas: ValidationTargets) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message
        }));
        sendError(
          res,
          ERROR_CODES.VALIDATION_ERROR,
          'Input validation failed. Please check your submission fields.',
          422,
          issues
        );
        return;
      }
      sendError(res, ERROR_CODES.INTERNAL_ERROR, 'Internal validation error occurred.', 500);
    }
  };
}
