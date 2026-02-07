import { Router } from 'express';
import { createDb } from '../db/client.js';
import { loadConfig } from '../config.js';
import { getBuddyList } from './queries.js';

export function buddylistRouter(): Router {
  const router = Router();
  const config = loadConfig();
  const sql = createDb(config.DATABASE_URL);

  // GET /api/buddylist/:did
  router.get('/:did', async (req, res, next) => {
    try {
      const row = await getBuddyList(sql, req.params.did);
      if (!row) {
        res.json({ groups: [] });
        return;
      }
      res.json({ groups: row.groups });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
