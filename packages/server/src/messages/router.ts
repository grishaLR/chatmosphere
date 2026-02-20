import { Router } from 'express';
import { LIMITS, ERROR_CODES } from '@protoimsg/shared';
import { getChannelMessages, getThreadMessagesByRoot, getReplyCounts } from './service.js';
import { getDefaultChannel } from '../channels/queries.js';
import type { Sql } from '../db/client.js';

export function messagesRouter(sql: Sql): Router {
  const router = Router();

  // GET /api/rooms/:id/channels/:channelId/messages — channel messages
  router.get('/:id/channels/:channelId/messages', async (req, res, next) => {
    try {
      const messages = await getChannelMessages(sql, req.params.channelId, {
        limit: Math.min(
          Math.max(Number(req.query.limit) || LIMITS.defaultPageSize, 1),
          LIMITS.maxPageSize,
        ),
        before: typeof req.query.before === 'string' ? req.query.before : undefined,
      });

      const replyCounts = await getReplyCounts(sql, messages);

      res.json({ messages, replyCounts });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/rooms/:id/channels/:channelId/threads?root=<at-uri>
  router.get('/:id/channels/:channelId/threads', async (req, res, next) => {
    try {
      const rootUri = req.query.root;
      if (typeof rootUri !== 'string' || !rootUri.startsWith('at://')) {
        res.status(400).json({
          error: 'Missing or invalid "root" query param (expected AT-URI)',
          errorCode: ERROR_CODES.INVALID_INPUT,
        });
        return;
      }

      const messages = await getThreadMessagesByRoot(sql, req.params.channelId, rootUri, {
        limit: Math.min(Math.max(Number(req.query.limit) || 200, 1), 500),
      });

      res.json({ messages });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/rooms/:id/messages — fallback: default channel messages
  router.get('/:id/messages', async (req, res, next) => {
    try {
      const defaultChannel = await getDefaultChannel(sql, req.params.id);
      if (!defaultChannel) {
        res.json({ messages: [], replyCounts: {} });
        return;
      }

      const messages = await getChannelMessages(sql, defaultChannel.id, {
        limit: Math.min(
          Math.max(Number(req.query.limit) || LIMITS.defaultPageSize, 1),
          LIMITS.maxPageSize,
        ),
        before: typeof req.query.before === 'string' ? req.query.before : undefined,
      });

      const replyCounts = await getReplyCounts(sql, messages);

      res.json({ messages, replyCounts });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/rooms/:id/threads?root=<at-uri> — fallback: default channel threads
  router.get('/:id/threads', async (req, res, next) => {
    try {
      const rootUri = req.query.root;
      if (typeof rootUri !== 'string' || !rootUri.startsWith('at://')) {
        res.status(400).json({
          error: 'Missing or invalid "root" query param (expected AT-URI)',
          errorCode: ERROR_CODES.INVALID_INPUT,
        });
        return;
      }

      const defaultChannel = await getDefaultChannel(sql, req.params.id);
      if (!defaultChannel) {
        res.json({ messages: [] });
        return;
      }

      const messages = await getThreadMessagesByRoot(sql, defaultChannel.id, rootUri, {
        limit: Math.min(Math.max(Number(req.query.limit) || 200, 1), 500),
      });

      res.json({ messages });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
