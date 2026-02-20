import type { Sql, JsonValue } from '../db/client.js';

export interface PollRow {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  room_id: string;
  channel_id: string;
  question: string;
  options: string[];
  allow_multiple: boolean;
  expires_at: Date | null;
  created_at: Date;
  indexed_at: Date;
}

export interface InsertPollInput {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  roomId: string;
  channelId: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  expiresAt?: string;
  createdAt: string;
}

export async function insertPoll(sql: Sql, input: InsertPollInput): Promise<void> {
  await sql`
    INSERT INTO polls (id, uri, did, cid, room_id, channel_id, question, options, allow_multiple, expires_at, created_at)
    VALUES (
      ${input.id},
      ${input.uri},
      ${input.did},
      ${input.cid},
      ${input.roomId},
      ${input.channelId},
      ${input.question},
      ${sql.json(input.options as JsonValue)},
      ${input.allowMultiple},
      ${input.expiresAt ?? null},
      ${input.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      cid = EXCLUDED.cid,
      channel_id = EXCLUDED.channel_id,
      question = EXCLUDED.question,
      options = EXCLUDED.options,
      allow_multiple = EXCLUDED.allow_multiple,
      expires_at = EXCLUDED.expires_at,
      indexed_at = NOW()
  `;
}

export async function deletePoll(sql: Sql, uri: string): Promise<void> {
  await sql`DELETE FROM polls WHERE uri = ${uri}`;
}

export async function getPollById(sql: Sql, id: string): Promise<PollRow | undefined> {
  const rows = await sql<PollRow[]>`SELECT * FROM polls WHERE id = ${id}`;
  return rows[0];
}

export async function getPollsByRoom(sql: Sql, roomId: string): Promise<PollRow[]> {
  return sql<PollRow[]>`
    SELECT * FROM polls
    WHERE room_id = ${roomId}
    ORDER BY created_at DESC
  `;
}

export async function getPollsByChannel(sql: Sql, channelId: string): Promise<PollRow[]> {
  return sql<PollRow[]>`
    SELECT * FROM polls
    WHERE channel_id = ${channelId}
    ORDER BY created_at DESC
  `;
}

// -- Votes --

export interface VoteRow {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  poll_id: string;
  selected_options: number[];
  created_at: Date;
  indexed_at: Date;
}

export interface InsertVoteInput {
  id: string;
  uri: string;
  did: string;
  cid: string | null;
  pollId: string;
  selectedOptions: number[];
  createdAt: string;
}

export async function insertVote(sql: Sql, input: InsertVoteInput): Promise<void> {
  await sql`
    INSERT INTO poll_votes (id, uri, did, cid, poll_id, selected_options, created_at)
    VALUES (
      ${input.id},
      ${input.uri},
      ${input.did},
      ${input.cid},
      ${input.pollId},
      ${sql.json(input.selectedOptions as JsonValue)},
      ${input.createdAt}
    )
    ON CONFLICT (poll_id, did) DO UPDATE SET
      id = EXCLUDED.id,
      uri = EXCLUDED.uri,
      cid = EXCLUDED.cid,
      selected_options = EXCLUDED.selected_options,
      indexed_at = NOW()
  `;
}

export async function deleteVote(sql: Sql, uri: string): Promise<void> {
  await sql`DELETE FROM poll_votes WHERE uri = ${uri}`;
}

export async function getVotesForPoll(sql: Sql, pollId: string): Promise<VoteRow[]> {
  return sql<VoteRow[]>`
    SELECT * FROM poll_votes WHERE poll_id = ${pollId}
  `;
}

export interface VoteTally {
  option_index: number;
  count: string;
}

export async function getVoteTallies(sql: Sql, pollId: string): Promise<Record<number, number>> {
  const rows = await sql<VoteTally[]>`
    SELECT opt::int AS option_index, COUNT(*)::text AS count
    FROM poll_votes, jsonb_array_elements(selected_options) AS opt
    WHERE poll_id = ${pollId}
    GROUP BY opt
  `;
  const tallies: Record<number, number> = {};
  for (const row of rows) {
    tallies[row.option_index] = Number(row.count);
  }
  return tallies;
}

export async function getTotalVoters(sql: Sql, pollId: string): Promise<number> {
  const rows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM poll_votes WHERE poll_id = ${pollId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getUserVote(
  sql: Sql,
  pollId: string,
  did: string,
): Promise<VoteRow | undefined> {
  const rows = await sql<VoteRow[]>`
    SELECT * FROM poll_votes WHERE poll_id = ${pollId} AND did = ${did}
  `;
  return rows[0];
}
