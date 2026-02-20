import { Router } from 'express';
import { ERROR_CODES } from '@protoimsg/shared';
import { getChannelsByRoom, getChannelById } from './queries.js';
import type { Sql } from '../db/client.js';

export function channelsRouter(sql: Sql): Router {
  const router = Router();

  // GET /api/rooms/:id/channels — list channels for a room
  router.get('/:id/channels', async (req, res, next) => {
    try {
      const channels = await getChannelsByRoom(sql, req.params.id);
      res.json({ channels });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/rooms/:id/channels/:channelId — single channel
  router.get('/:id/channels/:channelId', async (req, res, next) => {
    try {
      const channel = await getChannelById(sql, req.params.channelId);
      if (!channel || channel.room_id !== req.params.id) {
        res.status(404).json({ error: 'Channel not found', errorCode: ERROR_CODES.NOT_FOUND });
        return;
      }
      res.json({ channel });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
