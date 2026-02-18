import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { generateIceCredentials } from './service.js';

describe('generateIceCredentials', () => {
  const secret = 'test-shared-secret';
  const did = 'did:plc:abc123';
  const ttl = 86400;

  it('returns username in {expiry}:{userId} format', () => {
    const { username } = generateIceCredentials(did, secret, ttl);
    const parts = username.split(':');
    // Expiry is the first part, rest is the DID
    const expiry = Number(parts[0]);
    expect(expiry).toBeGreaterThan(0);
    // Reconstruct DID from remaining parts
    const userId = parts.slice(1).join(':');
    expect(userId).toBe(did);
  });

  it('sets expiry in the future', () => {
    const { username } = generateIceCredentials(did, secret, ttl);
    const expiry = Number(username.split(':')[0]);
    const now = Math.floor(Date.now() / 1000);
    expect(expiry).toBeGreaterThan(now);
    expect(expiry).toBeLessThanOrEqual(now + ttl + 1);
  });

  it('produces a valid HMAC-SHA1 credential', () => {
    const { username, credential } = generateIceCredentials(did, secret, ttl);
    const expected = createHmac('sha1', secret).update(username).digest('base64');
    expect(credential).toBe(expected);
  });

  it('produces different credentials for different users', () => {
    const a = generateIceCredentials('did:plc:user-a', secret, ttl);
    const b = generateIceCredentials('did:plc:user-b', secret, ttl);
    expect(a.credential).not.toBe(b.credential);
  });

  it('produces different credentials for different secrets', () => {
    const a = generateIceCredentials(did, 'secret-one', ttl);
    const b = generateIceCredentials(did, 'secret-two', ttl);
    expect(a.credential).not.toBe(b.credential);
  });
});
