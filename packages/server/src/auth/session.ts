import { randomUUID } from 'crypto';

/**
 * MVP limitation: Sessions are in-memory only. They are lost on server restart
 * and cannot be shared across multiple instances. For production, persist
 * sessions to Redis or Postgres.
 */

export interface Session {
  did: string;
  handle: string;
  createdAt: number;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export class SessionStore {
  private sessions = new Map<string, Session>();
  private ttlMs: number;

  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  create(did: string, handle: string, ttlMs?: number): string {
    const token = randomUUID();
    const now = Date.now();
    this.sessions.set(token, {
      did,
      handle,
      createdAt: now,
      expiresAt: now + (ttlMs ?? this.ttlMs),
    });
    return token;
  }

  get(token: string): Session | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    if (Date.now() >= session.expiresAt) {
      this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  delete(token: string): void {
    this.sessions.delete(token);
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [token, session] of this.sessions) {
      if (now >= session.expiresAt) {
        this.sessions.delete(token);
        pruned++;
      }
    }
    return pruned;
  }
}
