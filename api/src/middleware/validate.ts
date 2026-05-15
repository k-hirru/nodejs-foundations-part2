import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/AppError.js';

export function validateBody<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(result.error.errors[0]?.message ?? 'Validation error', 422, 'VALIDATION_ERROR'));
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
