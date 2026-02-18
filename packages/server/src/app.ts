import express, { type Express } from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import { createErrorHandler } from './middleware/error.js';
import { createRequestLogger } from './middleware/logger.js';
import { createRateLimitMiddleware } from './middleware/rate-limit.js';
import { roomsRouter } from './rooms/router.js';
import { messagesRouter } from './messages/router.js';
import { authRouter } from './auth/router.js';
import { createRequireAuth } from './auth/middleware.js';
import type { ChallengeStoreInterface } from './auth/challenge.js';
import { presenceRouter } from './presence/router.js';
import { communityRouter } from './community/router.js';
import { moderationRouter } from './moderation/router.js';
import { pollsRouter } from './polls/router.js';
import { dmRouter } from './dms/router.js';
import { translateRouter } from './translate/router.js';
import { gifRouter } from './giphy/router.js';
import { iceRouter } from './ice/router.js';
import type { Config } from './config.js';
import type { Sql } from './db/client.js';
import type { PresenceService } from './presence/service.js';
import type { SessionStore } from './auth/session-store.js';
import type { RateLimiterStore } from './moderation/rate-limiter-store.js';
import type { BlockService } from './moderation/block-service.js';
import type { GlobalBanService } from './moderation/global-ban-service.js';
import type { GlobalAllowlistService } from './moderation/global-allowlist-service.js';
import type { TranslateService } from './translate/service.js';

export function createApp(
  config: Config,
  sql: Sql,
  presenceService: PresenceService,
  sessions: SessionStore,
  rateLimiter: RateLimiterStore,
  authRateLimiter: RateLimiterStore,
  blockService: BlockService,
  globalBans: GlobalBanService,
  globalAllowlist: GlobalAllowlistService,
  challenges: ChallengeStoreInterface,
  translateService?: TranslateService | null,
  translateRateLimiter?: RateLimiterStore | null,
  supportedLanguages?: string[],
  giphyApiKey?: string | null,
  klipyApiKey?: string | null,
  gifRateLimiter?: RateLimiterStore | null,
): Express {
  const app = express();
  const requireAuth = createRequireAuth(sessions);

  // Middleware
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(corsMiddleware(config));
  app.use(createRequestLogger());

  // Health check (unprotected)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth routes (unprotected — login creates sessions; rate-limited by IP)
  app.use(
    '/api/auth',
    createRateLimitMiddleware(authRateLimiter),
    authRouter(sessions, config, challenges, globalBans, globalAllowlist),
  );

  // Protected API routes
  app.use('/api/rooms', requireAuth, createRateLimitMiddleware(rateLimiter), roomsRouter(sql));
  app.use('/api/rooms', requireAuth, createRateLimitMiddleware(rateLimiter), messagesRouter(sql));
  app.use('/api/rooms', requireAuth, createRateLimitMiddleware(rateLimiter), moderationRouter(sql));
  app.use('/api/rooms', requireAuth, createRateLimitMiddleware(rateLimiter), pollsRouter(sql));
  app.use('/api/presence', requireAuth, presenceRouter(presenceService, blockService, sql));
  app.use('/api/community', requireAuth, communityRouter(sql));
  app.use('/api/dms', requireAuth, createRateLimitMiddleware(rateLimiter), dmRouter(sql));
  app.use(
    '/api/ice-servers',
    requireAuth,
    iceRouter({
      stunUrl: config.STUN_URL,
      turnUrl: config.TURN_URL,
      sharedSecret: config.COTURN_SHARED_SECRET,
      ttlSeconds: config.ICE_CREDENTIAL_TTL_SECS,
    }),
  );

  // Translation routes (optional — only mounted when TRANSLATE_ENABLED=true)
  if (translateService && translateRateLimiter) {
    app.use(
      '/api/translate',
      requireAuth,
      translateRouter(translateService, translateRateLimiter, supportedLanguages ?? []),
    );
  }

  // GIF proxy (optional — mounted when either GIPHY_API_KEY or KLIPY_API_KEY is set)
  if ((giphyApiKey || klipyApiKey) && gifRateLimiter) {
    // Capabilities is public (client checks before login)
    app.get('/api/gif/capabilities', (_req, res) => {
      res.json({ giphy: !!giphyApiKey, klipy: !!klipyApiKey });
    });
    app.use(
      '/api/gif',
      requireAuth,
      gifRouter(giphyApiKey ?? null, klipyApiKey ?? null, gifRateLimiter),
    );
  }

  // Error handler (must be last)
  app.use(createErrorHandler(config));

  return app;
}
