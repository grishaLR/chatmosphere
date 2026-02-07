import type { Sql } from '../db/client.js';

export interface BuddyListRow {
  did: string;
  groups: unknown; // JSONB
  updated_at: Date;
  indexed_at: Date;
}

export async function upsertBuddyList(
  sql: Sql,
  input: { did: string; groups: unknown },
): Promise<void> {
  await sql`
    INSERT INTO buddy_lists (did, groups, updated_at, indexed_at)
    VALUES (${input.did}, ${JSON.stringify(input.groups)}, NOW(), NOW())
    ON CONFLICT (did) DO UPDATE SET
      groups = ${JSON.stringify(input.groups)},
      updated_at = NOW(),
      indexed_at = NOW()
  `;
}

export async function syncBuddyMembers(
  sql: Sql,
  ownerDid: string,
  members: Array<{ did: string; addedAt: string }>,
): Promise<void> {
  await sql`DELETE FROM buddy_members WHERE owner_did = ${ownerDid}`;

  if (members.length > 0) {
    const rows = members.map((m) => ({
      owner_did: ownerDid,
      buddy_did: m.did,
      added_at: m.addedAt,
    }));
    await sql`INSERT INTO buddy_members ${sql(rows)}`;
  }
}

export async function getBuddyList(sql: Sql, did: string): Promise<BuddyListRow | undefined> {
  const rows = await sql<BuddyListRow[]>`
    SELECT * FROM buddy_lists WHERE did = ${did}
  `;
  return rows[0];
}
