import { Router } from 'express';
import type { Sql } from '../db/client.js';
import { getCommunityList } from './queries.js';

export function communityRouter(sql: Sql): Router {
  const router = Router();

  // GET /api/community/:did
  router.get('/:did', async (req, res, next) => {
    try {
      const row = await getCommunityList(sql, req.params.did);
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
