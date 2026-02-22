import { Router } from 'express';
import type { IceServerConfig } from '@protoimsg/shared';
import { generateIceCredentials } from './service.js';
import { createLogger } from '../logger.js';
import { incIceUnavailable } from '../metrics.js';

const log = createLogger('ice');

let fallbackWarned = false;

interface IceRouterConfig {
  stunUrl?: string;
  turnUrl?: string;
  sharedSecret?: string;
  ttlSeconds: number;
}

export function iceRouter(config: IceRouterConfig): Router {
  const router = Router();

  router.get('/', (req, res) => {
    if (!config.sharedSecret || !config.stunUrl) {
      if (!fallbackWarned) {
        log.warn('COTURN_SHARED_SECRET or STUN_URL not configured — video calls unavailable');
        fallbackWarned = true;
      }
      incIceUnavailable();
      res.status(503).json({ error: 'ICE servers not configured', iceServers: [] });
      return;
    }

    const did = req.did ?? '';
    const { username, credential } = generateIceCredentials(
      did,
      config.sharedSecret,
      config.ttlSeconds,
    );

    const iceServers: IceServerConfig[] = [
      {
        urls: config.stunUrl,
        username,
        credential,
      },
    ];

    if (config.turnUrl) {
      iceServers.push({
        urls: config.turnUrl,
        username,
        credential,
      });
    }

    res.json({ iceServers });
  });

  return router;
}
