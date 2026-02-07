import type { Request, Response, NextFunction } from 'express';
import type { Config } from '../config.js';

export function createErrorHandler(
  config: Config,
): (err: unknown, req: Request, res: Response, next: NextFunction) => void {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Unhandled error:', err);

    const message =
      config.NODE_ENV !== 'production' && err instanceof Error
        ? err.message
        : 'Internal server error';

    res.status(500).json({ error: message });
  };
}
