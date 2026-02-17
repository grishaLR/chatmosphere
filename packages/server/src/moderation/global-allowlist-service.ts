import type { Sql } from '../db/client.js';
import { createLogger } from '../logger.js';

const log = createLogger('global-allowlist');

/**
 * In-memory Set of globally allowed DIDs, backed by the `global_allowlist` table.
 * When enabled, only DIDs in this set can authenticate.
 * When disabled, all DIDs are allowed (isAllowed always returns true).
 */
export class GlobalAllowlistService {
  private allowed = new Set<string>();
  private readonly enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  /** Load all allowed DIDs from the database into memory. */
  async load(sql: Sql): Promise<void> {
    const rows = await sql<{ did: string }[]>`SELECT did FROM global_allowlist`;
    this.allowed.clear();
    for (const row of rows) {
      this.allowed.add(row.did);
    }
    log.info({ count: this.allowed.size, enabled: this.enabled }, 'Loaded global allowlist');
  }

  /** O(1) check whether a DID is allowed. Returns true when disabled. */
  isAllowed(did: string): boolean {
    if (!this.enabled) return true;
    return this.allowed.has(did);
  }

  /** Add a DID to the allowlist and persist to the database. */
  async add(
    sql: Sql,
    did: string,
    handle: string | null,
    reason: string | null,
    addedBy: string,
  ): Promise<void> {
    await sql`
      INSERT INTO global_allowlist (did, handle, reason, added_by)
      VALUES (${did}, ${handle}, ${reason}, ${addedBy})
      ON CONFLICT (did) DO UPDATE SET
        handle = EXCLUDED.handle,
        reason = EXCLUDED.reason,
        added_by = EXCLUDED.added_by
    `;
    this.allowed.add(did);
    log.info({ did, handle, reason }, 'Allowlist entry added');
  }

  /** Remove a DID from the allowlist and delete from the database. */
  async remove(sql: Sql, did: string): Promise<void> {
    await sql`DELETE FROM global_allowlist WHERE did = ${did}`;
    this.allowed.delete(did);
    log.info({ did }, 'Allowlist entry removed');
  }
}
