import { Router } from 'express';
import { z } from 'zod';
import type { SessionStore } from './session.js';
import { verifyDidHandle } from './verify.js';
import { createRequireAuth } from './middleware.js';
import type { Config } from '../config.js';

const sessionBodySchema = z.object({
  did: z.string(),
  handle: z.string(),
});

export function authRouter(sessions: SessionStore, config: Config): Router {
  const router = Router();
  const requireAuth = createRequireAuth(sessions);

  // POST /api/auth/session — create session via handle→DID verification
  router.post('/session', async (req, res, next) => {
    try {
      const parsed = sessionBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request body', details: parsed.error.issues });
        return;
      }

      const { did, handle } = parsed.data;
      const verified = await verifyDidHandle(did, handle, config.PUBLIC_API_URL);
      if (!verified) {
        res.status(401).json({ error: 'Handle does not resolve to provided DID' });
        return;
      }

      const token = sessions.create(did, handle, config.SESSION_TTL_MS);
      res.status(201).json({ token, did, handle });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/auth/session — check current session
  router.get('/session', requireAuth, (req, res) => {
    res.json({ did: req.did, handle: req.handle });
  });

  // DELETE /api/auth/session — logout
  router.delete('/session', requireAuth, (req, res) => {
    const token = req.headers.authorization?.slice(7);
    if (token) sessions.delete(token);
    res.status(204).end();
  });

  return router;
}
