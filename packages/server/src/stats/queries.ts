import type { Sql } from '../db/client.js';

export async function incUniqueLogins(sql: Sql): Promise<void> {
  await sql`
    INSERT INTO daily_stats (day, unique_logins)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (day) DO UPDATE SET unique_logins = daily_stats.unique_logins + 1
  `;
}

export async function incMessagesSent(sql: Sql): Promise<void> {
  await sql`
    INSERT INTO daily_stats (day, messages_sent)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (day) DO UPDATE SET messages_sent = daily_stats.messages_sent + 1
  `;
}

export async function incRoomsCreated(sql: Sql): Promise<void> {
  await sql`
    INSERT INTO daily_stats (day, rooms_created)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (day) DO UPDATE SET rooms_created = daily_stats.rooms_created + 1
  `;
}

export async function incDmsSent(sql: Sql): Promise<void> {
  await sql`
    INSERT INTO daily_stats (day, dms_sent)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (day) DO UPDATE SET dms_sent = daily_stats.dms_sent + 1
  `;
}

export async function updatePeakWsConns(sql: Sql, count: number): Promise<void> {
  await sql`
    INSERT INTO daily_stats (day, peak_ws_conns)
    VALUES (CURRENT_DATE, ${count})
    ON CONFLICT (day) DO UPDATE SET peak_ws_conns = GREATEST(daily_stats.peak_ws_conns, ${count})
  `;
}
