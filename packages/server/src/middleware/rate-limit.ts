import type { Request, Response, NextFunction } from 'express';
import type { RateLimiter } from '../moderation/rate-limiter.js';

export function createRateLimitMiddleware(
  limiter: RateLimiter,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.did ?? req.ip ?? 'unknown';
    if (!limiter.check(key)) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    next();
  };
}
