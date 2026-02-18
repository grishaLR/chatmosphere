import { createHmac } from 'node:crypto';

/**
 * Generate time-limited STUN/TURN credentials per the coturn REST API spec
 * (draft-uberti-behave-turn-rest). Username format: "{expiry}:{userId}".
 * coturn splits on the first colon to extract the timestamp, so DIDs
 * (which contain colons) are safe.
 */
export function generateIceCredentials(
  userId: string,
  sharedSecret: string,
  ttlSeconds: number,
): { username: string; credential: string } {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
  const username = `${String(expiry)}:${userId}`;
  const credential = createHmac('sha1', sharedSecret).update(username).digest('base64');
  return { username, credential };
}
