import { Router } from 'express';
import type { IceServerConfig } from '@protoimsg/shared';
import { generateIceCredentials } from './service.js';
import { createLogger } from '../logger.js';

const log = createLogger('ice');

const GOOGLE_STUN_FALLBACK: IceServerConfig[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

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
        log.warn(
          'COTURN_SHARED_SECRET or STUN_URL not configured — returning Google STUN fallback',
        );
        fallbackWarned = true;
      }
      res.json({ iceServers: GOOGLE_STUN_FALLBACK });
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
        urls: [config.turnUrl, `${config.turnUrl}?transport=tcp`],
        username,
        credential,
      });
    }

    res.json({ iceServers });
  });

  return router;
}
