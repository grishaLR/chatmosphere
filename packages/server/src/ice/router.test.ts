import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { IceServerConfig } from '@protoimsg/shared';
import { iceRouter } from './router.js';

interface IceResponse {
  iceServers: IceServerConfig[];
}

interface RouteLayer {
  route: { path: string; methods: { get: boolean }; stack: [{ handle: unknown }] };
}

function isGetRoot(l: unknown): l is RouteLayer {
  const obj = l as Record<string, unknown>;
  if (!obj.route || typeof obj.route !== 'object') return false;
  const route = obj.route as RouteLayer['route'];
  return route.path === '/' && route.methods.get;
}

/** Extract the GET / handler from the router */
function getHandler(router: ReturnType<typeof iceRouter>): (req: Request, res: Response) => void {
  for (const layer of router.stack) {
    if (isGetRoot(layer)) {
      return layer.route.stack[0].handle as (req: Request, res: Response) => void;
    }
  }
  throw new Error('GET / handler not found');
}

function mockReqRes(did?: string) {
  const req = { did } as unknown as Request;
  const json = vi.fn();
  const res = { json } as unknown as Response;
  return { req, res, json };
}

function parseBody(json: ReturnType<typeof vi.fn>): IceResponse {
  const call = json.mock.calls[0] as unknown[];
  return call[0] as IceResponse;
}

function at(servers: IceServerConfig[], index: number): IceServerConfig {
  const entry = servers[index];
  if (!entry) throw new Error(`No ICE server at index ${String(index)}`);
  return entry;
}

describe('iceRouter', () => {
  const sharedSecret = 'test-secret';
  const stunUrl = 'stun:turn.example.com:3478';
  const turnUrl = 'turn:turn.example.com:3478';

  it('returns Google STUN fallback when not configured', () => {
    const router = iceRouter({ ttlSeconds: 86400 });
    const handler = getHandler(router);
    const { req, res, json } = mockReqRes('did:plc:test');

    handler(req, res);

    const { iceServers } = parseBody(json);
    expect(iceServers).toHaveLength(2);
    expect(at(iceServers, 0).urls).toContain('stun:stun.l.google.com:19302');
  });

  it('returns STUN-only when TURN_URL not set', () => {
    const router = iceRouter({ stunUrl, sharedSecret, ttlSeconds: 86400 });
    const handler = getHandler(router);
    const { req, res, json } = mockReqRes('did:plc:test');

    handler(req, res);

    const { iceServers } = parseBody(json);
    expect(iceServers).toHaveLength(1);
    const stun = at(iceServers, 0);
    expect(stun.urls).toBe(stunUrl);
    expect(stun.username).toBeDefined();
    expect(stun.credential).toBeDefined();
  });

  it('returns both STUN and TURN entries when TURN_URL is set', () => {
    const router = iceRouter({ stunUrl, turnUrl, sharedSecret, ttlSeconds: 86400 });
    const handler = getHandler(router);
    const { req, res, json } = mockReqRes('did:plc:test');

    handler(req, res);

    const { iceServers } = parseBody(json);
    expect(iceServers).toHaveLength(2);

    const stun = at(iceServers, 0);
    const turn = at(iceServers, 1);

    // First entry: STUN
    expect(stun.urls).toBe(stunUrl);

    // Second entry: TURN (UDP + TCP)
    expect(turn.urls).toEqual([turnUrl, `${turnUrl}?transport=tcp`]);
    expect(turn.username).toBe(stun.username);
    expect(turn.credential).toBe(stun.credential);
  });
});
