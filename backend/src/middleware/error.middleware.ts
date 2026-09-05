import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} does not exist.`,
    },
  });
};

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: status === 500 ? 'An unexpected error occurred.' : err.message || 'Request failed.',
    },
  });
};
