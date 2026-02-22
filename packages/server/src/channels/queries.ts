import type { Sql } from '../db/client.js';

export interface ChannelRow {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  room_id: string;
  name: string;
  description: string | null;
  position: number;
  post_policy: string;
  is_default: boolean;
  created_at: Date;
  indexed_at: Date;
}

export interface CreateChannelInput {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  roomId: string;
  name: string;
  description?: string;
  position?: number;
  postPolicy?: string;
  isDefault?: boolean;
  createdAt: string;
}

export async function createChannel(sql: Sql, input: CreateChannelInput): Promise<void> {
  await sql`
    INSERT INTO channels (id, uri, did, cid, room_id, name, description, position, post_policy, is_default, created_at)
    VALUES (
      ${input.id},
      ${input.uri},
      ${input.did},
      ${input.cid},
      ${input.roomId},
      ${input.name},
      ${input.description ?? null},
      ${input.position ?? 0},
      ${input.postPolicy ?? 'everyone'},
      ${input.isDefault ?? false},
      ${input.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      cid = EXCLUDED.cid,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      position = EXCLUDED.position,
      post_policy = EXCLUDED.post_policy,
      indexed_at = NOW()
  `;
}

export async function deleteChannel(sql: Sql, uri: string): Promise<void> {
  await sql`DELETE FROM channels WHERE uri = ${uri}`;
}

export async function getChannelById(sql: Sql, id: string): Promise<ChannelRow | undefined> {
  const rows = await sql<ChannelRow[]>`SELECT * FROM channels WHERE id = ${id}`;
  return rows[0];
}

export async function getChannelByUri(sql: Sql, uri: string): Promise<ChannelRow | undefined> {
  const rows = await sql<ChannelRow[]>`SELECT * FROM channels WHERE uri = ${uri}`;
  return rows[0];
}

export async function getChannelsByRoom(sql: Sql, roomId: string): Promise<ChannelRow[]> {
  return sql<ChannelRow[]>`
    SELECT * FROM channels
    WHERE room_id = ${roomId}
    ORDER BY position ASC, created_at ASC
  `;
}

export async function getDefaultChannel(sql: Sql, roomId: string): Promise<ChannelRow | undefined> {
  const rows = await sql<ChannelRow[]>`
    SELECT * FROM channels
    WHERE room_id = ${roomId} AND is_default = true
    LIMIT 1
  `;
  return rows[0];
}

/**
 * Auto-create the "general" default channel for a room if one doesn't exist.
 * Uses a synthetic URI so it's identifiable as server-created.
 */
export async function ensureDefaultChannel(
  sql: Sql,
  roomId: string,
  roomUri: string,
  did: string,
  createdAt: string,
): Promise<ChannelRow> {
  const existing = await getDefaultChannel(sql, roomId);
  if (existing) return existing;

  const id = `${roomId}_general`;
  const uri = `synthetic://default-channel/${roomId}`;

  await createChannel(sql, {
    id,
    uri,
    did,
    cid: null,
    roomId,
    name: 'general',
    position: 0,
    postPolicy: 'everyone',
    isDefault: true,
    createdAt,
  });

  const created = await getChannelById(sql, id);
  if (!created) throw new Error(`Failed to ensure default channel for room ${roomId}`);
  return created;
}
