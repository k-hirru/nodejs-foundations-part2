import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code ?? 'INTERNAL_ERROR';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

interface IErrorResponse {
  success: false;
  message: string;
  code: string;
  stack?: string;
}

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (isAppError(error)) {
    const body: IErrorResponse = {
      success: false,
      message: error.message,
      code: error.code,
    };
    if (process.env['NODE_ENV'] !== 'production') {
      body.stack = error.stack;
    }
    res.status(error.statusCode).json(body);
    return;
  }

  const body: IErrorResponse = {
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  };
  if (process.env['NODE_ENV'] !== 'production') {
    body.stack = error instanceof Error ? error.stack : String(error);
  }
  res.status(500).json(body);
};
