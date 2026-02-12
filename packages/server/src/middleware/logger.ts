import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId =
    (req.headers['x-request-id'] as string) ||
    (req.headers['x-correlation-id'] as string) ||
    randomUUID();
  (req as Request & { id?: string }).id = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(
      `[${requestId}] ${req.method} ${req.path} ${String(res.statusCode)} ${String(duration)}ms`,
    );
  });
  next();
}
