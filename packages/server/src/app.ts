import express, { type Express } from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/error.js';
import { requestLogger } from './middleware/logger.js';
import { roomsRouter } from './rooms/router.js';
import { messagesRouter } from './messages/router.js';
import { authRouter } from './auth/router.js';
import { presenceRouter } from './presence/router.js';
import { buddylistRouter } from './buddylist/router.js';
import type { Config } from './config.js';

export function createApp(config: Config): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware(config));
  app.use(requestLogger);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/auth', authRouter());
  app.use('/api/rooms', roomsRouter());
  app.use('/api/rooms', messagesRouter());
  app.use('/api/presence', presenceRouter());
  app.use('/api/buddylist', buddylistRouter());

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
