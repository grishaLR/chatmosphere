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
function getHandler(router: ReturnType<typeof iceRouter>) {
  const layer = router.stack.find(isGetRoot);
  if (!layer) throw new Error('GET / handler not found');
  return layer.route.stack[0].handle as (req: Request, res: Response) => void;
}

function mockReqRes(did?: string) {
  const req = { did } as unknown as Request;
  const json = vi.fn();
  const res = { json } as unknown as Response;
  return { req, res, json };
}

function parseBody(json: ReturnType<typeof vi.fn>): IceResponse {
  return json.mock.calls[0][0] as IceResponse;
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

    const body = parseBody(json);
    expect(body.iceServers).toHaveLength(2);
    expect(body.iceServers[0].urls).toContain('stun:stun.l.google.com:19302');
  });

  it('returns STUN-only when TURN_URL not set', () => {
    const router = iceRouter({ stunUrl, sharedSecret, ttlSeconds: 86400 });
    const handler = getHandler(router);
    const { req, res, json } = mockReqRes('did:plc:test');

    handler(req, res);

    const body = parseBody(json);
    expect(body.iceServers).toHaveLength(1);
    expect(body.iceServers[0].urls).toBe(stunUrl);
    expect(body.iceServers[0].username).toBeDefined();
    expect(body.iceServers[0].credential).toBeDefined();
  });

  it('returns both STUN and TURN entries when TURN_URL is set', () => {
    const router = iceRouter({ stunUrl, turnUrl, sharedSecret, ttlSeconds: 86400 });
    const handler = getHandler(router);
    const { req, res, json } = mockReqRes('did:plc:test');

    handler(req, res);

    const body = parseBody(json);
    expect(body.iceServers).toHaveLength(2);

    // First entry: STUN
    expect(body.iceServers[0].urls).toBe(stunUrl);

    // Second entry: TURN (UDP + TCP)
    const turn = body.iceServers[1];
    expect(turn.urls).toEqual([turnUrl, `${turnUrl}?transport=tcp`]);
    expect(turn.username).toBe(body.iceServers[0].username);
    expect(turn.credential).toBe(body.iceServers[0].credential);
  });
});
