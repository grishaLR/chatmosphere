import { describe, it, expect, vi, afterEach } from 'vitest';
import { SessionStore } from './session.js';

describe('SessionStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws if TTL is <= 0', () => {
    expect(() => new SessionStore(0)).toThrow('Session TTL must be greater than 0');
    expect(() => new SessionStore(-1)).toThrow('Session TTL must be greater than 0');
  });

  it('create returns a UUID token', () => {
    const store = new SessionStore();
    const token = store.create('did:plc:abc', 'alice.bsky.social');
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('get returns the correct session', () => {
    const store = new SessionStore();
    const token = store.create('did:plc:abc', 'alice.bsky.social');
    const session = store.get(token);
    expect(session).toBeDefined();
    expect(session?.did).toBe('did:plc:abc');
    expect(session?.handle).toBe('alice.bsky.social');
  });

  it('get returns undefined for unknown token', () => {
    const store = new SessionStore();
    expect(store.get('nonexistent')).toBeUndefined();
  });

  it('get returns undefined for expired session', () => {
    const store = new SessionStore();
    const token = store.create('did:plc:abc', 'alice.bsky.social', 100);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
    expect(store.get(token)).toBeUndefined();
  });

  it('delete removes the session', () => {
    const store = new SessionStore();
    const token = store.create('did:plc:abc', 'alice.bsky.social');
    store.delete(token);
    expect(store.get(token)).toBeUndefined();
  });

  it('prune clears expired but keeps valid sessions', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const store = new SessionStore();
    const valid = store.create('did:plc:valid', 'valid.bsky.social', 10_000);
    store.create('did:plc:expired', 'expired.bsky.social', 100);

    vi.spyOn(Date, 'now').mockReturnValue(now + 200);
    const pruned = store.prune();

    expect(pruned).toBe(1);
    expect(store.get(valid)).toBeDefined();
  });

  it('uses custom TTL from constructor', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const store = new SessionStore(500);
    const token = store.create('did:plc:abc', 'alice.bsky.social');

    vi.spyOn(Date, 'now').mockReturnValue(now + 400);
    expect(store.get(token)).toBeDefined();

    vi.spyOn(Date, 'now').mockReturnValue(now + 600);
    expect(store.get(token)).toBeUndefined();
  });
});
