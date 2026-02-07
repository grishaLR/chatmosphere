import { Router } from 'express';
import { LIMITS } from '@chatmosphere/shared';
import { getRoomMessages } from './service.js';
import type { Sql } from '../db/client.js';

export function messagesRouter(sql: Sql): Router {
  const router = Router();

  // GET /api/rooms/:id/messages — get message history for a room
  router.get('/:id/messages', async (req, res, next) => {
    try {
      const messages = await getRoomMessages(sql, req.params.id, {
        limit: Math.min(
          Math.max(Number(req.query.limit) || LIMITS.defaultPageSize, 1),
          LIMITS.maxPageSize,
        ),
        before: typeof req.query.before === 'string' ? req.query.before : undefined,
      });
      res.json({ messages });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
