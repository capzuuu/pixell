import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled API Error:', err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong. Please try again later.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
